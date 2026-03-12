const express = require('express');
const router = express.Router();
const { getMatches, sendRequest, respondToRequest } = require('../controllers/matchController');
const { auth } = require('../middleware/auth');

// GET /api/matches
router.get('/', auth, getMatches);

// POST /api/matches/request
router.post('/request', auth, sendRequest);

// POST /api/matches/respond
router.post('/respond', auth, respondToRequest);

module.exports = router;
