import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2, Dumbbell } from 'lucide-react';
import api from '../services/api';

type VerifyStatus = 'loading' | 'success' | 'error';

const VerifyEmailPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [status, setStatus] = useState<VerifyStatus>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await api.get(`/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(res.data.message || 'Email verified successfully!');

                // If user is already logged in, update their session and go to dashboard
                if (user) {
                    updateUser({ isEmailVerified: true });
                    setTimeout(() => {
                        navigate('/owner/dashboard', { replace: true });
                    }, 2500);
                } else {
                    // User clicked link from email in a fresh tab — redirect to login
                    setTimeout(() => {
                        navigate('/login', { replace: true, state: { verified: true } });
                    }, 2500);
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(
                    err.response?.data?.message ||
                    'Verification failed. The link may be invalid or expired.'
                );
            }
        };

        if (token) {
            verify();
        } else {
            setStatus('error');
            setMessage('No verification token provided.');
        }
    }, [token]);

    return (
        <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                        <Dumbbell className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-primary-light bg-clip-text text-transparent">
                        GymBuddy
                    </span>
                </div>

                <div className="glass-card p-8 text-center">
                    {/* Loading */}
                    {status === 'loading' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Verifying your email...</h2>
                            <p className="text-sm text-dark-300">Please wait a moment.</p>
                        </>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-5">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
                            <p className="text-sm text-dark-300 mb-4">{message}</p>
                            <p className="text-xs text-primary-light animate-pulse">
                                {user ? 'Redirecting to your dashboard...' : 'Redirecting to login...'}
                            </p>
                        </>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-5">
                                <XCircle className="w-8 h-8 text-danger" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
                            <p className="text-sm text-dark-300 mb-6">{message}</p>
                            <div className="flex flex-col gap-2">
                                <Link to="/login" className="btn-primary justify-center py-3 text-sm">
                                    Go to Login
                                </Link>
                                <p className="text-xs text-dark-400 mt-2">
                                    Already verified? Just log in normally.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
