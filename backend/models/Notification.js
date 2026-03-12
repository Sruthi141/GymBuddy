const mongoose = require('mongoose');

/**
 * Notification Model
 * In-app notification system for match requests, ticket updates, etc.
 */
const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'match-request', 'match-accepted', 'match-rejected',
            'ticket-created', 'ticket-confirmed', 'ticket-active',
            'ticket-completed', 'ticket-cancelled',
            'gym-selected', 'nearby-gym', 'system'
        ],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    relatedModel: {
        type: String,
        enum: ['Match', 'CollaborationTicket', 'Gym', 'User']
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient querying of user's unread notifications
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
