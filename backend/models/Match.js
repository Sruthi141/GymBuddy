const mongoose = require('mongoose');

/**
 * Match Model
 * Tracks match requests between users with compatibility scores
 * Status flow: pending → accepted/rejected
 */
const matchSchema = new mongoose.Schema({
    userA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    compatibilityScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    scoreBreakdown: {
        location: { type: Number, default: 0 },
        workoutTime: { type: Number, default: 0 },
        fitnessGoal: { type: Number, default: 0 },
        experience: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Prevent duplicate match requests
matchSchema.index({ userA: 1, userB: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
