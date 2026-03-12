import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    BarChart3, Activity, Users, SwitchCamera, CheckCircle2, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OwnerAnalyticsPage = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('month');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/gyms/owner/visit-history');
                if (res.data?.gymStats) {
                    setStats(res.data.gymStats);
                }
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const totalVisitors = stats.reduce((sum, gym) => sum + gym.totalVisitors, 0);
    const totalCompleted = stats.reduce((sum, gym) => sum + gym.completedVisits, 0);
    const totalActive = stats.reduce((sum, gym) => sum + gym.activeVisits, 0);

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 hero-gradient">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-accent" />
                            Platform Analytics
                        </h1>
                        <p className="text-sm text-dark-300 mt-1">Detailed statistics across all your registered gyms</p>
                    </div>

                    <div className="flex bg-dark-800 p-1 rounded-lg">
                        {['week', 'month', 'year'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setSelectedTimeframe(tf)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${selectedTimeframe === tf
                                    ? 'bg-accent/20 text-accent'
                                    : 'text-dark-300 hover:text-white'
                                    }`}
                            >
                                This {tf}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : stats.length === 0 ? (
                    <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
                        <Activity className="w-16 h-16 text-dark-500 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Data Available Yet</h3>
                        <p className="text-dark-300 text-sm max-w-md mx-auto mb-6">
                            Analytics will appear here once users start booking tickets and visiting your gyms.
                        </p>
                        <Link to="/owner/dashboard" className="btn-secondary">Return to Dashboard</Link>
                    </div>
                ) : (
                    <>
                        {/* High Level Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Visitors', value: totalVisitors, icon: Users, color: 'primary' },
                                { label: 'Completed Visits', value: totalCompleted, icon: CheckCircle2, color: 'secondary' },
                                { label: 'Active Tickets', value: totalActive, icon: Activity, color: 'accent' },
                                { label: 'Completion Rate', value: totalVisitors ? `${Math.round((totalCompleted / totalVisitors) * 100)}%` : '0%', icon: TrendingUp, color: 'success' },
                            ].map(stat => (
                                <div key={stat.label} className="glass-card p-5 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110`}>
                                        <stat.icon className={`w-16 h-16 text-${stat.color}`} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 relative z-10">
                                        <div className={`w-8 h-8 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                                            <stat.icon className={`w-4 h-4 text-${stat.color}`} />
                                        </div>
                                        <span className="text-xs font-semibold text-dark-200">{stat.label}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white relative z-10">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Gym Performance Breakdown */}
                        <div className="glass-card p-6 mb-8">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <SwitchCamera className="w-5 h-5 text-primary" />
                                Breakdown by Gym
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-dark-600 text-dark-300 text-xs">
                                            <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Gym Name</th>
                                            <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-center">Total Visitors</th>
                                            <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-center">Completed</th>
                                            <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-center">Active</th>
                                            <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-right">Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-600/50 text-sm">
                                        {stats.map(gym => {
                                            const rate = gym.totalVisitors ? Math.round((gym.completedVisits / gym.totalVisitors) * 100) : 0;
                                            return (
                                                <tr key={gym.gymId} className="hover:bg-dark-700/30 transition-colors">
                                                    <td className="py-4 px-4 font-medium text-white">{gym.gymName}</td>
                                                    <td className="py-4 px-4 text-center">{gym.totalVisitors}</td>
                                                    <td className="py-4 px-4 text-center text-secondary">{gym.completedVisits}</td>
                                                    <td className="py-4 px-4 text-center text-accent">{gym.activeVisits}</td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="text-xs text-dark-300">{rate}%</span>
                                                            <div className="w-20 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${rate > 70 ? 'bg-success' : rate > 40 ? 'bg-secondary' : 'bg-primary'}`}
                                                                    style={{ width: `${rate}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OwnerAnalyticsPage;
