const User = require('../models/User');
const Gym = require('../models/Gym');
const Match = require('../models/Match');
const CollaborationTicket = require('../models/CollaborationTicket');

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform statistics
 * @access  Private/Admin
 */
const getPlatformStats = async (req, res, next) => {
    try {
        const [totalUsers, totalGyms, totalMatches, totalTickets] = await Promise.all([
            User.countDocuments(),
            Gym.countDocuments(),
            Match.countDocuments(),
            CollaborationTicket.countDocuments()
        ]);

        const activeTickets = await CollaborationTicket.countDocuments({ status: 'active' });
        const completedTickets = await CollaborationTicket.countDocuments({ status: 'completed' });
        const acceptedMatches = await Match.countDocuments({ status: 'accepted' });

        // Users by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Recent signups (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentSignups = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        res.json({
            stats: {
                totalUsers,
                totalGyms,
                totalMatches,
                totalTickets,
                activeTickets,
                completedTickets,
                acceptedMatches,
                recentSignups,
                usersByRole: usersByRole.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPlatformStats
};
