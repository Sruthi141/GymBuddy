import api from './api';

export const gymService = {
    getGyms: async (params?: { city?: string; facilities?: string; page?: number }) => {
        const res = await api.get('/gyms', { params });
        return res.data;
    },

    getNearbyGyms: async (lat: number, lng: number, radiusKm: number = 10) => {
        const res = await api.get('/gyms/nearby', { params: { lat, lng, radius: radiusKm } });
        return res.data;
    },

    getGymById: async (id: string) => {
        const res = await api.get(`/gyms/${id}`);
        return res.data;
    },

    createGym: async (data: any) => {
        const res = await api.post('/gyms', data);
        return res.data;
    },

    updateGym: async (id: string, data: any) => {
        const res = await api.put(`/gyms/${id}`, data);
        return res.data;
    },

    getMyGyms: async () => {
        const res = await api.get('/gyms/owner/my-gyms');
        return res.data;
    },

    updateUserLocation: async (latitude: number, longitude: number) => {
        const res = await api.put('/users/location', { latitude, longitude });
        return res.data;
    }
};
