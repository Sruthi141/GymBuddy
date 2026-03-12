import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentService, type OwnerSummary } from '../services/paymentService';
import { CreditCard, Loader2, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function OwnerPaymentsPage() {
    const [summary, setSummary] = useState<OwnerSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        paymentService.getOwnerSummary()
            .then(setSummary)
            .catch(() => setError('Failed to load payment summary'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/owner/dashboard" className="inline-flex items-center gap-2 text-dark-300 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Payment Overview</h1>
                        <p className="text-dark-400 text-sm">Membership payments for your gyms</p>
                    </div>
                </div>

                {error && (
                    <div className="glass-card p-4 mb-6 border-danger/30 text-danger-light">{error}</div>
                )}

                {summary && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="glass-card p-5 border-secondary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                                    <span className="text-sm text-dark-300">Received</span>
                                </div>
                                <p className="text-2xl font-bold text-white">₹{summary.totalReceived.toLocaleString()}</p>
                            </div>
                            <div className="glass-card p-5 border-accent/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-accent" />
                                    <span className="text-sm text-dark-300">Pending</span>
                                </div>
                                <p className="text-2xl font-bold text-white">₹{summary.totalPending.toLocaleString()}</p>
                            </div>
                            <div className="glass-card p-5 border-danger/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-5 h-5 text-danger" />
                                    <span className="text-sm text-dark-300">Overdue</span>
                                </div>
                                <p className="text-2xl font-bold text-white">₹{summary.totalOverdue.toLocaleString()}</p>
                            </div>
                        </div>

                        <h2 className="text-lg font-bold text-white mb-4">Recent Payments</h2>
                        {summary.recentPayments?.length === 0 ? (
                            <div className="glass-card p-8 text-center">
                                <CreditCard className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                                <p className="text-dark-300">No payments yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {summary.recentPayments?.map((p) => (
                                    <div key={p.id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-white">{p.user?.name || 'User'}</p>
                                            <p className="text-sm text-dark-400">{p.gym?.name} • {new Date(p.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                                                p.status === 'paid' ? 'badge-paid' : p.status === 'overdue' ? 'badge-overdue' : 'badge-pending'
                                            }`}>
                                                {p.status}
                                            </span>
                                            <span className="text-lg font-bold text-white">₹{p.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
