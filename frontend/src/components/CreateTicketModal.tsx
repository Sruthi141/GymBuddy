import { useState } from 'react';
import { X, Ticket, Calendar, Dumbbell, Loader2 } from 'lucide-react';
import { ticketService } from '../services/ticketService';

interface CreateTicketModalProps {
    match: { matchId: string; user: { name: string } };
    onClose: () => void;
    onCreated: () => void;
}

const workoutTypes = [
    { value: 'strength', label: '🏋️ Strength Training' },
    { value: 'cardio', label: '🏃 Cardio' },
    { value: 'hiit', label: '⚡ HIIT' },
    { value: 'yoga', label: '🧘 Yoga' },
    { value: 'crossfit', label: '💪 CrossFit' },
    { value: 'general', label: '🤸 General Workout' },
];

const CreateTicketModal = ({ match, onClose, onCreated }: CreateTicketModalProps) => {
    const [form, setForm] = useState({
        workoutDate: '',
        workoutType: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Minimum date = today
    const today = new Date().toISOString().split('T')[0];

    const handleCreate = async () => {
        if (!form.workoutDate) { setError('Please select a workout date'); return; }
        if (!form.workoutType) { setError('Please select a workout type'); return; }
        setLoading(true);
        setError('');
        try {
            await ticketService.createTicket({
                matchId: match.matchId,
                workoutDate: form.workoutDate,
                workoutType: form.workoutType,
                notes: form.notes
            });
            onCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-secondary" /> Create Collaboration
                        </h2>
                        <p className="text-xs text-dark-300 mt-0.5">with <span className="text-white font-medium">{match.user.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Workout Date */}
                    <div>
                        <label className="block text-xs font-medium text-dark-300 mb-1.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Workout Date
                        </label>
                        <input
                            type="date"
                            value={form.workoutDate}
                            min={today}
                            onChange={e => setForm({ ...form, workoutDate: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    {/* Workout Type */}
                    <div>
                        <label className="block text-xs font-medium text-dark-300 mb-1.5 flex items-center gap-1">
                            <Dumbbell className="w-3.5 h-3.5" /> Workout Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {workoutTypes.map(w => (
                                <button
                                    key={w.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, workoutType: w.value })}
                                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${form.workoutType === w.value
                                        ? 'border-secondary bg-secondary/10 text-white'
                                        : 'border-dark-500 text-dark-300 hover:border-dark-400'
                                        }`}
                                >
                                    {w.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-medium text-dark-300 mb-1.5">Notes (optional)</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            rows={3}
                            className="input-field resize-none"
                            placeholder="e.g. Let's meet at 6 PM and start with warm-up..."
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-danger-light bg-danger/10 border border-danger/20 rounded-lg p-3">{error}</p>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
                        <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 text-sm py-2.5">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Ticket className="w-4 h-4" /> Create Ticket</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTicketModal;
