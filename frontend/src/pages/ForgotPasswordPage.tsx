import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Loader2, KeyRound } from 'lucide-react';
import PageBackground from '../layouts/PageBackground';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const mail = email.trim();
        if (!mail) {
            setError('Email is required');
            return;
        }
        setLoading(true);
        try {
            await authService.forgotPassword(mail);
            setSent(true);
            navigate(`/reset-password?email=${encodeURIComponent(mail)}`);
        } catch (err: unknown) {
            const res = (err as { response?: { data?: { message?: string } } })?.response?.data;
            setError(res?.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageBackground image="https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=1600&q=80&auto=format">
            <div className="w-full max-w-md mx-auto py-10">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-7 h-7 text-primary-dark" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
                    <p className="text-sm text-dark-300 mt-1">
                        Enter your email and we'll send you an OTP to reset it
                    </p>
                </div>

                <div className="glass-card p-6 sm:p-8">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger-light">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-primary hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </PageBackground>
    );
}
