import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PhotoUpload from '../components/auth/PhotoUpload';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import { validatePassword, validateName } from '../utils/validation';
import { Dumbbell, Eye, EyeOff, Loader2 } from 'lucide-react';
import PageBackground from '../layouts/PageBackground';

export default function RegisterPage() {
    const { register, loginWithGoogle, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
    const [photo, setPhoto] = useState<File | null>(null);
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

        const nameCheck = validateName(form.name);
        if (!nameCheck.valid) {
            setError(nameCheck.message || 'Invalid name');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        const pwdCheck = validatePassword(form.password);
        if (!pwdCheck.valid) {
            setError(`Password: ${pwdCheck.message}`);
            return;
        }
        if (form.role !== 'admin' && !photo) {
            setError('Profile photo is required');
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name.trim());
            fd.append('email', form.email.trim());
            fd.append('password', form.password);
            fd.append('role', form.role);
            if (photo) fd.append('profilePhoto', photo);

            const data = await register(fd);

            if (data.needsOtp) {
                navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
            } else if (data.token && data.user) {
                const u = data.user;
                if (u.role === 'gymOwner') navigate('/owner/onboarding');
                else navigate(u.isProfileComplete ? '/dashboard' : '/onboarding');
            } else {
                setError(data.message || 'Registration failed.');
            }
        } catch (err: unknown) {
            const res = (err as { response?: { data?: { message?: string; errors?: { field: string; message: string }[] } } })?.response?.data;
            const msg = res?.errors?.map((e) => e.message).join(', ') || res?.message || 'Registration failed. Please try again.';
            setError(msg);
            toast.addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageBackground image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80&auto=format">
            <div className="w-full max-w-md mx-auto py-10">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4">
                        <Dumbbell className="w-7 h-7 text-primary-dark" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Join GymBuddy</h1>
                    <p className="text-sm text-dark-300 mt-1">Find your workout partner. Build together.</p>
                </div>

                <div className="glass-card p-6 sm:p-8">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger-light">
                            {error}
                        </div>
                    )}

                    {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                        <div className="mb-4 flex justify-center">
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
                                text="signup_with"
                                disabled={googleLoading}
                            />
                        </div>
                    )}
                    {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-dark-500" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-dark-800 text-dark-400">or sign up with email</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex justify-center">
                            <PhotoUpload
                                value={photo}
                                onChange={setPhoto}
                                label="Profile Photo"
                                required={form.role !== 'admin'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="input-field"
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="input-field"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">I am a</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'user', label: 'Gym User', desc: 'Find workout partners' },
                                    { value: 'gymOwner', label: 'Gym Owner', desc: 'List your gym' },
                                ].map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, role: role.value })}
                                        className={`p-3 rounded-xl border text-left transition-all ${form.role === role.value
                                            ? 'border-primary bg-primary/10 text-white'
                                            : 'border-dark-500 bg-dark-700/50 text-dark-300 hover:border-dark-400'
                                            }`}
                                    >
                                        <div className="text-sm font-semibold">{role.label}</div>
                                        <div className="text-[10px] text-dark-400 mt-0.5">{role.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field pr-10"
                                    placeholder="Min 8 chars, 1 upper, 1 number, 1 special"
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
                            <PasswordStrengthMeter password={form.password} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-dark-300">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-semibold hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </PageBackground>
    );
}
