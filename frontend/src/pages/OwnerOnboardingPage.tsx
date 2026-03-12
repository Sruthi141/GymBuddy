import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gymService } from '../services/gymService';
import {
    ChevronRight, ChevronLeft, Loader2, CheckCircle2,
    Building2, Dumbbell, IndianRupee, Clock, Mail, PartyPopper
} from 'lucide-react';

const steps = ['basics', 'facilities', 'pricing', 'success'] as const;

const OwnerOnboardingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        city: '',
        area: '',
        description: '',
        facilities: [] as string[],
        monthlyPrice: '',
        dayPassPrice: '',
        weekdayOpen: '06:00',
        weekdayClose: '22:00',
        weekendOpen: '07:00',
        weekendClose: '20:00'
    });

    const toggleFacility = (facility: string) => {
        setForm(prev => ({
            ...prev,
            facilities: prev.facilities.includes(facility)
                ? prev.facilities.filter(f => f !== facility)
                : [...prev.facilities, facility]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Attempt to get coordinates if available
            let lat: number | undefined;
            let lng: number | undefined;

            try {
                if (navigator.geolocation) {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                }
            } catch (e) {
                // Ignore geolocation errors during gym creation
            }

            await gymService.createGym({
                name: form.name,
                address: { city: form.city, area: form.area },
                latitude: lat,
                longitude: lng,
                description: form.description,
                facilities: form.facilities,
                pricing: {
                    monthly: parseInt(form.monthlyPrice) || 0,
                    dayPass: parseInt(form.dayPassPrice) || 0
                },
                openingHours: {
                    weekdays: { open: form.weekdayOpen, close: form.weekdayClose },
                    weekends: { open: form.weekendOpen, close: form.weekendClose }
                }
            });
        } catch (err) {
            console.error('Gym creation failed:', err);
        } finally {
            setLoading(false);
            setStep(3); // Go to success
        }
    };

    const renderStep = () => {
        switch (steps[step]) {
            case 'basics':
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-white">Your Gym Details</h2>
                        </div>
                        <p className="text-sm text-dark-300">Let's get your gym listed on GymBuddy.</p>

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Gym Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                className="input-field" placeholder="FitZone Pro Gym" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-200 mb-1.5">City</label>
                                <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                    className="input-field" placeholder="Mumbai" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-200 mb-1.5">Area</label>
                                <input type="text" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}
                                    className="input-field" placeholder="Andheri West" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                className="input-field min-h-[80px] resize-none" placeholder="Describe your gym, equipment, specialties..." maxLength={500} />
                            <p className="text-xs text-dark-400 mt-1">{form.description.length}/500</p>
                        </div>
                    </div>
                );

            case 'facilities':
                return (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="flex items-center gap-2 mb-2">
                            <Dumbbell className="w-5 h-5 text-secondary" />
                            <h2 className="text-xl font-bold text-white">Facilities & Equipment</h2>
                        </div>
                        <p className="text-sm text-dark-300">Select all facilities available at your gym.</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'weights', label: '🏋️ Free Weights' },
                                { value: 'cardio', label: '🏃 Cardio Machines' },
                                { value: 'crossfit', label: '💪 CrossFit Zone' },
                                { value: 'yoga', label: '🧘 Yoga Studio' },
                                { value: 'swimming', label: '🏊 Swimming Pool' },
                                { value: 'sauna', label: '🧖 Sauna' },
                                { value: 'steam-room', label: '♨️ Steam Room' },
                                { value: 'personal-training', label: '👨‍🏫 Personal Training' },
                                { value: 'group-classes', label: '👥 Group Classes' },
                                { value: 'parking', label: '🅿️ Parking' },
                                { value: 'shower', label: '🚿 Showers' },
                                { value: 'locker', label: '🔐 Lockers' },
                                { value: 'cafe', label: '☕ Cafe / Juice Bar' },
                                { value: 'physiotherapy', label: '🩺 Physiotherapy' },
                            ].map(facility => (
                                <button key={facility.value} type="button" onClick={() => toggleFacility(facility.value)}
                                    className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${form.facilities.includes(facility.value)
                                        ? 'border-secondary bg-secondary/10 text-white'
                                        : 'border-dark-500 text-dark-300 hover:border-dark-400'
                                        }`}>
                                    {facility.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'pricing':
                return (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="flex items-center gap-2 mb-2">
                            <IndianRupee className="w-5 h-5 text-accent" />
                            <h2 className="text-xl font-bold text-white">Pricing & Hours</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-200 mb-1.5">Monthly Fee (₹)</label>
                                <input type="number" value={form.monthlyPrice} onChange={e => setForm({ ...form, monthlyPrice: e.target.value })}
                                    className="input-field" placeholder="1500" min="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-200 mb-1.5">Day Pass (₹)</label>
                                <input type="number" value={form.dayPassPrice} onChange={e => setForm({ ...form, dayPassPrice: e.target.value })}
                                    className="input-field" placeholder="200" min="0" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-2 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-accent" /> Opening Hours
                            </label>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-dark-700/50 border border-dark-500">
                                    <p className="text-xs font-semibold text-dark-300 mb-2">Weekdays (Mon–Fri)</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-dark-400 mb-1">Open</label>
                                            <input type="time" value={form.weekdayOpen} onChange={e => setForm({ ...form, weekdayOpen: e.target.value })} className="input-field text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-dark-400 mb-1">Close</label>
                                            <input type="time" value={form.weekdayClose} onChange={e => setForm({ ...form, weekdayClose: e.target.value })} className="input-field text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-dark-700/50 border border-dark-500">
                                    <p className="text-xs font-semibold text-dark-300 mb-2">Weekends (Sat–Sun)</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-dark-400 mb-1">Open</label>
                                            <input type="time" value={form.weekendOpen} onChange={e => setForm({ ...form, weekendOpen: e.target.value })} className="input-field text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-dark-400 mb-1">Close</label>
                                            <input type="time" value={form.weekendClose} onChange={e => setForm({ ...form, weekendClose: e.target.value })} className="input-field text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center py-8 animate-fadeIn">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-6">
                            <PartyPopper className="w-10 h-10 text-secondary" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">You're All Set! 🎉</h2>
                        <p className="text-sm text-dark-300 max-w-xs mx-auto mb-6">
                            Your gym has been registered on GymBuddy.
                        </p>

                        {/* Only show verification notice once — skip if already verified */}
                        {!(user as any)?.isEmailVerified && (
                            <div className="glass-card p-4 max-w-sm mx-auto mb-6 border-accent/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-accent" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-white">Verification Email Sent</p>
                                        <p className="text-[11px] text-dark-300">
                                            Check <strong className="text-accent-light">{user?.email}</strong> to verify your account
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button onClick={() => navigate('/owner/dashboard')} className="btn-primary text-sm py-3 px-8">
                            Go to Dashboard <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 hero-gradient">
            <div className="w-full max-w-lg">
                {/* Progress */}
                {step < 3 && (
                    <div className="flex items-center gap-2 mb-8">
                        {steps.slice(0, 3).map((_, i) => (
                            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-secondary' : 'bg-dark-600'}`} />
                        ))}
                    </div>
                )}

                <div className="glass-card p-6 sm:p-8">
                    {step < 3 && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-secondary uppercase">Step {step + 1} of 3</span>
                        </div>
                    )}

                    {renderStep()}

                    {step < 3 && (
                        <div className="flex items-center justify-between mt-8 pt-4 border-t border-dark-600/50">
                            <button
                                onClick={() => setStep(Math.max(0, step - 1))}
                                disabled={step === 0}
                                className="btn-secondary text-sm py-2 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>

                            {step < 2 ? (
                                <button onClick={() => setStep(step + 1)} className="btn-primary text-sm py-2">
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={handleSubmit} disabled={loading} className="btn-success text-sm py-2 px-6">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Register Gym <CheckCircle2 className="w-4 h-4" /></>}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerOnboardingPage;
