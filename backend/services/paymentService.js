const Stripe = require('stripe');
const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const Gym = require('../models/Gym');
const User = require('../models/User');
const { sendPaymentReminder } = require('./emailService');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

/**
 * Create a Stripe checkout session for a gym membership payment
 */
async function createCheckoutSession(userId, gymId, amount, periodStart, periodEnd, successUrl, cancelUrl) {
    if (!stripe) {
        throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in .env');
    }

    const gym = await Gym.findById(gymId);
    if (!gym) throw new Error('Gym not found');

    const user = await User.findById(userId).select('name email');
    if (!user) throw new Error('User not found');

    const dueDate = new Date(periodEnd);
    const payment = await Payment.create({
        user: userId,
        gym: gymId,
        amount,
        currency: 'INR',
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        dueDate,
        status: 'pending'
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const photoUrl = gym.photos?.length
        ? (gym.photos[0].startsWith('http') ? gym.photos[0] : `${baseUrl}${gym.photos[0].startsWith('/') ? '' : '/'}${gym.photos[0]}`)
        : null;
    const productImages = photoUrl ? [photoUrl] : [];

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'inr',
                product_data: {
                    name: `${gym.name} - Monthly Membership`,
                    description: `Membership for ${user.name} (${new Date(periodStart).toLocaleDateString()} - ${new Date(periodEnd).toLocaleDateString()})`,
                    images: productImages
                },
                unit_amount: Math.round(amount * 100) // Stripe uses paise for INR
            },
            quantity: 1
        }],
        mode: 'payment',
        success_url: successUrl || `${process.env.FRONTEND_URL}/payments?success=true`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payments?canceled=true`,
        metadata: {
            paymentId: payment._id.toString(),
            userId: userId.toString(),
            gymId: gymId.toString()
        }
    });

    payment.gatewayId = session.id;
    await payment.save();

    return { sessionId: session.id, url: session.url, paymentId: payment._id };
}

/**
 * Handle Stripe webhook events
 */
async function handleWebhook(rawBody, signature) {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('Stripe webhook not configured');
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const paymentId = session.metadata?.paymentId;
        if (!paymentId) return;

        const payment = await Payment.findById(paymentId);
        if (!payment) return;

        payment.status = 'paid';
        payment.paidAt = new Date();
        payment.paymentMethod = 'card';
        payment.gatewayResponse = { sessionId: session.id };
        await payment.save();

        // Create or extend membership
        const periodStart = payment.periodStart || new Date();
        const periodEnd = payment.periodEnd || new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

        let membership = await Membership.findOne({ user: payment.user, gym: payment.gym, status: 'active' });
        if (membership) {
            membership.endDate = periodEnd;
            await membership.save();
        } else {
            await Membership.create({
                user: payment.user,
                gym: payment.gym,
                plan: 'monthly',
                startDate: periodStart,
                endDate: periodEnd,
                status: 'active'
            });
        }
    }

    return { received: true };
}

/**
 * Get payment history for current user
 */
async function getMyPayments(userId, limit = 50) {
    const payments = await Payment.find({ user: userId })
        .populate('gym', 'name address')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return payments.map(p => ({
        id: p._id,
        gym: p.gym,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        dueDate: p.dueDate,
        paidAt: p.paidAt,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        createdAt: p.createdAt
    }));
}

/**
 * Get payment summary for gym owner
 */
async function getOwnerSummary(ownerId) {
    const gyms = await Gym.find({ owner: ownerId }).select('_id name');
    const gymIds = gyms.map(g => g._id);

    const payments = await Payment.find({ gym: { $in: gymIds } })
        .populate('user', 'name email')
        .populate('gym', 'name')
        .sort({ dueDate: -1 })
        .limit(100)
        .lean();

    const summary = {
        totalReceived: 0,
        totalPending: 0,
        totalOverdue: 0,
        byStatus: { paid: 0, pending: 0, overdue: 0, upcoming: 0 },
        recentPayments: []
    };

    const now = new Date();
    for (const p of payments) {
        if (p.status === 'paid') {
            summary.totalReceived += p.amount;
            summary.byStatus.paid++;
        } else if (p.dueDate < now) {
            summary.totalOverdue += p.amount;
            summary.byStatus.overdue++;
        } else {
            summary.totalPending += p.amount;
            summary.byStatus[p.status === 'upcoming' ? 'upcoming' : 'pending']++;
        }
        summary.recentPayments.push({
            id: p._id,
            user: p.user,
            gym: p.gym,
            amount: p.amount,
            status: p.status,
            dueDate: p.dueDate,
            paidAt: p.paidAt
        });
    }

    return summary;
}

/**
 * Update payment statuses (upcoming → pending, pending → overdue)
 * Call from cron or on-demand
 */
async function updatePaymentStatuses() {
    const now = new Date();
    await Payment.updateMany(
        { status: 'pending', dueDate: { $lt: now } },
        { $set: { status: 'overdue' } }
    );
    await Payment.updateMany(
        { status: 'upcoming', dueDate: { $lte: now } },
        { $set: { status: 'pending' } }
    );
}

/**
 * Send payment reminder emails (upcoming and overdue)
 * Call from cron or on-demand
 */
async function sendPaymentReminders() {
    const now = new Date();
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const upcoming = await Payment.find({
        status: { $in: ['pending', 'upcoming'] },
        dueDate: { $gte: now, $lte: inThreeDays }
    }).populate('user', 'name email').populate('gym', 'name');

    const overdue = await Payment.find({
        status: 'overdue'
    }).populate('user', 'name email').populate('gym', 'name');

    for (const p of [...upcoming, ...overdue]) {
        try {
            await sendPaymentReminder(
                p.user?.email,
                p.user?.name,
                p.gym?.name || 'Gym',
                p.amount,
                p.dueDate,
                p.status === 'overdue'
            );
        } catch (e) {
            console.error('Payment reminder email failed:', e.message);
        }
    }
}

module.exports = {
    createCheckoutSession,
    handleWebhook,
    getMyPayments,
    getOwnerSummary,
    updatePaymentStatuses,
    sendPaymentReminders
};
