import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Bell, CheckCheck, Loader2, RefreshCw } from 'lucide-react';

const typeIcons: Record<string, string> = {
    'match-request': '🤝',
    'match-accepted': '✅',
    'match-rejected': '❌',
    'ticket-created': '🎫',
    'ticket-confirmed': '📋',
    'ticket-active': '🏋️',
    'ticket-completed': '🏆',
    'ticket-cancelled': '🚫',
    'nearby-gym': '📍',
    'system': '⚙️',
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const markAllRead = async () => {
        try {
            setMarkingAll(true);
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all read', err);
        } finally {
            setMarkingAll(false);
        }
    };

    const markOneRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark notification read', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="flex min-h-screen pt-16">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Bell className="w-6 h-6 text-accent" /> Notifications
                            </h1>
                            <p className="text-sm text-dark-300 mt-1">{unreadCount} unread notifications</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={fetchNotifications} className="btn-secondary text-xs py-2" disabled={loading}>
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} disabled={markingAll} className="btn-secondary text-xs py-2">
                                    <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-16">
                            <Bell className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                            <p className="text-dark-300">No notifications yet</p>
                            <p className="text-xs text-dark-400 mt-1">We'll notify you about matches and collaborations</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map(n => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.read && markOneRead(n._id)}
                                    className={`glass-card p-4 flex items-start gap-3 transition-all cursor-pointer ${!n.read ? 'border-primary/20 bg-primary/5 hover:bg-primary/10' : 'hover:bg-dark-700/30'}`}
                                >
                                    <div className="text-xl flex-shrink-0 mt-0.5">{typeIcons[n.type] || '🔔'}</div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-dark-200'}`}>{n.message}</p>
                                        <p className="text-[10px] text-dark-400 mt-1">
                                            {new Date(n.createdAt).toLocaleString('en-IN', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;
