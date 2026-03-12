import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
    Shield, Users, MapPin, Ticket, UserCheck, Star, Loader2,
    Trash2, Search, RefreshCw, ChevronDown, BarChart3, Building2
} from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
    admin: 'text-red-400 bg-red-400/10 border-red-400/20',
    gymOwner: 'text-accent bg-accent/10 border-accent/20',
    user: 'text-secondary bg-secondary/10 border-secondary/20',
};

const AdminDashboard = () => {
    const [tab, setTab] = useState<'overview' | 'users' | 'gyms'>('overview');
    const [stats, setStats] = useState<any>(null);

    // Users state
    const [users, setUsers] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [usersLoading, setUsersLoading] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

    // Gyms state
    const [gyms, setGyms] = useState<any[]>([]);
    const [gymSearch, setGymSearch] = useState('');
    const [gymsLoading, setGymsLoading] = useState(false);
    const [deletingGymId, setDeletingGymId] = useState<string | null>(null);

    // Fetch stats
    useEffect(() => {
        api.get('/admin/stats').then(r => setStats(r.data.stats)).catch(() => { });
    }, []);

    // Fetch users
    const fetchUsers = useCallback(async (search = '') => {
        setUsersLoading(true);
        try {
            const res = await api.get(`/admin/users?search=${encodeURIComponent(search)}&limit=100`);
            setUsers(res.data.users || []);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    // Fetch gyms
    const fetchGyms = useCallback(async () => {
        setGymsLoading(true);
        try {
            const res = await api.get('/admin/gyms');
            setGyms(res.data.gyms || []);
        } finally {
            setGymsLoading(false);
        }
    }, []);

    useEffect(() => { if (tab === 'users') fetchUsers(userSearch); }, [tab]);
    useEffect(() => { if (tab === 'gyms') fetchGyms(); }, [tab]);

    // Debounced user search
    useEffect(() => {
        if (tab !== 'users') return;
        const t = setTimeout(() => fetchUsers(userSearch), 400);
        return () => clearTimeout(t);
    }, [userSearch]);

    const handleDeleteUser = async (id: string, name: string) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        setDeletingUserId(id);
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
        finally { setDeletingUserId(null); }
    };

    const handleRoleChange = async (id: string, role: string) => {
        setUpdatingRoleId(id);
        try {
            const res = await api.put(`/admin/users/${id}/role`, { role });
            setUsers(prev => prev.map(u => u._id === id ? { ...u, role: res.data.user.role } : u));
        } catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
        finally { setUpdatingRoleId(null); }
    };

    const handleDeleteGym = async (id: string, name: string) => {
        if (!window.confirm(`Delete gym "${name}"? This cannot be undone.`)) return;
        setDeletingGymId(id);
        try {
            await api.delete(`/admin/gyms/${id}`);
            setGyms(prev => prev.filter(g => g._id !== id));
        } catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
        finally { setDeletingGymId(null); }
    };

    const filteredGyms = gyms.filter(g =>
        gymSearch === '' ||
        g.name?.toLowerCase().includes(gymSearch.toLowerCase()) ||
        g.address?.city?.toLowerCase().includes(gymSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 hero-gradient">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-primary" /> Admin Dashboard
                        </h1>
                        <p className="text-sm text-dark-300 mt-0.5">Manage users, gyms, and platform data</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-dark-600/50 pb-0">
                    {([
                        { key: 'overview', label: 'Overview', icon: BarChart3 },
                        { key: 'users', label: 'Users', icon: Users },
                        { key: 'gyms', label: 'Gyms', icon: Building2 },
                    ] as const).map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-dark-300 hover:text-white'}`}>
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    ))}
                </div>

                {/* ── OVERVIEW TAB ── */}
                {tab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-primary' },
                                { label: 'Total Gyms', value: stats?.totalGyms ?? '—', icon: MapPin, color: 'text-accent' },
                                { label: 'Total Matches', value: stats?.totalMatches ?? '—', icon: UserCheck, color: 'text-secondary' },
                                { label: 'Active Tickets', value: stats?.activeTickets ?? '—', icon: Ticket, color: 'text-purple-400' },
                            ].map(s => (
                                <div key={s.label} className="glass-card p-5">
                                    <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                                    <p className="text-xs text-dark-400 mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Users by role */}
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-primary" /> Users by Role
                                </h3>
                                <div className="space-y-3">
                                    {stats?.usersByRole
                                        ? Object.entries(stats.usersByRole).map(([role, count]: [string, any]) => (
                                            <div key={role} className="flex items-center gap-3">
                                                <span className="text-xs text-dark-300 capitalize w-20">{role}</span>
                                                <div className="flex-1 bg-dark-600 rounded-full h-2">
                                                    <div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
                                                        style={{ width: `${stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0}%` }} />
                                                </div>
                                                <span className="text-sm font-bold text-white w-6 text-right">{count}</span>
                                            </div>
                                        ))
                                        : <p className="text-xs text-dark-400">Loading…</p>}
                                </div>
                            </div>

                            {/* Ticket stats */}
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Ticket className="w-4 h-4 text-secondary" /> Ticket Overview
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Total', value: stats?.totalTickets ?? '—', color: 'text-white' },
                                        { label: 'Active', value: stats?.activeTickets ?? '—', color: 'text-secondary' },
                                        { label: 'Completed', value: stats?.completedTickets ?? '—', color: 'text-purple-400' },
                                        {
                                            label: 'Success Rate',
                                            value: stats?.totalTickets > 0
                                                ? `${Math.round((stats.completedTickets / stats.totalTickets) * 100)}%`
                                                : '—',
                                            color: 'text-accent'
                                        },
                                    ].map(item => (
                                        <div key={item.label} className="p-4 rounded-xl bg-dark-700/50 text-center">
                                            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                                            <p className="text-[10px] text-dark-400 mt-1">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── USERS TAB ── */}
                {tab === 'users' && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email…"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="input-field pl-9 text-sm"
                                />
                            </div>
                            <button onClick={() => fetchUsers(userSearch)} className="btn-secondary text-xs py-2 px-3">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {usersLoading ? (
                            <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
                        ) : (
                            <div className="glass-card overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-dark-600/50 text-left">
                                            <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase">User</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase">Role</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase">Joined</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-10 text-dark-400 text-sm">No users found</td></tr>
                                        ) : users.map(u => (
                                            <tr key={u._id} className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                            {u.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{u.name}</p>
                                                            <p className="text-[10px] text-dark-400">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={u.role}
                                                            disabled={updatingRoleId === u._id}
                                                            onChange={e => handleRoleChange(u._id, e.target.value)}
                                                            className={`appearance-none text-xs font-semibold px-2.5 py-1 pr-6 rounded-lg border cursor-pointer bg-dark-800 ${ROLE_COLORS[u.role] || 'text-white'} disabled:opacity-50`}
                                                        >
                                                            <option value="user">user</option>
                                                            <option value="gymOwner">gymOwner</option>
                                                            <option value="admin">admin</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-dark-400" />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-dark-400">
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id, u.name)}
                                                        disabled={deletingUserId === u._id}
                                                        className="btn-danger text-xs py-1.5 px-2.5 disabled:opacity-50"
                                                    >
                                                        {deletingUserId === u._id
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <Trash2 className="w-3.5 h-3.5" />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="text-[10px] text-dark-500 px-4 py-2">{users.length} user{users.length !== 1 ? 's' : ''}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── GYMS TAB ── */}
                {tab === 'gyms' && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                <input
                                    type="text"
                                    placeholder="Search by gym name or city…"
                                    value={gymSearch}
                                    onChange={e => setGymSearch(e.target.value)}
                                    className="input-field pl-9 text-sm"
                                />
                            </div>
                            <button onClick={fetchGyms} className="btn-secondary text-xs py-2 px-3">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {gymsLoading ? (
                            <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
                        ) : (
                            <div className="glass-card overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-dark-600/50 text-left">
                                            <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase">Gym</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase">Location</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase">Rating</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGyms.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-10 text-dark-400 text-sm">No gyms found</td></tr>
                                        ) : filteredGyms.map(g => (
                                            <tr key={g._id} className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                                            <MapPin className="w-4 h-4 text-accent" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{g.name}</p>
                                                            <p className="text-[10px] text-dark-400">{g.facilities?.slice(0, 3).join(', ') || 'No facilities listed'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs text-white">{g.address?.area}, {g.address?.city}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {g.rating > 0 ? (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 text-accent fill-accent" />
                                                            <span className="text-xs font-semibold text-white">{g.rating?.toFixed(1)}</span>
                                                        </div>
                                                    ) : <span className="text-xs text-dark-500">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteGym(g._id, g.name)}
                                                        disabled={deletingGymId === g._id}
                                                        className="btn-danger text-xs py-1.5 px-2.5 disabled:opacity-50"
                                                    >
                                                        {deletingGymId === g._id
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <Trash2 className="w-3.5 h-3.5" />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="text-[10px] text-dark-500 px-4 py-2">{filteredGyms.length} gym{filteredGyms.length !== 1 ? 's' : ''}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
