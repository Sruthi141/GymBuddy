import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import MatchCard from '../components/MatchCard';
import CreateTicketModal from '../components/CreateTicketModal';
import { matchService } from '../services/matchService';
import PageBackground from '../layouts/PageBackground';
import { Search, Users, TrendingUp, Loader2, RefreshCw, Ticket } from 'lucide-react';

const MatchesPage = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [ticketModal, setTicketModal] = useState<{ matchId: string; user: { name: string } } | null>(null);

    const fetchMatches = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await matchService.getMatches();
            setMatches(data.matches || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load matches. Make sure your profile is complete.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMatches(); }, [fetchMatches]);

    const filteredMatches = matches
        .filter(m => {
            if (filter === 'connected') return m.matchStatus === 'accepted';
            if (filter === 'pending') return m.matchStatus === 'pending';
            if (filter === 'available') return !m.matchStatus;
            return true;
        })
        .filter(m => !searchTerm || m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleConnect = async (userId: string) => {
        try {
            await matchService.sendRequest(userId);
            fetchMatches();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to send request');
        }
    };

    const handleAccept = async (matchId: string) => {
        try {
            await matchService.respondToRequest(matchId, 'accept');
            fetchMatches();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to accept request');
        }
    };

    const handleReject = async (matchId: string) => {
        try {
            await matchService.respondToRequest(matchId, 'reject');
            fetchMatches();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reject request');
        }
    };

    const acceptedMatches = matches.filter(m => m.matchStatus === 'accepted');

    return (
        <PageBackground image="https://images.unsplash.com/photo-1517831678677-b68f3ec6f91b?w=1600&q=80&auto=format" align="top">
            <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Users className="w-6 h-6 text-primary" /> Your Matches
                            </h1>
                            <p className="text-sm text-dark-300 mt-1">{matches.length} compatible partners found</p>
                        </div>
                        <button onClick={fetchMatches} className="btn-secondary text-xs py-2" disabled={loading}>
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Connected partners — quick ticket creation */}
                    {acceptedMatches.length > 0 && (
                        <div className="glass-card p-4 mb-6 border-secondary/20">
                            <p className="text-xs font-semibold text-secondary mb-3 flex items-center gap-1.5">
                                <Ticket className="w-3.5 h-3.5" /> Connected Partners — Start a Collaboration
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {acceptedMatches.map((m, i) => (
                                    <button
                                        key={m.matchId || i}
                                        onClick={() => setTicketModal({ matchId: m.matchId, user: m.user })}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-all text-sm text-white font-medium"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold">
                                            {m.user?.name?.charAt(0)}
                                        </div>
                                        {m.user?.name}
                                        <Ticket className="w-3.5 h-3.5 text-secondary" />
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-dark-400 mt-2">Click a partner to create a collaboration ticket with them</p>
                        </div>
                    )}

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search matches..."
                                className="input-field pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            {[
                                { label: 'All', value: 'all' },
                                { label: 'Available', value: 'available' },
                                { label: 'Pending', value: 'pending' },
                                { label: 'Connected', value: 'connected' },
                            ].map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => setFilter(f.value)}
                                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${filter === f.value
                                        ? 'bg-primary/15 text-primary-light border border-primary/30'
                                        : 'text-dark-300 hover:bg-dark-700 border border-transparent'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Match Score Legend */}
                    <div className="glass-card p-4 mb-6 flex items-center gap-6 text-xs">
                        <span className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-dark-400" />
                            <span className="text-dark-400">Score guide:</span>
                        </span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> 70%+ Excellent</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> 40-69% Good</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-dark-400" /> &lt;40% Fair</span>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="glass-card p-6 text-center">
                            <p className="text-danger-light text-sm mb-1">{error}</p>
                            <p className="text-xs text-dark-400">Complete your profile first to see matches</p>
                            <button onClick={fetchMatches} className="btn-secondary text-xs mt-3">Try Again</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredMatches.length > 0 ? (
                                filteredMatches.map((match, i) => (
                                    <MatchCard
                                        key={match.matchId || i}
                                        {...match}
                                        onConnect={handleConnect}
                                        onAccept={handleAccept}
                                        onReject={handleReject}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <Users className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                                    <p className="text-dark-300">No matches found</p>
                                    <p className="text-xs text-dark-400 mt-1">
                                        {filter === 'all'
                                            ? 'Complete your fitness profile to start matching'
                                            : 'Try adjusting your filters'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Ticket Modal */}
            {ticketModal && (
                <CreateTicketModal
                    match={ticketModal}
                    onClose={() => setTicketModal(null)}
                    onCreated={() => {
                        setTicketModal(null);
                        // Optionally redirect user to tickets tab
                    }}
                />
            )}
        </div>
        </PageBackground>
    );
};

export default MatchesPage;
