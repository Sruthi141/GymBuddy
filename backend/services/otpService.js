const crypto = require('crypto');

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_PURPOSE = {
    EMAIL_VERIFY: 'email-verify',
    PASSWORD_RESET: 'password-reset'
};

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Set OTP expiry (10 minutes from now)
 */
const getOTPExpiry = () => {
    const exp = new Date();
    exp.setMinutes(exp.getMinutes() + OTP_EXPIRY_MINUTES);
    return exp;
};

/**
 * Check if OTP is valid (not expired)
 */
const isOTPValid = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date() < new Date(expiresAt);
};

module.exports = {
    generateOTP,
    getOTPExpiry,
    isOTPValid,
    OTP_LENGTH,
    OTP_EXPIRY_MINUTES,
    OTP_PURPOSE
};
