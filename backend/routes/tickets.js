const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicketStatus } = require('../controllers/ticketController');
const { auth } = require('../middleware/auth');

// POST /api/tickets/create
router.post('/create', auth, createTicket);

// GET /api/tickets
router.get('/', auth, getTickets);

// PUT /api/tickets/update-status
router.put('/update-status', auth, updateTicketStatus);

module.exports = router;
