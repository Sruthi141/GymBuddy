import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gymService } from '../services/gymService';
import { paymentService } from '../services/paymentService';
import Sidebar from '../components/Sidebar';
import PageBackground from '../layouts/PageBackground';
import { MapPin, Star, Clock, Dumbbell, IndianRupee, ArrowLeft, Loader2, XCircle, CreditCard } from 'lucide-react';

const facilityIcons: Record<string, string> = {
    cardio: '🏃', weights: '🏋️', crossfit: '💪', yoga: '🧘',
    swimming: '🏊', sauna: '🧖', 'steam-room': '♨️',
    'personal-training': '👨‍🏫', 'group-classes': '👥',
    parking: '🅿️', shower: '🚿', locker: '🔐', cafe: '☕'
};

const GymDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [gym, setGym] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [payLoading, setPayLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchGym = async () => {
            try {
                setLoading(true);
                const data = await gymService.getGymById(id);
                setGym(data.gym);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load gym details');
            } finally {
                setLoading(false);
            }
        };
        fetchGym();
    }, [id]);

    return (
        <PageBackground image="https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=1600&q=80&auto=format" align="top">
            <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <Link to="/gyms" className="inline-flex items-center gap-1 text-sm text-dark-300 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Gyms
                    </Link>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="glass-card p-10 text-center">
                            <XCircle className="w-10 h-10 text-danger mx-auto mb-3" />
                            <p className="text-danger-light">{error}</p>
                            <Link to="/gyms" className="btn-secondary text-xs mt-4 inline-flex">Back to Gyms</Link>
                        </div>
                    ) : gym && (
                        <>
                            {/* Hero */}
                            <div className="glass-card overflow-hidden mb-6">
                                <div className="h-48 sm:h-64 bg-gradient-to-br from-primary/20 via-dark-700 to-secondary/20 relative flex items-center justify-center">
                                    <Dumbbell className="w-16 h-16 text-dark-500" />
                                    {gym.rating > 0 && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-dark-900/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                                            <Star className="w-4 h-4 text-accent fill-accent" />
                                            <span className="text-sm font-bold text-white">{gym.rating?.toFixed(1)}</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4 bg-dark-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
                                        <p className="text-xs text-dark-300">{gym.totalVisitors || 0} visitors</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h1 className="text-2xl font-bold text-white">{gym.name}</h1>
                                    <div className="flex items-center gap-1 mt-1 text-sm text-dark-300">
                                        <MapPin className="w-4 h-4" />
                                        {gym.address?.area ? `${gym.address.area}, ${gym.address.city}` : gym.address?.city}
                                    </div>
                                    {gym.description && (
                                        <p className="text-sm text-dark-200 mt-4 leading-relaxed">{gym.description}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left column */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="glass-card p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Facilities</h2>
                                        {gym.facilities?.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                {gym.facilities.map((f: string) => (
                                                    <div key={f} className="flex items-center gap-2 p-3 rounded-xl bg-dark-700/50">
                                                        <span className="text-lg">{facilityIcons[f] || '✓'}</span>
                                                        <span className="text-sm text-dark-200 capitalize">{f.replace(/-/g, ' ')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-dark-400">No facilities listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right column */}
                                <div className="space-y-6">
                                    {/* Pricing */}
                                    <div className="glass-card p-6">
                                        <h3 className="text-base font-bold text-white mb-4">Pricing</h3>
                                        <div className="space-y-3">
                                            {gym.pricing?.monthly ? (
                                                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                                                    <span className="text-sm text-dark-200">Monthly</span>
                                                    <span className="flex items-center gap-0.5 text-lg font-bold text-primary-light">
                                                        <IndianRupee className="w-4 h-4" />{gym.pricing.monthly}
                                                    </span>
                                                </div>
                                            ) : null}
                                            {gym.pricing?.dayPass ? (
                                                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50">
                                                    <span className="text-sm text-dark-200">Day Pass</span>
                                                    <span className="flex items-center gap-0.5 text-lg font-bold text-secondary">
                                                        <IndianRupee className="w-4 h-4" />{gym.pricing.dayPass}
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Hours */}
                                    {gym.openingHours?.weekdays && (
                                        <div className="glass-card p-6">
                                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-accent" /> Hours
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-dark-300">Weekdays</span>
                                                    <span className="text-white font-medium">
                                                        {gym.openingHours.weekdays.open} - {gym.openingHours.weekdays.close}
                                                    </span>
                                                </div>
                                                {gym.openingHours.weekends && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-dark-300">Weekends</span>
                                                        <span className="text-white font-medium">
                                                            {gym.openingHours.weekends.open} - {gym.openingHours.weekends.close}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <div className="glass-card p-6 border-primary/20">
                                        <h3 className="text-base font-bold text-white mb-2">Interested?</h3>
                                        <p className="text-xs text-dark-300 mb-4">Pay monthly in advance or select this gym when creating a collaboration ticket.</p>
                                        {user && gym.pricing?.monthly && (
                                            <button
                                                onClick={async () => {
                                                    if (!id || !gym.pricing?.monthly) return;
                                                    setPayLoading(true);
                                                    try {
                                                        const { url } = await paymentService.createCheckoutSession({
                                                            gymId: id,
                                                            amount: gym.pricing.monthly
                                                        });
                                                        if (url) window.location.href = url;
                                                    } catch (e: unknown) {
                                                        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Payment unavailable';
                                                        alert(msg);
                                                    } finally {
                                                        setPayLoading(false);
                                                    }
                                                }}
                                                disabled={payLoading}
                                                className="btn-primary w-full justify-center text-sm py-2.5 mb-3"
                                            >
                                                {payLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> Pay Monthly (₹{gym.pricing.monthly})</>}
                                            </button>
                                        )}
                                        <Link to="/tickets" className="btn-secondary w-full justify-center text-sm py-2.5">
                                            View My Tickets
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            </div>
        </PageBackground>
    );
};

export default GymDetailPage;
