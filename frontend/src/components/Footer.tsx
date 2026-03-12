import { Link } from 'react-router-dom';
import { Dumbbell, Github, Twitter, Instagram, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark-800 border-t border-dark-600/50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Dumbbell className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">GymBuddy</span>
                        </Link>
                        <p className="text-sm text-dark-300 leading-relaxed">
                            Find your perfect workout partner. Match, collaborate, and achieve your fitness goals together.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-2">
                            {['How It Works', 'Find Matches', 'Browse Gyms', 'Pricing'].map(item => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-dark-300 hover:text-primary-light transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Support</h4>
                        <ul className="space-y-2">
                            {['Help Center', 'Safety', 'Terms of Service', 'Privacy Policy'].map(item => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-dark-300 hover:text-primary-light transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Connect</h4>
                        <div className="flex gap-3">
                            {[
                                { icon: Twitter, label: 'Twitter' },
                                { icon: Instagram, label: 'Instagram' },
                                { icon: Github, label: 'GitHub' },
                            ].map(social => (
                                <a
                                    key={social.label}
                                    href="#"
                                    className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center text-dark-300 hover:text-primary-light hover:bg-dark-600 transition-all"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-dark-600/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-dark-400">
                        © 2024 GymBuddy. All rights reserved.
                    </p>
                    <p className="text-xs text-dark-400 flex items-center gap-1">
                        Made with <Heart className="w-3 h-3 text-danger fill-danger" /> for fitness enthusiasts
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
