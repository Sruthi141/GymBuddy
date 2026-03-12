import api from './api';

export const matchService = {
    getMatches: async () => {
        const res = await api.get('/matches');
        return res.data;
    },

    sendRequest: async (targetUserId: string) => {
        const res = await api.post('/matches/request', { targetUserId });
        return res.data;
    },

    respondToRequest: async (matchId: string, action: 'accept' | 'reject') => {
        const res = await api.post('/matches/respond', { matchId, action });
        return res.data;
    }
};
