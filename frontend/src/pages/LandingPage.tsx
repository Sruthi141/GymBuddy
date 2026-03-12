import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { features, testimonials } from '../data/mockData';
import {
    ArrowRight, Dumbbell, Users, MapPin, Star, ChevronRight,
    Target, Zap, TrendingUp, CheckCircle2, Building2, CreditCard,
    MessageCircle, Shield
} from 'lucide-react';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            {/* Hero Section - Premium gym visuals */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Background: gym imagery with dark overlay */}
                <div className="absolute inset-0 bg-dark-950">
                    <img
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80&auto=format"
                        alt=""
                        className="w-full h-full object-cover opacity-40"
                        loading="eager"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/90 to-dark-950/60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-dark-950/40" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-primary-light text-sm font-semibold mb-6 animate-fadeIn">
                            <Zap className="w-4 h-4" />
                            AI-Powered Partner Matching
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                            <span className="text-white">Train Smarter.</span>
                            <br />
                            <span className="bg-gradient-to-r from-primary-light via-primary to-secondary bg-clip-text text-transparent">
                                Train Together.
                            </span>
                        </h1>

                        <p className="mt-6 text-lg sm:text-xl text-dark-200 max-w-xl leading-relaxed">
                            Find your perfect workout partner. GymBuddy matches you with compatible gym partners,
                            handles payments to gym owners, and keeps you accountable.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
                            {user ? (
                                <Link to="/dashboard" className="btn-primary text-base py-3.5 px-8 group">
                                    Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn-primary text-base py-3.5 px-8 group">
                                        Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link to="/login" className="btn-secondary text-base py-3.5 px-8">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-8 mt-12 text-sm">
                            {[
                                { value: '10K+', label: 'Active Users' },
                                { value: '500+', label: 'Gyms Listed' },
                                { value: '95%', label: 'Match Rate' },
                            ].map(stat => (
                                <div key={stat.label}>
                                    <span className="text-2xl font-black text-white">{stat.value}</span>
                                    <span className="text-dark-400 ml-1">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features - Clean grid */}
            <section id="features" className="py-24 px-4 bg-dark-900/80">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title text-3xl">Why GymBuddy</h2>
                        <p className="text-dark-300 mt-3 max-w-xl mx-auto">
                            Everything you need to find your perfect gym partner and stay consistent
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div key={i} className="glass-card p-6 hover:border-primary/25 transition-all group">
                                <div className="text-3xl mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-light transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-dark-300 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title text-3xl">How It Works</h2>
                        <p className="text-dark-300 mt-3 max-w-xl mx-auto">
                            Get matched with your ideal gym partner in three simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { step: '01', title: 'Create Your Profile', desc: 'Tell us about your fitness goals, schedule, experience, and preferred workout style.', icon: Target },
                            { step: '02', title: 'Get Matched', desc: 'Our algorithm finds compatible partners based on location, time, goals, and experience.', icon: Users },
                            { step: '03', title: 'Train Together', desc: 'Connect, pick a gym, pay monthly, and start your fitness journey together.', icon: Dumbbell },
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className="glass-card p-7 hover:border-primary/20 transition-all">
                                    <div className="absolute -top-2 -left-1 text-4xl font-black text-dark-600">{item.step}</div>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-5">
                                        <item.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-dark-300 leading-relaxed">{item.desc}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-5 w-10 h-0.5 bg-dark-600 -translate-y-1/2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Matching Showcase */}
            <section className="py-24 px-4 bg-dark-900/80">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="section-title text-3xl mb-4">Smart Compatibility Matching</h2>
                            <p className="text-dark-300 mb-8 leading-relaxed">
                                Our algorithm analyzes location, schedule, goals, and experience to find your ideal workout partner.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { label: 'Location', value: 30, icon: MapPin },
                                    { label: 'Workout Time', value: 25, icon: TrendingUp },
                                    { label: 'Fitness Goals', value: 25, icon: Target },
                                    { label: 'Experience', value: 20, icon: Zap },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-4">
                                        <item.icon className="w-5 h-5 text-primary" />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-white font-medium">{item.label}</span>
                                                <span className="text-secondary">+{item.value} pts</span>
                                            </div>
                                            <div className="w-full bg-dark-600 rounded-full h-2">
                                                <div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: '100%' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <div className="flex items-center justify-center mb-6">
                                <div className="relative">
                                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="8" fill="none" className="text-dark-600" />
                                        <circle cx="60" cy="60" r="50" stroke="url(#g1)" strokeWidth="8" fill="none" strokeDasharray="314" strokeDashoffset="63" strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="g1"><stop offset="0%" stopColor="#00d9b5" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
                                        </defs>
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white">80%</span>
                                </div>
                            </div>
                            <p className="text-center font-semibold text-primary-light mb-6">Excellent Match!</p>
                            <div className="space-y-3">
                                {['Same City', 'Same Workout Time', 'Similar Goals', 'Compatible Experience'].map((l, i) => (
                                    <div key={l} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-700/50">
                                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${i < 3 ? 'text-secondary' : 'text-dark-500'}`} />
                                        <span className={i < 3 ? 'text-white' : 'text-dark-400'}>{l}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gym Owner Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 border-primary/20">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                                <Building2 className="w-4 h-4" /> For Gym Owners
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                List Your Gym. Get Paid Monthly. Grow Your Business.
                            </h2>
                            <p className="text-dark-300 mb-6 leading-relaxed">
                                GymBuddy brings motivated pairs of workout partners to your facility. Receive membership payments in advance with our secure payment system.
                            </p>
                            <Link to="/register" className="btn-primary inline-flex">
                                List Your Gym <ArrowRight className="w-5 h-5 ml-1" />
                            </Link>
                        </div>
                        <div className="flex-1 w-full max-w-sm">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Direct payments', icon: CreditCard },
                                    { label: 'Payment reminders', icon: MessageCircle },
                                    { label: 'Secure & compliant', icon: Shield },
                                ].map(({ label, icon: Icon }) => (
                                    <div key={label} className="glass-card p-4 flex items-center gap-3">
                                        <Icon className="w-5 h-5 text-primary" />
                                        <span className="text-sm font-medium text-white">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Teaser */}
            <section className="py-24 px-4 bg-dark-900/80">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="section-title text-3xl mb-4">Simple Monthly Memberships</h2>
                    <p className="text-dark-300 mb-8 max-w-xl mx-auto">
                        Pay your gym owner monthly in advance. Never miss a payment with smart reminders.
                    </p>
                    <div className="glass-card p-8 max-w-md mx-auto border-primary/20">
                        <div className="text-4xl font-black text-white mb-2">Pay Monthly</div>
                        <p className="text-dark-300 mb-6">Secure payments. Due date reminders. Payment history.</p>
                        <Link to="/register" className="btn-primary">
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title text-3xl">What Our Users Say</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <div key={i} className="glass-card p-6 hover:border-primary/20 transition-all">
                                <div className="flex gap-1 mb-4">
                                    {Array(5).fill(0).map((_, j) => (
                                        <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                                    ))}
                                </div>
                                <p className="text-dark-200 leading-relaxed mb-5 italic">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-dark-600/50">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark-900 text-sm font-bold">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{t.name}</p>
                                        <p className="text-xs text-dark-400">{t.role}</p>
                                    </div>
                                    <span className="ml-auto text-lg font-black text-secondary">{t.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4 hero-gradient">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                        Ready to Find Your Gym Partner?
                    </h2>
                    <p className="text-dark-300 mb-8 max-w-xl mx-auto">
                        Join thousands of fitness enthusiasts who found their perfect workout partner through GymBuddy.
                    </p>
                    <Link to={user ? "/dashboard" : "/register"} className="btn-primary text-lg py-4 px-10 inline-flex">
                        {user ? 'Go to Dashboard' : 'Start Matching Now'} <ChevronRight className="w-5 h-5 ml-1" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
