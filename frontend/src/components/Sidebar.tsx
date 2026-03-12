import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Ticket, MapPin, User, Bell,
    ChevronLeft, ChevronRight, Building2, Shield,
    BarChart3, Newspaper
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const userLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/feed', icon: Newspaper, label: 'Feed' },
        { to: '/matches', icon: Users, label: 'Matches' },
        { to: '/tickets', icon: Ticket, label: 'Tickets' },
        { to: '/gyms', icon: MapPin, label: 'Nearby Gyms' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    const ownerLinks = [
        { to: '/owner/dashboard', icon: Building2, label: 'My Gyms' },
        { to: '/owner/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    const adminLinks = [
        { to: '/admin', icon: Shield, label: 'Admin Panel' },
        { to: '/admin/users', icon: Users, label: 'Manage Users' },
        { to: '/admin/gyms', icon: MapPin, label: 'Manage Gyms' },
        { to: '/admin/stats', icon: BarChart3, label: 'Statistics' },
    ];

    const links = user?.role === 'admin' ? adminLinks :
        user?.role === 'gymOwner' ? ownerLinks : userLinks;

    return (
        <aside className={`hidden lg:flex flex-col bg-dark-800 border-r border-dark-600/50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
            <div className="flex items-center justify-end p-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-white transition-colors"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            <nav className="flex-1 px-2 space-y-1">
                {links.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
              ${location.pathname === link.to
                                ? 'bg-primary/15 text-primary-light'
                                : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                            }`}
                    >
                        <link.icon className={`w-5 h-5 flex-shrink-0 ${location.pathname === link.to ? 'text-primary' : ''}`} />
                        {!collapsed && <span>{link.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {!collapsed && (
                <div className="p-4 border-t border-dark-600/50">
                    <div className="glass-card p-3">
                        <p className="text-xs font-semibold text-primary-light">Pro Tip</p>
                        <p className="text-[11px] text-dark-300 mt-1">Complete your profile to get better match suggestions!</p>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
