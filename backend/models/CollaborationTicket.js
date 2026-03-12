const mongoose = require('mongoose');

/**
 * CollaborationTicket Model
 * Tracks workout collaboration between matched users
 * Status flow: pending → confirmed → active → completed/cancelled
 */
const collaborationTicketSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    },
    gym: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    workoutDate: {
        type: Date
    },
    workoutType: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    statusHistory: [{
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CollaborationTicket', collaborationTicketSchema);
