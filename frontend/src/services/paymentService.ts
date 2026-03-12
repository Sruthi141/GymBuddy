import api from './api';

export interface Payment {
    id: string;
    gym: { _id: string; name: string; address?: { city?: string; area?: string } };
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'overdue' | 'upcoming' | 'failed' | 'refunded';
    dueDate: string;
    paidAt?: string;
    periodStart?: string;
    periodEnd?: string;
    createdAt: string;
}

export interface OwnerSummary {
    totalReceived: number;
    totalPending: number;
    totalOverdue: number;
    byStatus: { paid: number; pending: number; overdue: number; upcoming: number };
    recentPayments: Array<{
        id: string;
        user?: { name: string; email: string };
        gym?: { name: string };
        amount: number;
        status: string;
        dueDate: string;
        paidAt?: string;
    }>;
}

export const paymentService = {
    createCheckoutSession: async (data: {
        gymId: string;
        amount: number;
        periodStart?: string;
        periodEnd?: string;
        successUrl?: string;
        cancelUrl?: string;
    }) => {
        const res = await api.post('/payments/create-checkout-session', data);
        return res.data as { sessionId: string; url: string; paymentId: string };
    },

    getMyPayments: async () => {
        const res = await api.get('/payments/me');
        return res.data as { payments: Payment[] };
    },

    getOwnerSummary: async () => {
        const res = await api.get('/payments/owner-summary');
        return res.data as OwnerSummary;
    }
};
