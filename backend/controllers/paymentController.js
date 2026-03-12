const paymentService = require('../services/paymentService');

/**
 * POST /api/payments/create-checkout-session
 * Create Stripe checkout session for gym membership
 */
const createCheckoutSession = async (req, res, next) => {
    try {
        const { gymId, amount, periodStart, periodEnd, successUrl, cancelUrl } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!gymId || !amount || amount <= 0) {
            return res.status(400).json({ message: 'gymId and amount are required' });
        }

        const start = periodStart ? new Date(periodStart) : new Date();
        const end = periodEnd ? new Date(periodEnd) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

        const result = await paymentService.createCheckoutSession(
            userId,
            gymId,
            Number(amount),
            start,
            end,
            successUrl,
            cancelUrl
        );

        res.json({
            sessionId: result.sessionId,
            url: result.url,
            paymentId: result.paymentId
        });
    } catch (error) {
        if (error.message?.includes('Stripe')) {
            return res.status(503).json({ message: error.message });
        }
        next(error);
    }
};

/**
 * POST /api/payments/webhook
 * Stripe webhook - must use raw body for signature verification
 * Mounted separately with express.raw()
 */
const webhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.rawBody ?? req.body;
    if (!signature) {
        return res.status(400).json({ message: 'Missing stripe-signature' });
    }

    try {
        await paymentService.handleWebhook(rawBody, signature);
        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err.message);
        res.status(400).json({ message: err.message });
    }
};

/**
 * GET /api/payments/me
 * Get current user's payment history
 */
const getMyPayments = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const payments = await paymentService.getMyPayments(userId);
        res.json({ payments });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/payments/owner-summary
 * Get payment summary for gym owner
 */
const getOwnerSummary = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const summary = await paymentService.getOwnerSummary(userId);
        res.json(summary);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCheckoutSession,
    webhook,
    getMyPayments,
    getOwnerSummary
};
