import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Dumbbell, Menu, X, Bell, User, LogOut, LayoutDashboard,
    Users, Ticket, MapPin, Shield, Building2, Newspaper, CreditCard
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setProfileOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinks = user
        ? user.role === 'gymOwner'
            ? [
                { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
            ]
            : [
                { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { label: 'Feed', path: '/feed', icon: Newspaper },
                { label: 'Matches', path: '/matches', icon: Users },
                { label: 'Tickets', path: '/tickets', icon: Ticket },
                { label: 'Gyms', path: '/gyms', icon: MapPin },
                { label: 'Payments', path: '/payments', icon: CreditCard },
            ]
        : [
            { label: 'Home', path: '/', icon: null },
            { label: 'Features', path: '/#features', icon: null },
            { label: 'About', path: '/#about', icon: null },
        ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-600/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={user ? (user.role === 'gymOwner' ? '/owner/dashboard' : user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-primary-light bg-clip-text text-transparent">
                            GymBuddy
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                  ${isActive(link.path)
                                        ? 'bg-primary/15 text-primary-light'
                                        : 'text-dark-200 hover:text-white hover:bg-dark-700'
                                    }`}
                            >
                                {link.icon && <link.icon className="w-4 h-4" />}
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <Link
                                    to="/notifications"
                                    className="relative p-2 rounded-lg hover:bg-dark-700 transition-colors text-dark-200 hover:text-white"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full text-[10px] flex items-center justify-center font-bold">
                                        3
                                    </span>
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-700 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium text-dark-100">{user.name.split(' ')[0]}</span>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 glass-card p-2 animate-slideDown">
                                            <div className="px-3 py-2 border-b border-dark-600 mb-1">
                                                <p className="text-sm font-semibold text-white">{user.name}</p>
                                                <p className="text-xs text-dark-300">{user.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/20 text-primary-light uppercase">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <Link to="/profile" onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
                                                <User className="w-4 h-4" /> Profile
                                            </Link>
                                            {user.role === 'user' && (
                                                <Link to="/payments" onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
                                                    <CreditCard className="w-4 h-4" /> Payments
                                                </Link>
                                            )}
                                            {user.role === 'gymOwner' && (
                                                <Link to="/owner/dashboard" onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
                                                    <Building2 className="w-4 h-4" /> Gym Dashboard
                                                </Link>
                                            )}
                                            {user.role === 'admin' && (
                                                <Link to="/admin" onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
                                                    <Shield className="w-4 h-4" /> Admin Panel
                                                </Link>
                                            )}
                                            <button onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger-light hover:bg-danger/10 transition-colors">
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
                            </div>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-dark-700 text-dark-200"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-4 animate-slideDown">
                        <div className="flex flex-col gap-1 pt-2">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2
                    ${isActive(link.path) ? 'bg-primary/15 text-primary-light' : 'text-dark-200 hover:bg-dark-700'}`}
                                >
                                    {link.icon && <link.icon className="w-4 h-4" />}
                                    {link.label}
                                </Link>
                            ))}
                            {!user && (
                                <div className="flex gap-2 pt-2 border-t border-dark-600 mt-2">
                                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm flex-1 justify-center">Login</Link>
                                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm flex-1 justify-center">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
