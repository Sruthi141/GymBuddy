import api from './api';

export const ticketService = {
    createTicket: async (data: { matchId: string; workoutDate?: string; workoutType?: string; notes?: string }) => {
        const res = await api.post('/tickets/create', data);
        return res.data;
    },

    getTickets: async (status?: string) => {
        const params = status ? { status } : {};
        const res = await api.get('/tickets', { params });
        return res.data;
    },

    updateStatus: async (data: { ticketId: string; status: string; gymId?: string }) => {
        const res = await api.put('/tickets/update-status', data);
        return res.data;
    }
};
