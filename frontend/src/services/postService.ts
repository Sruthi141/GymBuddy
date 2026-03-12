import api from './api';

export interface Post {
    _id: string;
    author: { _id: string; name: string; profilePhoto?: string; profilePicture?: string };
    gym?: { _id: string; name: string; address?: { city?: string } };
    type: string;
    content: string;
    media: { url: string; type: string }[];
    likes: string[];
    comments: { user: { name: string; profilePhoto?: string }; text: string; createdAt: string }[];
    saves: string[];
    createdAt: string;
}

export const postService = {
    getFeed: async (page = 1, type?: string) => {
        const params = new URLSearchParams({ page: String(page) });
        if (type) params.set('type', type);
        const res = await api.get(`/posts?${params}`);
        return res.data;
    },

    createPost: async (data: FormData | { content: string; type?: string; gymId?: string }) => {
        if (data instanceof FormData) {
            const res = await api.post('/posts', data);
            return res.data;
        }
        const res = await api.post('/posts', data);
        return res.data;
    },

    getPost: async (id: string) => {
        const res = await api.get(`/posts/${id}`);
        return res.data;
    },

    likePost: async (id: string) => {
        const res = await api.post(`/posts/${id}/like`);
        return res.data;
    },

    commentPost: async (id: string, text: string) => {
        const res = await api.post(`/posts/${id}/comment`, { text });
        return res.data;
    },

    savePost: async (id: string) => {
        const res = await api.post(`/posts/${id}/save`);
        return res.data;
    },

    deletePost: async (id: string) => {
        await api.delete(`/posts/${id}`);
    }
};
