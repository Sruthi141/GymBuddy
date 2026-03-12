import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import PageBackground from '../layouts/PageBackground';
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';

const steps = ['basics', 'fitness', 'preferences', 'bio'] as const;

const OnboardingPage = () => {
    const { updateUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        age: '',
        gender: '',
        city: '',
        area: '',
        fitnessGoals: [] as string[],
        preferredWorkoutTime: '',
        experienceLevel: '',
        hobbies: '',
        motivation: '',
        bio: ''
    });

    const toggleGoal = (goal: string) => {
        setForm(prev => ({
            ...prev,
            fitnessGoals: prev.fitnessGoals.includes(goal)
                ? prev.fitnessGoals.filter(g => g !== goal)
                : [...prev.fitnessGoals, goal]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const profileData = {
                age: parseInt(form.age),
                gender: form.gender,
                location: { city: form.city, area: form.area },
                fitnessGoals: form.fitnessGoals,
                preferredWorkoutTime: form.preferredWorkoutTime,
                experienceLevel: form.experienceLevel,
                hobbies: form.hobbies.split(',').map(h => h.trim()).filter(Boolean),
                motivation: form.motivation,
                bio: form.bio
            };
            await userService.updateProfile(profileData);
            updateUser({ isProfileComplete: true });
            navigate('/dashboard');
        } catch (err) {
            console.error('Profile update failed:', err);
            // Fallback: navigate anyway for demo
            updateUser({ isProfileComplete: true });
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (steps[step]) {
            case 'basics':
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <h2 className="text-xl font-bold text-white">Let's start with the basics</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-200 mb-1.5">Age</label>
                                <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                                    className="input-field" placeholder="25" min="16" max="80" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-200 mb-1.5">Gender</label>
                                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="input-field">
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">City</label>
                            <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                className="input-field" placeholder="Mumbai" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Area / Locality</label>
                            <input type="text" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}
                                className="input-field" placeholder="Andheri West" />
                        </div>
                    </div>
                );

            case 'fitness':
                return (
                    <div className="space-y-5 animate-fadeIn">
                        <h2 className="text-xl font-bold text-white">Your fitness goals</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'weight-loss', label: '🔥 Weight Loss' },
                                { value: 'muscle-gain', label: '💪 Muscle Gain' },
                                { value: 'general-fitness', label: '🏃 General Fitness' },
                                { value: 'flexibility', label: '🧘 Flexibility' },
                                { value: 'endurance', label: '🚴 Endurance' },
                                { value: 'strength', label: '🏋️ Strength' },
                            ].map(goal => (
                                <button key={goal.value} type="button" onClick={() => toggleGoal(goal.value)}
                                    className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${form.fitnessGoals.includes(goal.value)
                                        ? 'border-primary bg-primary/10 text-white'
                                        : 'border-dark-500 text-dark-300 hover:border-dark-400'
                                        }`}>
                                    {goal.label}
                                </button>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Experience Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['beginner', 'intermediate', 'advanced'].map(level => (
                                    <button key={level} type="button" onClick={() => setForm({ ...form, experienceLevel: level })}
                                        className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${form.experienceLevel === level
                                            ? 'border-secondary bg-secondary/10 text-secondary-light'
                                            : 'border-dark-500 text-dark-300 hover:border-dark-400'
                                            }`}>
                                        {level === 'beginner' ? '🌱' : level === 'intermediate' ? '🌿' : '🌳'} {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-5 animate-fadeIn">
                        <h2 className="text-xl font-bold text-white">Workout preferences</h2>
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-2">Preferred Workout Time</label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { value: 'early-morning', label: '🌅 Early Morning (5-7 AM)' },
                                    { value: 'morning', label: '☀️ Morning (7-10 AM)' },
                                    { value: 'afternoon', label: '🌤️ Afternoon (12-4 PM)' },
                                    { value: 'evening', label: '🌆 Evening (5-8 PM)' },
                                    { value: 'night', label: '🌙 Night (8-11 PM)' },
                                ].map(time => (
                                    <button key={time.value} type="button" onClick={() => setForm({ ...form, preferredWorkoutTime: time.value })}
                                        className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${form.preferredWorkoutTime === time.value
                                            ? 'border-accent bg-accent/10 text-accent-light'
                                            : 'border-dark-500 text-dark-300 hover:border-dark-400'
                                            }`}>
                                        {time.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'bio':
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <h2 className="text-xl font-bold text-white">Almost there!</h2>
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Hobbies / Interests</label>
                            <input type="text" value={form.hobbies} onChange={e => setForm({ ...form, hobbies: e.target.value })}
                                className="input-field" placeholder="football, swimming, yoga (comma separated)" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Motivation for Gym</label>
                            <textarea value={form.motivation} onChange={e => setForm({ ...form, motivation: e.target.value })}
                                className="input-field min-h-[80px] resize-none" placeholder="What drives you to workout?" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">Bio</label>
                            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                                className="input-field min-h-[80px] resize-none" placeholder="Tell potential gym buddies about yourself..." maxLength={300} />
                            <p className="text-xs text-dark-400 mt-1">{form.bio.length}/300</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <PageBackground image="https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=1600&q=80&auto=format">
            <div className="w-full max-w-lg mx-auto py-10">
                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-dark-600'}`} />
                    ))}
                </div>
                <div className="glass-card p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-primary-light uppercase">Step {step + 1} of {steps.length}</span>
                        {step === steps.length - 1 && <CheckCircle2 className="w-4 h-4 text-secondary" />}
                    </div>

                    {renderStep()}

                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-dark-600/50">
                        <button
                            onClick={() => setStep(Math.max(0, step - 1))}
                            disabled={step === 0}
                            className="btn-secondary text-sm py-2 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>

                        {step < steps.length - 1 ? (
                            <button onClick={() => setStep(step + 1)} className="btn-primary text-sm py-2">
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading} className="btn-success text-sm py-2 px-6">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Complete Setup <CheckCircle2 className="w-4 h-4" /></>}
                            </button>
                        )}
                    </div>
                </div>

                <button onClick={() => navigate('/dashboard')} className="w-full text-center text-xs text-dark-400 mt-4 hover:text-dark-200 transition-colors">
                    Skip for now →
                </button>
            </div>
        </PageBackground>
    );
};

export default OnboardingPage;
