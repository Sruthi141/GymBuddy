const User = require('../models/User');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const { findCompatibleUsers, calculateCompatibility } = require('../services/matchingService');

/**
 * @route   GET /api/matches
 * @desc    Get compatible matches for current user
 * @access  Private
 */
const getMatches = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user._id);

        // Get all users with complete profiles (excluding current user)
        const allUsers = await User.find({
            _id: { $ne: currentUser._id },
            role: 'user',
            isProfileComplete: true
        });

        // Calculate compatibility scores (strictly based on the new filter)
        let compatibleUsers = findCompatibleUsers(currentUser, allUsers);

        // Get existing match records to show status
        const existingMatches = await Match.find({
            $or: [
                { userA: currentUser._id },
                { userB: currentUser._id }
            ]
        });

        // We must ensure that anyone we have an existing match with (especially pending ones they sent us)
        // is included in the list, even if our strict compatibility rule normally filters them out.
        const existingMatchUserIds = new Set();
        existingMatches.forEach(m => {
            if (m.userA.toString() !== currentUser._id.toString()) existingMatchUserIds.add(m.userA.toString());
            if (m.userB.toString() !== currentUser._id.toString()) existingMatchUserIds.add(m.userB.toString());
        });

        // Re-add missing existing match users (e.g. if a match was sent before filter change)
        const missingUserIds = Array.from(existingMatchUserIds).filter(id => 
            !compatibleUsers.some(cu => cu.user._id.toString() === id)
        );

        if (missingUserIds.length > 0) {
            const missingUsers = await User.find({ _id: { $in: missingUserIds } });
            missingUsers.forEach(u => {
                const { totalScore, breakdown } = calculateCompatibility(currentUser, u);
                compatibleUsers.push({
                    user: u,
                    compatibilityScore: totalScore,
                    scoreBreakdown: breakdown
                });
            });
        }

        // Merge match status info
        const matchesWithStatus = compatibleUsers.map(match => {
            const existingMatch = existingMatches.find(m =>
            (m.userA.toString() === match.user._id.toString() ||
                m.userB.toString() === match.user._id.toString())
            );

            return {
                ...match,
                matchId: existingMatch?._id || null,
                matchStatus: existingMatch?.status || null,
                isInitiator: existingMatch?.initiatedBy?.toString() === currentUser._id.toString()
            };
        });

        res.json({ matches: matchesWithStatus });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/matches/request
 * @desc    Send a match/collaboration request to another user
 * @access  Private
 */
const sendRequest = async (req, res, next) => {
    try {
        const { targetUserId } = req.body;
        const currentUser = await User.findById(req.user._id);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (targetUserId === currentUser._id.toString()) {
            return res.status(400).json({ message: 'Cannot match with yourself' });
        }

        // Check if match already exists
        const existingMatch = await Match.findOne({
            $or: [
                { userA: currentUser._id, userB: targetUserId },
                { userA: targetUserId, userB: currentUser._id }
            ]
        });

        if (existingMatch) {
            return res.status(400).json({ message: 'Match request already exists' });
        }

        // Calculate compatibility
        const { totalScore, breakdown } = calculateCompatibility(currentUser, targetUser);

        // Create match
        const match = await Match.create({
            userA: currentUser._id,
            userB: targetUserId,
            compatibilityScore: totalScore,
            scoreBreakdown: breakdown,
            initiatedBy: currentUser._id,
            status: 'pending'
        });

        // Create notification for target user
        await Notification.create({
            user: targetUserId,
            type: 'match-request',
            message: `${currentUser.name} sent you a match request! (${totalScore}% compatible)`,
            relatedId: match._id,
            relatedModel: 'Match'
        });

        res.status(201).json({
            message: 'Match request sent',
            match
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/matches/respond
 * @desc    Accept or reject a match request
 * @access  Private
 */
const respondToRequest = async (req, res, next) => {
    try {
        const { matchId, action } = req.body; // action: 'accept' or 'reject'

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Action must be accept or reject' });
        }

        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Only the non-initiator can respond
        const isRecipient = match.userB.toString() === req.user._id.toString() ||
            (match.userA.toString() === req.user._id.toString() &&
                match.initiatedBy.toString() !== req.user._id.toString());

        if (!isRecipient) {
            return res.status(403).json({ message: 'Only the recipient can respond to this request' });
        }

        match.status = action === 'accept' ? 'accepted' : 'rejected';
        await match.save();

        // Notify the initiator
        const notificationType = action === 'accept' ? 'match-accepted' : 'match-rejected';
        await Notification.create({
            user: match.initiatedBy,
            type: notificationType,
            message: `${req.user.name} ${action}ed your match request!`,
            relatedId: match._id,
            relatedModel: 'Match'
        });

        res.json({
            message: `Match request ${action}ed`,
            match
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMatches,
    sendRequest,
    respondToRequest
};
