import StatusBadge from './StatusBadge';
import { Calendar, MapPin, Users, ChevronRight, Clock } from 'lucide-react';

interface TicketCardProps {
    ticket: {
        _id: string;
        status: string;
        workoutDate?: string;
        workoutType?: string;
        notes?: string;
        participants?: Array<{ _id: string; name: string; profilePicture?: string }>;
        createdBy?: { _id: string; name: string } | string;
        gym?: { _id: string; name: string; address?: { city: string } } | null;
        match?: { compatibilityScore?: number } | null;
        createdAt?: string;
    };
    currentUserId?: string;
    onAction?: (ticketId: string, action: string) => void;
}

const TicketCard = ({ ticket, currentUserId, onAction }: TicketCardProps) => {
    const partner = ticket.participants?.find(p => p._id !== currentUserId);

    // Resolve createdBy id whether it's an object or raw string
    const createdById = typeof ticket.createdBy === 'object'
        ? ticket.createdBy?._id
        : ticket.createdBy;

    // If createdBy is missing (old ticket), default to showing all buttons for everyone
    const isCreator = createdById ? createdById === currentUserId : true;

    /**
     * Role-aware button rules per status:
     *
     * pending  → CREATOR: see only "Cancel" + a waiting message
     *            PARTNER: see "Confirm" + "Cancel"
     *
     * confirmed → BOTH can "Select Gym & Activate" OR "Cancel"
     *             (backend prevents double-activation; GymSelectorModal
     *              handles the race-condition error gracefully)
     *
     * active   → BOTH: "Mark Complete" + "Cancel"
     *
     * completed / cancelled → no actions
     */
    const getActions = () => {
        switch (ticket.status) {
            case 'pending':
                if (isCreator) {
                    // Creator is waiting — no confirm button, just cancel
                    return {
                        waiting: true,
                        waitingMsg: 'Waiting for partner to confirm…',
                        buttons: [{ label: 'Cancel', action: 'cancelled', style: 'btn-danger' }]
                    };
                }
                return {
                    waiting: false,
                    buttons: [
                        { label: 'Confirm', action: 'confirmed', style: 'btn-success' },
                        { label: 'Cancel', action: 'cancelled', style: 'btn-danger' }
                    ]
                };

            case 'confirmed':
                return {
                    waiting: false,
                    buttons: [
                        { label: 'Select Gym & Activate', action: 'active', style: 'btn-primary' },
                        { label: 'Cancel', action: 'cancelled', style: 'btn-danger' }
                    ]
                };

            case 'active':
                return {
                    waiting: false,
                    buttons: [
                        { label: 'Mark Complete', action: 'completed', style: 'btn-success' },
                        { label: 'Cancel', action: 'cancelled', style: 'btn-danger' }
                    ]
                };

            default:
                return { waiting: false, buttons: [] };
        }
    };

    const { waiting, waitingMsg, buttons } = getActions() as any;

    return (
        <div className="glass-card p-5 hover:border-primary/20 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {partner && (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                            {partner.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h4 className="text-sm font-semibold text-white capitalize">
                            {ticket.workoutType || 'Workout Session'}
                        </h4>
                        {partner && (
                            <p className="text-xs text-dark-300 flex items-center gap-1">
                                <Users className="w-3 h-3" /> with {partner.name}
                            </p>
                        )}
                    </div>
                </div>
                <StatusBadge status={ticket.status} />
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-dark-300">
                {ticket.workoutDate && (
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ticket.workoutDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}
                    </span>
                )}
                {ticket.gym && (
                    <span className="flex items-center gap-1 text-accent font-medium">
                        <MapPin className="w-3 h-3" />
                        {ticket.gym.name}
                    </span>
                )}
                {ticket.match?.compatibilityScore && (
                    <span className="text-secondary font-semibold">
                        {ticket.match.compatibilityScore}% match
                    </span>
                )}
            </div>

            {ticket.notes && (
                <p className="text-xs text-dark-400 mt-2 italic">"{ticket.notes}"</p>
            )}

            {/* Role-aware actions */}
            {onAction && (buttons.length > 0 || waiting) && (
                <div className="mt-4 pt-3 border-t border-dark-600/50">
                    {waiting && (
                        <p className="text-xs text-dark-400 flex items-center gap-1.5 mb-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            {waitingMsg}
                        </p>
                    )}
                    <div className="flex items-center gap-2">
                        {buttons.map((a: any) => (
                            <button
                                key={a.action}
                                onClick={() => onAction(ticket._id, a.action)}
                                className={`${a.style} text-xs py-1.5 px-3 flex items-center gap-1`}
                            >
                                {a.label} <ChevronRight className="w-3 h-3" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketCard;
