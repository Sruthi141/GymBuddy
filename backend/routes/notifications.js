const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// GET /api/notifications
router.get('/', auth, getNotifications);

// PUT /api/notifications/read-all
router.put('/read-all', auth, markAllAsRead);

// PUT /api/notifications/:id/read
router.put('/:id/read', auth, markAsRead);

module.exports = router;
