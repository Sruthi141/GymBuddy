const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { createCheckoutSession, getMyPayments, getOwnerSummary } = require('../controllers/paymentController');

// All payment routes except webhook require auth
router.post(
    '/create-checkout-session',
    auth,
    [
        body('gymId').notEmpty().withMessage('gymId required'),
        body('amount').isFloat({ min: 1 }).withMessage('amount must be positive')
    ],
    validate,
    createCheckoutSession
);

router.get('/me', auth, getMyPayments);
router.get('/owner-summary', auth, getOwnerSummary);

module.exports = router;
