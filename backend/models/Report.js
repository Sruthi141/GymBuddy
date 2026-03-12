const mongoose = require('mongoose');

/**
 * Report Model - User/post reports for moderation
 */
const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    reason: { type: String },
    details: { type: String },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'action_taken'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
