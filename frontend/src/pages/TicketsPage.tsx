import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TicketCard from '../components/TicketCard';
import GymSelectorModal from '../components/GymSelectorModal';
import { ticketService } from '../services/ticketService';
import { Ticket, Filter, Loader2, RefreshCw } from 'lucide-react';

const TicketsPage = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [gymModal, setGymModal] = useState<{ ticketId: string } | null>(null);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await ticketService.getTickets();
            setTickets(data.tickets || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

    const handleAction = async (ticketId: string, action: string) => {
        // When activating (confirmed → active), open gym selector modal instead
        if (action === 'active') {
            setGymModal({ ticketId });
            return;
        }
        try {
            await ticketService.updateStatus({ ticketId, status: action });
            fetchTickets();
        } catch (err: any) {
            alert(err.response?.data?.message || `Failed to ${action} ticket`);
        }
    };

    const statusTabs = ['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'];

    return (
        <div className="flex min-h-screen pt-16">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Ticket className="w-6 h-6 text-secondary" /> Collaboration Tickets
                            </h1>
                            <p className="text-sm text-dark-300 mt-1">Track your workout collaborations</p>
                        </div>
                        <button onClick={fetchTickets} className="btn-secondary text-xs py-2" disabled={loading}>
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Status Flow Info */}
                    <div className="glass-card p-4 mb-6">
                        <p className="text-xs font-semibold text-dark-200 mb-2 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" /> Ticket Flow
                        </p>
                        <div className="flex items-center gap-2 text-[10px] overflow-x-auto pb-1">
                            {[
                                { label: 'Pending', color: 'bg-amber-500/15 text-amber-400' },
                                { label: 'Confirmed', color: 'bg-blue-500/15 text-blue-400' },
                                { label: 'Select Gym → Active', color: 'bg-emerald-500/15 text-emerald-400' },
                                { label: 'Completed', color: 'bg-purple-500/15 text-purple-400' },
                            ].map((s, i) => (
                                <span key={s.label} className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded-full font-semibold ${s.color}`}>{s.label}</span>
                                    {i < 3 && <span className="text-dark-500">→</span>}
                                </span>
                            ))}
                        </div>
                        <p className="text-[10px] text-dark-400 mt-2">
                            💡 To start a new collaboration, go to <strong className="text-dark-200">Matches</strong> and click a connected partner.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                        {statusTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${filter === tab
                                    ? 'bg-primary/15 text-primary-light border border-primary/30'
                                    : 'text-dark-300 hover:bg-dark-700 border border-transparent'
                                    }`}
                            >
                                {tab}
                                {tab !== 'all' && (
                                    <span className="ml-1 text-dark-400">
                                        ({tickets.filter(t => t.status === tab).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="glass-card p-6 text-center">
                            <p className="text-danger-light text-sm">{error}</p>
                            <button onClick={fetchTickets} className="btn-secondary text-xs mt-3">Try Again</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map(ticket => (
                                    <TicketCard
                                        key={ticket._id}
                                        ticket={ticket}
                                        currentUserId={user?.id}
                                        onAction={handleAction}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <Ticket className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                                    <p className="text-dark-300">No tickets found</p>
                                    <p className="text-xs text-dark-400 mt-1">
                                        {filter === 'all'
                                            ? 'Go to Matches → click a connected partner to create one'
                                            : `No ${filter} tickets`}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Gym Selector Modal — opens when user clicks "Select Gym & Activate" */}
            {gymModal && (
                <GymSelectorModal
                    ticketId={gymModal.ticketId}
                    onClose={() => setGymModal(null)}
                    onActivated={() => {
                        setGymModal(null);
                        fetchTickets();
                    }}
                />
            )}
        </div>
    );
};

export default TicketsPage;
