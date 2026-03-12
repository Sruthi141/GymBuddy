const Notification = require('../models/Notification');

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
    try {
        const { unreadOnly } = req.query;
        const filter = { user: req.user._id };
        if (unreadOnly === 'true') filter.read = false;

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            read: false
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ notification });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
