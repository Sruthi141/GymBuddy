import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentService, type Payment } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import { CreditCard, Loader2, CheckCircle2, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    paid: { label: 'Paid', className: 'badge-paid', icon: CheckCircle2 },
    pending: { label: 'Pending', className: 'badge-pending', icon: Clock },
    overdue: { label: 'Overdue', className: 'badge-overdue', icon: AlertCircle },
    upcoming: { label: 'Upcoming', className: 'badge-pending', icon: Clock },
    failed: { label: 'Failed', className: 'badge-overdue', icon: AlertCircle },
    refunded: { label: 'Refunded', className: 'badge-paid', icon: CheckCircle2 }
};

export default function PaymentHistoryPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const toast = useToast();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');
        if (success === 'true') {
            toast.addToast('Payment successful!', 'success');
            setSearchParams({}, { replace: true });
        }
        if (canceled === 'true') {
            toast.addToast('Payment was canceled', 'error');
            setSearchParams({}, { replace: true });
        }

        paymentService.getMyPayments()
            .then(({ payments: p }) => setPayments(p))
            .catch(() => setError('Failed to load payments'))
            .finally(() => setLoading(false));
    }, [searchParams, setSearchParams, toast]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-dark-300 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Payment History</h1>
                        <p className="text-dark-400 text-sm">Your gym membership payments</p>
                    </div>
                </div>

                {error && (
                    <div className="glass-card p-4 mb-6 border-danger/30 text-danger-light">
                        {error}
                    </div>
                )}

                {payments.length === 0 && !error && (
                    <div className="glass-card p-8 text-center">
                        <CreditCard className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                        <p className="text-dark-300 mb-2">No payments yet</p>
                        <p className="text-dark-400 text-sm mb-4">When you pay for gym memberships, they will appear here.</p>
                        <Link to="/gyms" className="btn-primary inline-flex">Browse Gyms</Link>
                    </div>
                )}

                <div className="space-y-4">
                    {payments.map((p) => {
                        const cfg = statusConfig[p.status] || statusConfig.pending;
                        const Icon = cfg.icon;
                        return (
                            <div key={p.id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-white">{p.gym?.name || 'Gym'}</h3>
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${cfg.className}`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <p className="text-dark-400 text-sm mt-1">
                                        {p.gym?.address?.city && `${p.gym.address.city}`}
                                        {p.gym?.address?.area && `, ${p.gym.address.area}`}
                                    </p>
                                    <p className="text-dark-500 text-xs mt-1">
                                        Due: {new Date(p.dueDate).toLocaleDateString()}
                                        {p.paidAt && ` • Paid: ${new Date(p.paidAt).toLocaleDateString()}`}
                                    </p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="text-xl font-bold text-white">₹{p.amount.toLocaleString()}</div>
                                    <div className="text-xs text-dark-400">{p.currency}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
