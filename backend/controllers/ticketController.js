const CollaborationTicket = require('../models/CollaborationTicket');
const Match = require('../models/Match');
const Gym = require('../models/Gym');
const Notification = require('../models/Notification');

/**
 * @route   POST /api/tickets/create
 * @desc    Create a collaboration ticket from an accepted match
 * @access  Private
 */
const createTicket = async (req, res, next) => {
    try {
        const { matchId, workoutDate, workoutType, notes } = req.body;

        // Verify match exists and is accepted
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        if (match.status !== 'accepted') {
            return res.status(400).json({ message: 'Match must be accepted before creating a ticket' });
        }

        // Check if ticket already exists for this match
        const existingTicket = await CollaborationTicket.findOne({
            match: matchId,
            status: { $nin: ['completed', 'cancelled'] }
        });
        if (existingTicket) {
            return res.status(400).json({ message: 'Active ticket already exists for this match' });
        }

        const ticket = await CollaborationTicket.create({
            participants: [match.userA, match.userB],
            createdBy: req.user._id,
            match: matchId,
            status: 'pending',
            workoutDate,
            workoutType,
            notes,
            statusHistory: [{
                status: 'pending',
                changedBy: req.user._id
            }]
        });

        // Notify the other participant
        const otherUserId = match.userA.toString() === req.user._id.toString()
            ? match.userB : match.userA;

        await Notification.create({
            user: otherUserId,
            type: 'ticket-created',
            message: `${req.user.name} created a collaboration ticket!`,
            relatedId: ticket._id,
            relatedModel: 'CollaborationTicket'
        });

        await ticket.populate('participants', 'name email profilePicture');

        res.status(201).json({
            message: 'Collaboration ticket created',
            ticket
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/tickets
 * @desc    Get all tickets for current user
 * @access  Private
 */
const getTickets = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = { participants: req.user._id };
        if (status) filter.status = status;

        const tickets = await CollaborationTicket.find(filter)
            .populate('participants', 'name email profilePicture experienceLevel')
            .populate('createdBy', 'name')
            .populate('gym', 'name address')
            .populate('match', 'compatibilityScore')
            .sort({ updatedAt: -1 });

        res.json({ tickets });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/tickets/update-status
 * @desc    Update ticket status (confirm, activate, complete, cancel)
 * @access  Private
 */
const updateTicketStatus = async (req, res, next) => {
    try {
        const { ticketId, status, gymId } = req.body;

        const ticket = await CollaborationTicket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Verify user is a participant
        if (!ticket.participants.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to update this ticket' });
        }

        // Validate status transitions
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['active', 'cancelled'],
            'active': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': []
        };

        if (!validTransitions[ticket.status]?.includes(status)) {
            return res.status(400).json({
                message: `Cannot transition from ${ticket.status} to ${status}`
            });
        }

        // If setting to active, a gym must be selected
        if (status === 'active') {
            if (!gymId && !ticket.gym) {
                return res.status(400).json({ message: 'A gym must be selected to activate the ticket' });
            }
            if (gymId) {
                const gym = await Gym.findById(gymId);
                if (!gym) {
                    return res.status(404).json({ message: 'Gym not found' });
                }
                ticket.gym = gymId;
                // Increment gym visitor count
                gym.totalVisitors += 1;
                await gym.save();
            }
        }

        if (status === 'completed') {
            ticket.completedAt = new Date();
        }

        ticket.status = status;
        ticket.statusHistory.push({
            status,
            changedBy: req.user._id
        });

        await ticket.save();

        // Notify other participant
        const otherUserId = ticket.participants.find(
            p => p.toString() !== req.user._id.toString()
        );

        const statusMessages = {
            'confirmed': `${req.user.name} confirmed the collaboration!`,
            'active': `${req.user.name} selected a gym. Let's go!`,
            'completed': `${req.user.name} marked the workout as completed!`,
            'cancelled': `${req.user.name} cancelled the collaboration.`
        };

        await Notification.create({
            user: otherUserId,
            type: `ticket-${status}`,
            message: statusMessages[status],
            relatedId: ticket._id,
            relatedModel: 'CollaborationTicket'
        });

        await ticket.populate('participants', 'name email profilePicture');
        await ticket.populate('gym', 'name address');

        res.json({
            message: `Ticket ${status}`,
            ticket
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTicket,
    getTickets,
    updateTicketStatus
};
