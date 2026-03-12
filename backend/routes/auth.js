const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
    register, login, getMe, verifyEmail, sendOtp, verifyOtp, googleAuth,
    forgotPassword, resetPassword,
    registerValidation, loginValidation, sendOtpValidation, verifyOtpValidation,
    forgotPasswordValidation, resetPasswordValidation
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadSingle } = require('../middleware/upload');

// POST /api/auth/register (multipart for photo)
router.post('/register', (req, res, next) => {
    uploadSingle('profilePhoto')(req, res, (err) => {
        if (err) return next(err);
        if (req.body?.role !== 'admin' && !req.file && !req.body?.profilePhoto) {
            return res.status(400).json({ message: 'Profile photo is required.' });
        }
        next();
    });
}, registerValidation, validate, register);

// POST /api/auth/google
router.post('/google', body('credential').notEmpty().withMessage('Google credential required'), validate, googleAuth);

// POST /api/auth/send-otp AND /auth/resend-otp (alias)
router.post('/send-otp', sendOtpValidation, validate, sendOtp);
router.post('/resend-otp', sendOtpValidation, validate, sendOtp);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtpValidation, validate, verifyOtp);

// POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

// GET /api/auth/me
router.get('/me', auth, getMe);

// GET /api/auth/verify-email/:token (link-based verification)
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
