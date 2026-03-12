const mongoose = require('mongoose');

/**
 * Post Model - Social feed
 * Users and gym owners can post gym photos, progress, updates, events
 */
const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gym: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym'
    },
    type: {
        type: String,
        enum: ['gym-photo', 'progress', 'transformation', 'update', 'event'],
        default: 'gym-photo'
    },
    content: {
        type: String,
        maxlength: 2000
    },
    media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' }
    }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, maxlength: 500, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPinned: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['active', 'hidden', 'reported'],
        default: 'active'
    },
    reportCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ gym: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
