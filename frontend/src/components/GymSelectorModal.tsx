import { useState, useEffect } from 'react';
import { X, MapPin, Search, Loader2, Star, IndianRupee } from 'lucide-react';
import { gymService } from '../services/gymService';
import { ticketService } from '../services/ticketService';

interface GymSelectorModalProps {
    ticketId: string;
    onClose: () => void;
    onActivated: () => void;
}

const GymSelectorModal = ({ ticketId, onClose, onActivated }: GymSelectorModalProps) => {
    const [gyms, setGyms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [selectedGymId, setSelectedGymId] = useState('');
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const data = await gymService.getGyms();
                setGyms(data.gyms || []);
            } catch {
                setError('Failed to load gyms');
            } finally {
                setLoading(false);
            }
        };
        fetchGyms();
    }, []);

    const filtered = gyms.filter(g =>
        !search ||
        g.name?.toLowerCase().includes(search.toLowerCase()) ||
        g.address?.city?.toLowerCase().includes(search.toLowerCase()) ||
        g.address?.area?.toLowerCase().includes(search.toLowerCase())
    );

    const handleActivate = async () => {
        if (!selectedGymId) { setError('Please select a gym'); return; }
        setActivating(true);
        setError('');
        try {
            await ticketService.updateStatus({ ticketId, status: 'active', gymId: selectedGymId });
            onActivated();
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message || '';
            // Race condition: partner already activated it
            if (msg.includes('active to active') || msg.includes('already')) {
                setError('Your partner already activated this ticket! Refreshing…');
                setTimeout(() => { onActivated(); onClose(); }, 1800);
            } else {
                setError(msg || 'Failed to activate ticket');
            }
        } finally {
            setActivating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg p-6 animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-accent" /> Select a Gym
                        </h2>
                        <p className="text-xs text-dark-300 mt-0.5">Choose where you'll work out together</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search gyms by name or area..."
                        className="input-field pl-10"
                    />
                </div>

                {/* Gym List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-8">
                            <MapPin className="w-8 h-8 text-dark-500 mx-auto mb-2" />
                            <p className="text-sm text-dark-300">No gyms found</p>
                            <p className="text-xs text-dark-400 mt-1">A gym owner needs to register a gym first</p>
                        </div>
                    ) : (
                        filtered.map(gym => (
                            <button
                                key={gym._id}
                                onClick={() => setSelectedGymId(gym._id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${selectedGymId === gym._id
                                    ? 'border-accent bg-accent/10'
                                    : 'border-dark-600 hover:border-dark-400 bg-dark-700/30'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedGymId === gym._id ? 'bg-accent/20' : 'bg-dark-600'}`}>
                                    <MapPin className={`w-4 h-4 ${selectedGymId === gym._id ? 'text-accent' : 'text-dark-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{gym.name}</p>
                                    <p className="text-xs text-dark-400">{gym.address?.area ? `${gym.address.area}, ` : ''}{gym.address?.city}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        {gym.rating > 0 && (
                                            <span className="flex items-center gap-0.5 text-[10px] text-accent">
                                                <Star className="w-3 h-3 fill-accent" /> {gym.rating?.toFixed(1)}
                                            </span>
                                        )}
                                        {gym.pricing?.monthly && (
                                            <span className="flex items-center gap-0.5 text-[10px] text-dark-300">
                                                <IndianRupee className="w-2.5 h-2.5" />{gym.pricing.monthly}/mo
                                            </span>
                                        )}
                                        {gym.facilities?.slice(0, 2).map((f: string) => (
                                            <span key={f} className="text-[10px] text-dark-400 capitalize">{f}</span>
                                        ))}
                                    </div>
                                </div>
                                {selectedGymId === gym._id && (
                                    <div className="w-4 h-4 rounded-full bg-accent flex-shrink-0 mt-1 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>

                {error && (
                    <p className="text-xs text-danger-light bg-danger/10 border border-danger/20 rounded-lg p-3 mb-3">{error}</p>
                )}

                <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
                    <button
                        onClick={handleActivate}
                        disabled={!selectedGymId || activating}
                        className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50"
                    >
                        {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MapPin className="w-4 h-4" /> Activate & Go!</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GymSelectorModal;
