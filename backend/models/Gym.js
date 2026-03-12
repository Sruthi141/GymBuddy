const mongoose = require('mongoose');

/**
 * Gym Model
 * Represents a gym listed by a gym owner
 * Contains location coordinates for proximity features
 */
const gymSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Gym name is required'],
        trim: true,
        maxlength: 100
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        area: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: undefined
        }
    },
    photos: [{
        type: String // URLs to gym photos
    }],
    pricing: {
        monthly: { type: Number },
        quarterly: { type: Number },
        yearly: { type: Number },
        dayPass: { type: Number }
    },
    facilities: [{
        type: String,
        enum: [
            'cardio', 'weights', 'crossfit', 'yoga', 'swimming',
            'sauna', 'steam-room', 'personal-training', 'group-classes',
            'parking', 'shower', 'locker', 'cafe', 'basketball-court'
        ]
    }],
    contact: {
        phone: { type: String, trim: true },
        email: { type: String, trim: true },
        website: { type: String, trim: true }
    },
    openingHours: {
        weekdays: {
            open: { type: String, default: '06:00' },
            close: { type: String, default: '22:00' }
        },
        weekends: {
            open: { type: String, default: '07:00' },
            close: { type: String, default: '20:00' }
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalVisitors: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'rejected'],
        default: 'pending_approval'
    },
    membershipPlans: [{
        name: { type: String },
        type: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
        price: { type: Number },
        features: [{ type: String }]
    }]
}, {
    timestamps: true
});

// 2dsphere index enables $near and $geoWithin geospatial queries
gymSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Gym', gymSchema);
