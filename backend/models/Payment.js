const mongoose = require('mongoose');

/**
 * Payment Model - Gym membership payments
 * Gateway-ready for Stripe/Razorpay later
 */
const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gym: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'upcoming', 'failed', 'refunded'],
        default: 'pending'
    },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    paymentMethod: { type: String },
    gatewayId: { type: String },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },
    invoiceUrl: { type: String },
    notes: { type: String }
}, {
    timestamps: true
});

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ gym: 1, createdAt: -1 });
paymentSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
