const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { body } = require('express-validator');
const User = require('../models/User');
const { sendOTP } = require('../services/emailService');
const { generateOTP, getOTPExpiry, isOTPValid, OTP_PURPOSE } = require('../services/otpService');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const normalizeEmail = (email) => email?.trim().toLowerCase();

const toUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePhoto: user.profilePhoto || user.profilePicture,
    isProfileComplete: user.isProfileComplete,
    isEmailVerified: user.isEmailVerified
});

/**
 * @route   POST /api/auth/register
 * @desc    Register with required profile photo (multipart)
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const profilePhoto = req.file?.filename
            ? `/uploads/${req.file.filename}`
            : req.body.profilePhoto;

        console.log('📝 [REGISTER] Incoming request', {
            email: normalizedEmail,
            role,
            hasFile: !!req.file,
        });

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        const userRole = role || 'user';

        if (!profilePhoto && userRole !== 'admin') {
            return res.status(400).json({ message: 'Profile photo is required.' });
        }

        const otp = generateOTP();

        const user = await User.create({
            name: name?.trim(),
            email: normalizedEmail,
            password: password || crypto.randomBytes(32).toString('hex'),
            role: userRole,
            profilePhoto: profilePhoto || '',
            profilePicture: profilePhoto || '',
            isEmailVerified: false,
            otp,
            otpExpires: getOTPExpiry(),
            otpPurpose: OTP_PURPOSE.EMAIL_VERIFY
        });

        try {
            await sendOTP(user.email, user.name, otp, 'email-verify');
        } catch (mailErr) {
            console.error('❌ [REGISTER] OTP email failed:', mailErr.message);
            return res.status(503).json({
                message: 'Registration succeeded but we could not send the verification email. Please try "Resend OTP" or check your email configuration.'
            });
        }

        console.log('✅ [REGISTER] User created and OTP sent', { id: user._id, email: user.email });

        res.status(201).json({
            message: 'Registration successful! Please verify your email with the OTP sent to your inbox.',
            needsOtp: true,
            email: user.email
        });
    } catch (error) {
        console.error('❌ [REGISTER] Unexpected error:', error.message);
        next(error);
    }
};

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth sign-in/sign-up
 * @access  Public
 */
const googleAuth = async (req, res, next) => {
    try {
        const { credential } = req.body;
        const clientId = process.env.GOOGLE_CLIENT_ID;

        if (!credential || !clientId) {
            return res.status(400).json({ message: 'Google sign-in not configured or invalid request.' });
        }

        const client = new OAuth2Client(clientId);
        let payload;

        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: clientId
            });
            payload = ticket.getPayload();
        } catch (err) {
            console.error('Google token verify failed:', err.message);
            return res.status(401).json({ message: 'Invalid Google credential.' });
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ message: 'Google account must have an email.' });
        }

        const normalizedEmail = normalizeEmail(email);
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            if (user.googleId && user.googleId !== googleId) {
                return res.status(400).json({ message: 'This email is linked to a different Google account.' });
            }

            user.googleId = googleId;

            if (picture && !user.profilePhoto) {
                user.profilePhoto = picture;
                user.profilePicture = picture;
            }

            user.isEmailVerified = true;

            if (!user.name || user.name === '') {
                user.name = name || 'User';
            }

            await user.save();
        } else {
            user = await User.create({
                name: (name || normalizedEmail.split('@')[0]).trim().slice(0, 50),
                email: normalizedEmail,
                googleId,
                profilePhoto: picture || '',
                profilePicture: picture || '',
                password: crypto.randomBytes(32).toString('hex'),
                role: 'user',
                isEmailVerified: true
            });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: toUserResponse(user)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP (email verify or password reset)
 * @access  Public
 */
const sendOtp = async (req, res, next) => {
    try {
        const { email, purpose } = req.body;
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpires +otpPurpose');

        if (!user) {
            return res.status(400).json({ message: 'No account found with this email.' });
        }

        const otpPurpose = purpose === 'password-reset'
            ? OTP_PURPOSE.PASSWORD_RESET
            : OTP_PURPOSE.EMAIL_VERIFY;

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpires = getOTPExpiry();
        user.otpPurpose = otpPurpose;
        await user.save();

        try {
            await sendOTP(
                user.email,
                user.name,
                otp,
                otpPurpose === OTP_PURPOSE.PASSWORD_RESET ? 'password-reset' : 'email-verify'
            );
        } catch (mailErr) {
            console.error('OTP email failed:', mailErr.message);
            return res.status(503).json({
                message: 'Could not send OTP email. Please try again or check your email configuration.'
            });
        }

        res.json({
            message: 'OTP sent to your email.',
            email: user.email
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and complete email verification or return token
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpires +otpPurpose');

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or OTP.' });
        }

        if (!user.otp || user.otp !== String(otp).trim()) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        if (!isOTPValid(user.otpExpires)) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (user.otpPurpose === OTP_PURPOSE.EMAIL_VERIFY) {
            user.isEmailVerified = true;
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpPurpose = undefined;
        await user.save();

        const token = generateToken(user._id);

        res.json({
            message: 'Email verified successfully!',
            token,
            user: toUserResponse(user)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Please verify your email first. Check your inbox for the OTP.',
                needsVerification: true,
                email: user.email
            });
        }

        if (user.isSuspended && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
            return res.status(403).json({ message: 'Your account has been suspended.' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: toUserResponse(user)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request OTP for password reset
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: 'No account found with this email.' });
        }

        if (user.googleId) {
            return res.status(400).json({ message: 'This account uses Google sign-in. Use Google to log in.' });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = getOTPExpiry();
        user.otpPurpose = OTP_PURPOSE.PASSWORD_RESET;

        await user.save({ validateBeforeSave: false });

        try {
            await sendOTP(user.email, user.name, otp, 'password-reset');
        } catch (mailErr) {
            console.error('Password reset OTP email failed:', mailErr.message);
            return res.status(503).json({
                message: 'Could not send password reset email. Please try again or check your email configuration.'
            });
        }

        res.json({
            message: 'Password reset OTP sent to your email.',
            email: user.email
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({
            email: normalizedEmail
        }).select('+otp +otpExpires +otpPurpose +password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or OTP.' });
        }

        if (!user.otp || user.otp !== String(otp).trim()) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        if (!isOTPValid(user.otpExpires)) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (user.otpPurpose !== OTP_PURPOSE.PASSWORD_RESET) {
            return res.status(400).json({ message: 'Invalid OTP purpose.' });
        }

        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpPurpose = undefined;

        await user.save();

        const token = generateToken(user._id);

        res.json({
            message: 'Password reset successfully. You can now log in.',
            token,
            user: toUserResponse(user)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify gym owner email via link (legacy)
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ emailVerifyToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }

        user.isEmailVerified = true;
        user.emailVerifyToken = null;
        await user.save();

        res.json({
            message: 'Email verified successfully!',
            user: toUserResponse(user)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ user: toUserResponse(user) });
    } catch (error) {
        next(error);
    }
};

// Validation
const passwordStrong = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
        ? true
        : 'Password must be 8+ chars with 1 upper, 1 lower, 1 number, 1 special';

const registerValidation = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').custom(passwordStrong)
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const sendOtpValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('purpose').optional().isIn(['email-verify', 'password-reset'])
];

const verifyOtpValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

const forgotPasswordValidation = [
    body('email').isEmail().withMessage('Valid email is required')
];

const resetPasswordValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').custom(passwordStrong)
];

module.exports = {
    register,
    googleAuth,
    sendOtp,
    verifyOtp,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
    getMe,
    registerValidation,
    loginValidation,
    sendOtpValidation,
    verifyOtpValidation,
    forgotPasswordValidation,
    resetPasswordValidation
};