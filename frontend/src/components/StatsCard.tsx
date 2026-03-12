import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: { value: string; positive: boolean };
    color?: 'primary' | 'secondary' | 'accent' | 'danger';
}

const colorMap = {
    primary: { bg: 'bg-primary/15', text: 'text-primary-light', icon: 'text-primary' },
    secondary: { bg: 'bg-secondary/15', text: 'text-secondary-light', icon: 'text-secondary' },
    accent: { bg: 'bg-accent/15', text: 'text-accent-light', icon: 'text-accent' },
    danger: { bg: 'bg-danger/15', text: 'text-danger-light', icon: 'text-danger' },
};

const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }: StatsCardProps) => {
    const colors = colorMap[color];

    return (
        <div className="glass-card p-5 hover:border-primary/20 transition-all group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-dark-300 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-secondary' : 'text-danger'}`}>
                            {trend.positive ? '↑' : '↓'} {trend.value}
                        </p>
                    )}
                </div>
                <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
