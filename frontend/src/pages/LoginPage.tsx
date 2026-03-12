import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Dumbbell, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import PageBackground from '../layouts/PageBackground';

export default function LoginPage() {
    const { login, loginWithGoogle, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const justVerified = location.state?.verified === true;
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        const credential = credentialResponse.credential;
        if (!credential) {
            setError('Google sign-in did not return a credential.');
            return;
        }
        setGoogleLoading(true);
        setError('');
        try {
            await loginWithGoogle(credential);
            const savedUser = localStorage.getItem('gymbuddy_user');
            const userData = savedUser ? JSON.parse(savedUser) : null;
            if (userData?.role === 'gymOwner') navigate('/owner/dashboard');
            else if (userData?.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Google sign-in failed';
            setError(msg);
            toast.addToast(msg, 'error');
        } finally {
            setGoogleLoading(false);
        }
    };

    // Redirect already logged-in users to their dashboard
    useEffect(() => {
        if (user) {
            if (user.role === 'gymOwner') navigate('/owner/dashboard', { replace: true });
            else if (user.role === 'admin') navigate('/admin', { replace: true });
            else navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            // Get user data from localStorage after login
            const savedUser = localStorage.getItem('gymbuddy_user');
            const userData = savedUser ? JSON.parse(savedUser) : null;

            if (userData?.role === 'gymOwner') {
                navigate('/owner/dashboard');
            } else if (userData?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: unknown) {
            const res = (err as { response?: { data?: { message?: string; needsVerification?: boolean; email?: string } } })?.response?.data;
            if (res?.needsVerification) {
                navigate(`/verify-otp?email=${encodeURIComponent(res.email || form.email)}`);
                return;
            }
            setError(res?.message || 'Login failed. Please try again.');
            toast.addToast(res?.message || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageBackground image="https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?w=1600&q=80&auto=format">
            <div className="w-full max-w-md mx-auto py-10">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                        <Dumbbell className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                    <p className="text-sm text-dark-300 mt-1">Login to your GymBuddy account</p>
                </div>

                <div className="glass-card p-6 sm:p-8">
                    {justVerified && (
                        <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            Email verified successfully! Please log in to access your dashboard.
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger-light">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="input-field"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
                        </button>

                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                            <>
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-dark-500" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-dark-800 text-dark-400">or</span>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => {
                                            setError('Google sign-in was cancelled or failed.');
                                            toast.addToast('Google sign-in failed', 'error');
                                        }}
                                        useOneTap={false}
                                        theme="filled_black"
                                        size="large"
                                        width="320"
                                        text="continue_with"
                                        disabled={googleLoading}
                                    />
                                </div>
                            </>
                        )}
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <Link to="/forgot-password" className="block text-sm text-primary hover:underline">
                            Forgot password?
                        </Link>
                        <p className="text-sm text-dark-300">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary font-semibold hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </div>

                    {/* Quick login hints */}
                    <div className="mt-6 pt-4 border-t border-dark-600/50">
                        <p className="text-xs text-dark-400 mb-2">Demo accounts:</p>
                        <div className="space-y-1">
                            {[
                                { label: 'User', email: 'arjun@example.com' },
                                { label: 'Gym Owner', email: 'gymowner@example.com' },
                                { label: 'Admin', email: 'admin@gymbuddy.com' },
                            ].map(demo => (
                                <button
                                    key={demo.email}
                                    onClick={() => setForm({ email: demo.email, password: demo.label === 'Admin' ? 'Admin1!' : 'Password1!' })}
                                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-dark-300 hover:bg-dark-700 hover:text-white transition-colors"
                                >
                                    <span>{demo.label}</span>
                                    <span className="text-dark-400">{demo.email}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageBackground>
    );
}
