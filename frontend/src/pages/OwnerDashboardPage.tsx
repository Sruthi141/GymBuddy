import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gymService } from '../services/gymService';
import { paymentService } from '../services/paymentService';
import api from '../services/api';
import EditGymModal from '../components/EditGymModal';
import PageBackground from '../layouts/PageBackground';
import {
    Building2, Plus, MapPin, Star, Users, IndianRupee,
    CheckCircle2, AlertCircle, Eye, Edit, TrendingUp,
    Dumbbell, Mail, BarChart3, Activity, Ticket, RefreshCw, Trash2, CreditCard
} from 'lucide-react';

interface GymStat {
    gymId: string;
    gymName: string;
    city?: string;
    totalVisitors: number;
    completedVisits: number;
    activeVisits: number;
    recentTickets: Array<{
        _id: string;
        status: string;
        workoutType?: string;
        workoutDate?: string;
        participants: Array<{ _id: string; name: string }>;
        updatedAt: string;
    }>;
}

const OwnerDashboardPage = () => {
    const { user } = useAuth();
    const [gyms, setGyms] = useState<any[]>([]);
    const [gymStats, setGymStats] = useState<GymStat[]>([]);
    const [paymentSummary, setPaymentSummary] = useState<{ totalReceived: number; totalPending: number; totalOverdue: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editGym, setEditGym] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setStatsLoading(true);
        try {
            const [gymsRes, statsRes, payRes] = await Promise.allSettled([
                gymService.getMyGyms(),
                api.get('/gyms/owner/visit-history'),
                paymentService.getOwnerSummary()
            ]);
            if (gymsRes.status === 'fulfilled') {
                setGyms(gymsRes.value?.gyms || gymsRes.value?.data?.gyms || []);
            }
            if (statsRes.status === 'fulfilled') {
                setGymStats(statsRes.value.data?.gymStats || []);
            }
            if (payRes.status === 'fulfilled') {
                setPaymentSummary({
                    totalReceived: payRes.value.totalReceived || 0,
                    totalPending: payRes.value.totalPending || 0,
                    totalOverdue: payRes.value.totalOverdue || 0
                });
            }
        } finally {
            setLoading(false);
            setStatsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDeleteGym = async (gymId: string, gymName: string) => {
        if (!window.confirm(`Delete "${gymName}"? This cannot be undone.`)) return;
        setDeletingId(gymId);
        try {
            await api.delete(`/gyms/${gymId}`);
            setGyms(prev => prev.filter(g => g._id !== gymId));
            setGymStats(prev => prev.filter(s => s.gymId !== gymId));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete gym');
        } finally {
            setDeletingId(null);
        }
    };

    const totalVisitors = gymStats.reduce((s, g) => s + g.totalVisitors, 0);
    const totalCompleted = gymStats.reduce((s, g) => s + g.completedVisits, 0);
    const totalActive = gymStats.reduce((s, g) => s + g.activeVisits, 0);

    return (
        <PageBackground image="https://images.unsplash.com/photo-1554344058-8d1d1dbc5960?w=1600&q=80&auto=format" align="top">
            <div className="max-w-6xl mx-auto pt-4 pb-10 px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-secondary" />
                            Gym Owner Dashboard
                        </h1>
                        <p className="text-sm text-dark-300 mt-1">Welcome back, {user?.name}! Manage your gyms here.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchData} className="btn-secondary text-xs py-2">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <Link to="/owner/onboarding" className="btn-success text-sm py-2.5 px-5 self-start">
                            <Plus className="w-4 h-4" /> Register New Gym
                        </Link>
                    </div>
                </div>

                {/* Email Verification Banner */}
                {user && !(user as any).isEmailVerified && (
                    <div className="glass-card p-4 mb-6 border-accent/30 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Verify Your Email</p>
                            <p className="text-xs text-dark-300">
                                Check <strong className="text-accent-light">{user.email}</strong> for a verification link.
                            </p>
                        </div>
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total Gyms', value: gyms.length, icon: Building2, color: 'primary' },
                        { label: 'Total Visitors', value: totalVisitors, icon: Users, color: 'secondary' },
                        { label: 'Completed Visits', value: totalCompleted, icon: CheckCircle2, color: 'secondary' },
                        { label: 'Currently Active', value: totalActive, icon: Activity, color: 'accent' },
                        { label: 'Payments Received', value: paymentSummary ? `₹${paymentSummary.totalReceived.toLocaleString()}` : '—', icon: CreditCard, color: 'secondary' },
                    ].map(stat => (
                        <div key={stat.label} className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                                    <stat.icon className={`w-4 h-4 text-${stat.color}`} />
                                </div>
                                <span className="text-xs text-dark-300">{stat.label}</span>
                            </div>
                            <p className="text-xl font-bold text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* My Gyms */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Dumbbell className="w-5 h-5 text-primary" /> My Gyms
                    </h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : gyms.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                            <Building2 className="w-12 h-12 text-dark-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No Gyms Registered Yet</h3>
                            <p className="text-sm text-dark-300 mb-6">Register your first gym to start connecting with fitness enthusiasts.</p>
                            <Link to="/owner/onboarding" className="btn-primary text-sm py-2.5 px-6">
                                <Plus className="w-4 h-4" /> Register Your Gym
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gyms.map(gym => {
                                const stat = gymStats.find(s => s.gymId === gym._id);
                                return (
                                    <div key={gym._id} className="glass-card p-5 hover:border-primary/30 transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                    {gym.name}
                                                    {gym.isVerified && <CheckCircle2 className="w-4 h-4 text-secondary" />}
                                                </h3>
                                                <p className="text-xs text-dark-300 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    {gym.address?.area && `${gym.address.area}, `}{gym.address?.city || 'Location not set'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
                                                <Star className="w-3 h-3 text-accent fill-accent" />
                                                <span className="text-xs font-bold text-accent-light">{gym.rating || '—'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            <div className="bg-dark-700/50 rounded-lg p-2 text-center">
                                                <Users className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                                                <p className="text-xs font-bold text-white">{gym.totalVisitors || 0}</p>
                                                <p className="text-[10px] text-dark-400">Visitors</p>
                                            </div>
                                            <div className="bg-dark-700/50 rounded-lg p-2 text-center">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-secondary mx-auto mb-0.5" />
                                                <p className="text-xs font-bold text-white">{stat?.completedVisits || 0}</p>
                                                <p className="text-[10px] text-dark-400">Done</p>
                                            </div>
                                            <div className="bg-dark-700/50 rounded-lg p-2 text-center">
                                                <Activity className="w-3.5 h-3.5 text-accent mx-auto mb-0.5" />
                                                <p className="text-xs font-bold text-white">{stat?.activeVisits || 0}</p>
                                                <p className="text-[10px] text-dark-400">Active</p>
                                            </div>
                                            <div className="bg-dark-700/50 rounded-lg p-2 text-center">
                                                <IndianRupee className="w-3.5 h-3.5 text-secondary mx-auto mb-0.5" />
                                                <p className="text-xs font-bold text-white">₹{gym.pricing?.monthly || '—'}</p>
                                                <p className="text-[10px] text-dark-400">Monthly</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link to={`/gyms/${gym._id}`} className="btn-secondary text-xs py-1.5 flex-1 justify-center">
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </Link>
                                            <button
                                                onClick={() => setEditGym(gym)}
                                                className="btn-primary text-xs py-1.5 flex-1 justify-center"
                                            >
                                                <Edit className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGym(gym._id, gym.name)}
                                                disabled={deletingId === gym._id}
                                                className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {deletingId === gym._id
                                                    ? <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                                                    : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Visitors / Ticket Activity */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Ticket className="w-5 h-5 text-secondary" /> Recent Gym Activity
                    </h2>

                    {statsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : gymStats.every(g => g.recentTickets.length === 0) ? (
                        <div className="glass-card p-6 text-center">
                            <Ticket className="w-10 h-10 text-dark-500 mx-auto mb-3" />
                            <p className="text-dark-300 text-sm">No visits yet</p>
                            <p className="text-xs text-dark-400 mt-1">When users select your gym for a workout collaboration, it will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {gymStats.filter(g => g.recentTickets.length > 0).map(stat => (
                                <div key={stat.gymId} className="glass-card p-5">
                                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-accent" />
                                        {stat.gymName}
                                        <span className="text-xs text-dark-400 font-normal">{stat.city}</span>
                                        <span className="ml-auto text-xs text-secondary font-semibold">{stat.completedVisits} completed • {stat.activeVisits} active</span>
                                    </h3>
                                    <div className="space-y-2">
                                        {stat.recentTickets.map(ticket => (
                                            <div key={ticket._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-700/40">
                                                {/* Status indicator */}
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ticket.status === 'completed' ? 'bg-secondary' : 'bg-accent animate-pulse'}`} />
                                                {/* Participants */}
                                                <div className="flex items-center gap-1 flex-1">
                                                    {ticket.participants.map((p, i) => (
                                                        <span key={p._id} className="text-xs text-white font-medium">
                                                            {p.name}{i < ticket.participants.length - 1 && <span className="text-dark-400 mx-1">+</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                                {/* Workout type */}
                                                {ticket.workoutType && (
                                                    <span className="text-[10px] text-dark-400 capitalize bg-dark-600 px-2 py-0.5 rounded-full">
                                                        {ticket.workoutType}
                                                    </span>
                                                )}
                                                {/* Status */}
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ticket.status === 'completed'
                                                    ? 'bg-secondary/15 text-secondary'
                                                    : 'bg-accent/15 text-accent'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                                {/* Date */}
                                                <span className="text-[10px] text-dark-500 flex-shrink-0">
                                                    {new Date(ticket.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-secondary" /> Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'Register New Gym', desc: 'Add another gym to the platform', icon: Plus, link: '/owner/onboarding', color: 'secondary' },
                            { label: 'View All Stats', desc: 'Platform-wide analytics', icon: TrendingUp, link: '/owner/analytics', color: 'accent' },
                            { label: 'Payment Overview', desc: paymentSummary ? `₹${paymentSummary.totalReceived.toLocaleString()} received` : 'Membership payments', icon: CreditCard, link: '/owner/payments', color: 'secondary' as const },
                        ].map(action => (
                            <Link key={action.label} to={action.link}
                                className="glass-card p-4 hover:border-primary/30 transition-all cursor-pointer group">
                                <div className={`w-10 h-10 rounded-xl bg-${action.color}/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <action.icon className={`w-5 h-5 text-${action.color}`} />
                                </div>
                                <h3 className="text-sm font-semibold text-white">{action.label}</h3>
                                <p className="text-xs text-dark-300 mt-0.5">{action.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            {/* Edit Gym Modal */}
            {editGym && (
                <EditGymModal
                    gym={editGym}
                    onClose={() => setEditGym(null)}
                    onUpdated={(updated) => {
                        setGyms(prev => prev.map(g => g._id === updated._id ? { ...g, ...updated } : g));
                        setEditGym(null);
                    }}
                />
            )}
        </PageBackground>
    );
};

export default OwnerDashboardPage;
