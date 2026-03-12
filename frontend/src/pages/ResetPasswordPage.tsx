import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import OTPInput from '../components/auth/OTPInput';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import { validatePassword } from '../utils/validation';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import PageBackground from '../layouts/PageBackground';

export default function ResetPasswordPage() {
    const { handleAuthResponse } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const mail = email.trim();
        if (!mail) {
            setError('Email is required');
            return;
        }
        if (otp.length !== 6) {
            setError('Enter the 6-digit OTP');
            return;
        }
        const pwdCheck = validatePassword(newPassword);
        if (!pwdCheck.valid) {
            setError(`Password: ${pwdCheck.message}`);
            return;
        }
        setLoading(true);
        try {
            const data = await authService.resetPassword(mail, otp, newPassword);
            if (data.token && data.user) {
                handleAuthResponse(data as { token: string; user: object });
                navigate('/dashboard', { replace: true });
            } else {
                setError(data.message || 'Reset failed');
            }
        } catch (err: unknown) {
            const res = (err as { response?: { data?: { message?: string } } })?.response?.data;
            setError(res?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        const mail = email.trim();
        if (!mail) {
            setError('Enter your email first');
            return;
        }
        setError('');
        try {
            await authService.forgotPassword(mail);
            navigate(`/reset-password?email=${encodeURIComponent(mail)}`);
            setResendCooldown(60);
            const interval = setInterval(() => {
                setResendCooldown((c) => {
                    if (c <= 1) clearInterval(interval);
                    return c - 1;
                });
            }, 1000);
        } catch (err: unknown) {
            const res = (err as { response?: { data?: { message?: string } } })?.response?.data;
            setError(res?.message || 'Failed to resend OTP');
        }
    };

    return (
        <PageBackground image="https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=1600&q=80&auto=format">
            <div className="w-full max-w-md mx-auto py-10">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-7 h-7 text-primary-dark" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                    <p className="text-sm text-dark-300 mt-1">
                        Enter the OTP and your new password
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

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-2">OTP</label>
                            <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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
                            <PasswordStrengthMeter password={newPassword} />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6 || !newPassword}
                            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="text-sm text-primary hover:underline disabled:text-dark-500 disabled:no-underline"
                        >
                            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                        <span className="mx-2 text-dark-500">|</span>
                        <Link to="/login" className="text-sm text-primary hover:underline">Back to Login</Link>
                    </div>
                </div>
            </div>
        </PageBackground>
    );
}
