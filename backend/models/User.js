const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model - GymBuddy
 * Supports roles: user, gymOwner, admin
 * Extended with fitness profile, OTP, gamification, and safety fields
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        select: false
    },
    googleId: { type: String, sparse: true, unique: true },
    role: {
        type: String,
        enum: ['user', 'gymOwner', 'admin'],
        default: 'user'
    },
    // Required at signup
    profilePhoto: {
        type: String,
        default: ''
    },
    coverPhoto: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    age: {
        type: Number,
        min: 16,
        max: 80
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    location: {
        city: { type: String, trim: true },
        area: { type: String, trim: true }
    },
    coordinates: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null }
    },
    fitnessGoals: [{
        type: String,
        enum: ['weight-loss', 'muscle-gain', 'general-fitness', 'flexibility', 'endurance', 'strength']
    }],
    workoutType: [{
        type: String,
        enum: ['strength', 'cardio', 'hybrid', 'crossfit', 'yoga', 'pilates', 'boxing', 'swimming']
    }],
    preferredWorkoutTime: {
        type: String,
        enum: ['early-morning', 'morning', 'afternoon', 'evening', 'night']
    },
    experienceLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    partnerGenderPreference: {
        type: String,
        enum: ['any', 'male', 'female', 'no-preference'],
        default: 'any'
    },
    hobbies: [{ type: String, trim: true }],
    motivation: { type: String, trim: true, maxlength: 500 },
    bio: {
        type: String,
        trim: true,
        maxlength: 500
    },
    socialLinks: {
        instagram: { type: String, trim: true },
        twitter: { type: String, trim: true },
        linkedin: { type: String, trim: true }
    },
    // Legacy - keep for backward compat
    profilePicture: { type: String, default: '' },
    isProfileComplete: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, default: null },
    // OTP for email verify & password reset
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpPurpose: { type: String, enum: ['email-verify', 'password-reset'], select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    // Gamification
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCheckInAt: { type: Date },
    badges: [{ type: String }],
    // Safety & moderation
    isSuspended: { type: Boolean, default: false },
    suspendedUntil: { type: Date }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual: get profile photo URL (profilePhoto takes precedence over profilePicture)
userSchema.virtual('avatar').get(function () {
    return this.profilePhoto || this.profilePicture || '';
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.checkProfileComplete = function () {
    const base = !!(this.age && this.gender && this.location?.city &&
        this.fitnessGoals?.length > 0 && this.preferredWorkoutTime &&
        this.experienceLevel);
    const hasPhoto = !!(this.profilePhoto || this.profilePicture);
    return base && hasPhoto;
};

module.exports = mongoose.model('User', userSchema);
