import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import { ticketService } from '../services/ticketService';
import { gymService } from '../services/gymService';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import MatchCard from '../components/MatchCard';
import TicketCard from '../components/TicketCard';
import StatsCard from '../components/StatsCard';
import PageBackground from '../layouts/PageBackground';
import { Users, Ticket, MapPin, Bell, ChevronRight, Target, AlertCircle, Loader2 } from 'lucide-react';

const DashboardPage = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [gyms, setGyms] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [matchRes, ticketRes, gymRes, notifRes] = await Promise.allSettled([
                    matchService.getMatches(),
                    ticketService.getTickets(),
                    gymService.getGyms(),
                    api.get('/notifications'),
                ]);

                if (matchRes.status === 'fulfilled') setMatches((matchRes.value.matches || []).slice(0, 3));
                if (ticketRes.status === 'fulfilled') setTickets((ticketRes.value.tickets || []).slice(0, 2));
                if (gymRes.status === 'fulfilled') setGyms((gymRes.value.gyms || []).slice(0, 3));
                if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.notifications || []);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const handleConnect = async (userId: string) => {
        try {
            await matchService.sendRequest(userId);
            const data = await matchService.getMatches();
            setMatches((data.matches || []).slice(0, 3));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to send request');
        }
    };

    const activeTickets = tickets.filter(t => t.status === 'active').length;
    const unreadNotifs = notifications.filter(n => !n.read).length;

    return (
        <PageBackground image="https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?w=1600&q=80&auto=format" align="top">
            <div className="flex min-h-[calc(100vh-4rem)]">
                <Sidebar />
                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                {/* Welcome */}
                <div className="mb-8 animate-fadeIn">
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, <span className="text-primary-light">{user?.name?.split(' ')[0] || 'User'}</span> 👋
                    </h1>
                    <p className="text-sm text-dark-300 mt-1">Here's what's happening with your fitness journey</p>
                </div>

                {/* Profile completion alert */}
                {user && !user.isProfileComplete && (
                    <div className="glass-card p-4 mb-6 border-accent/30 flex items-center gap-3 animate-slideUp">
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Complete your profile</p>
                            <p className="text-xs text-dark-300">Fill in your fitness details to get better matches</p>
                        </div>
                        <Link to="/onboarding" className="btn-primary text-xs py-1.5 px-3">Complete Now</Link>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slideUp">
                            <StatsCard title="Matches" value={matches.length} icon={Users} color="primary" />
                            <StatsCard title="Active Tickets" value={activeTickets} icon={Ticket} color="secondary" />
                            <StatsCard title="Nearby Gyms" value={gyms.length} icon={MapPin} color="accent" />
                            <StatsCard title="Notifications" value={unreadNotifs} icon={Bell} color="danger" />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Matches Column */}
                            <div className="xl:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-primary" /> Top Matches
                                    </h2>
                                    <Link to="/matches" className="text-xs text-primary-light font-semibold flex items-center gap-1 hover:text-white transition-colors">
                                        View All <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                                {matches.length > 0 ? (
                                    matches.map((match, i) => (
                                        <MatchCard key={match.matchId || i} {...match} onConnect={handleConnect} />
                                    ))
                                ) : (
                                    <div className="glass-card p-6 text-center">
                                        <Users className="w-8 h-8 text-dark-500 mx-auto mb-2" />
                                        <p className="text-sm text-dark-300">No matches yet</p>
                                        <p className="text-xs text-dark-400 mt-1">
                                            {user?.isProfileComplete
                                                ? 'No compatible users found yet'
                                                : 'Complete your profile to start matching!'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Active Tickets */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            <Ticket className="w-4 h-4 text-secondary" /> Recent Tickets
                                        </h3>
                                        <Link to="/tickets" className="text-xs text-primary-light font-semibold flex items-center gap-1">
                                            All <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {tickets.length > 0 ? (
                                            tickets.map(ticket => (
                                                <TicketCard key={ticket._id} ticket={ticket} currentUserId={user?.id} />
                                            ))
                                        ) : (
                                            <div className="glass-card p-4 text-center">
                                                <p className="text-xs text-dark-400">No tickets yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-accent" /> Recent Notifications
                                        </h3>
                                        <Link to="/notifications" className="text-xs text-primary-light font-semibold flex items-center gap-1">
                                            All <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                    <div className="space-y-2">
                                        {notifications.slice(0, 4).length > 0 ? (
                                            notifications.slice(0, 4).map(n => (
                                                <div key={n._id} className={`glass-card p-3 flex items-start gap-3 ${!n.read ? 'border-primary/20' : ''}`}>
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary' : 'bg-dark-500'}`} />
                                                    <div>
                                                        <p className="text-xs text-dark-200">{n.message}</p>
                                                        <p className="text-[10px] text-dark-400 mt-0.5">
                                                            {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="glass-card p-4 text-center">
                                                <p className="text-xs text-dark-400">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Gym Preview */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-accent" /> Nearby Gyms
                                        </h3>
                                        <Link to="/gyms" className="text-xs text-primary-light font-semibold flex items-center gap-1">
                                            Browse <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                    {gyms.slice(0, 2).map(gym => (
                                        <div key={gym._id} className="glass-card p-3 mb-2 flex items-center gap-3 hover:border-primary/20 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{gym.name}</p>
                                                <p className="text-[10px] text-dark-400">{gym.address?.area}, {gym.address?.city}</p>
                                            </div>
                                            <Link to={`/gyms/${gym._id}`} className="text-xs text-primary-light">→</Link>
                                        </div>
                                    ))}
                                    {gyms.length === 0 && (
                                        <div className="glass-card p-4 text-center">
                                            <p className="text-xs text-dark-400">No gyms available yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
            </div>
        </PageBackground>
    );
};

export default DashboardPage;
