import api from './api';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
    user?: AuthUser;
    needsOtp?: boolean;
    needsVerification?: boolean;
    email?: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    profilePhoto?: string;
    isProfileComplete: boolean;
    isEmailVerified: boolean;
}

export const authService = {
    register: async (data: FormData): Promise<AuthResponse> => {
        const res = await api.post('/auth/register', data);
        return res.data;
    },

    sendOtp: async (email: string, purpose?: 'email-verify' | 'password-reset'): Promise<AuthResponse> => {
        const res = await api.post('/auth/send-otp', { email, purpose });
        return res.data;
    },

    resendOtp: async (email: string, purpose?: 'email-verify' | 'password-reset'): Promise<AuthResponse> => {
        const res = await api.post('/auth/resend-otp', { email, purpose });
        return res.data;
    },

    verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
        const res = await api.post('/auth/verify-otp', { email, otp });
        return res.data;
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
        const res = await api.post('/auth/login', data);
        return res.data;
    },

    forgotPassword: async (email: string): Promise<AuthResponse> => {
        const res = await api.post('/auth/forgot-password', { email });
        return res.data;
    },

    resetPassword: async (email: string, otp: string, newPassword: string): Promise<AuthResponse> => {
        const res = await api.post('/auth/reset-password', { email, otp, newPassword });
        return res.data;
    },

    getMe: async () => {
        const res = await api.get('/auth/me');
        return res.data;
    },

    googleAuth: async (credential: string): Promise<AuthResponse> => {
        const res = await api.post('/auth/google', { credential });
        return res.data;
    }
};
