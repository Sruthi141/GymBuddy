interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    confirmed: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
    active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    completed: { bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
    cancelled: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
    accepted: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    rejected: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
};

const StatusBadge = ({ status, size = 'sm' }: StatusBadgeProps) => {
    const config = statusConfig[status] || statusConfig.pending;
    const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold capitalize ${config.bg} ${config.text} ${sizeClasses}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {status}
        </span>
    );
};

export default StatusBadge;
