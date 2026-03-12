import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthResponse, AuthUser } from '../services/authService';

interface User extends AuthUser {
    id: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (credential: string) => Promise<void>;
    register: (formData: FormData) => Promise<AuthResponse>;
    handleAuthResponse: (data: { token: string; user: AuthUser }) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateSession = async () => {
            const savedToken = localStorage.getItem('rep_token') || localStorage.getItem('gymbuddy_token');

            if (!savedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const apiUrl = import.meta.env.VITE_API_URL || '/api';
                const res = await fetch(`${apiUrl}/auth/me`, {
                    headers: { Authorization: `Bearer ${savedToken}` }
                });

                if (!res.ok) throw new Error('Invalid token');

                const data = await res.json();
                setToken(savedToken);
                setUser(data.user);
                localStorage.setItem('rep_token', savedToken);
                localStorage.setItem('rep_user', JSON.stringify(data.user));
                localStorage.setItem('gymbuddy_token', savedToken);
                localStorage.setItem('gymbuddy_user', JSON.stringify(data.user));
            } catch {
                localStorage.removeItem('rep_token');
                localStorage.removeItem('rep_user');
                localStorage.removeItem('gymbuddy_token');
                localStorage.removeItem('gymbuddy_user');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        validateSession();
    }, []);

    const handleAuthResponse = (data: { token: string; user: AuthUser }) => {
        if (!data.token || !data.user) return;
        const u = { ...data.user, id: data.user.id };
        setToken(data.token);
        setUser(u);
        localStorage.setItem('rep_token', data.token);
        localStorage.setItem('rep_user', JSON.stringify(u));
        localStorage.setItem('gymbuddy_token', data.token);
        localStorage.setItem('gymbuddy_user', JSON.stringify(u));
    };

    const login = async (email: string, password: string) => {
        const data = await authService.login({ email, password });
        if (data.token && data.user) handleAuthResponse(data as { token: string; user: AuthUser });
        else throw new Error(data.message || 'Login failed');
    };

    const loginWithGoogle = async (credential: string) => {
        const data = await authService.googleAuth(credential);
        if (data.token && data.user) handleAuthResponse(data as { token: string; user: AuthUser });
        else throw new Error(data.message || 'Google sign-in failed');
    };

    const register = async (formData: FormData): Promise<AuthResponse> => {
        const data = await authService.register(formData);
        if (data.token && data.user) {
            handleAuthResponse(data as { token: string; user: AuthUser });
        }
        return data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('rep_token');
        localStorage.removeItem('rep_user');
        localStorage.removeItem('gymbuddy_token');
        localStorage.removeItem('gymbuddy_user');
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updated = { ...user, ...userData };
            setUser(updated);
            localStorage.setItem('rep_user', JSON.stringify(updated));
            localStorage.setItem('gymbuddy_user', JSON.stringify(updated));
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, loginWithGoogle, register, handleAuthResponse, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
