import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { getProfileCompletion } from '../utils/profileCompletion';
import { validatePhoto } from '../utils/validation';
import Sidebar from '../components/Sidebar';
import PageBackground from '../layouts/PageBackground';
import {
    User, Save, Target, Loader2, AlertCircle, Camera, ShieldCheck
} from 'lucide-react';

const getAvatarUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return url;
};

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        phone: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        city: '',
        area: '',
        fitnessGoals: [] as string[],
        workoutType: [] as string[],
        preferredWorkoutTime: '',
        experienceLevel: '',
        bio: '',
        hobbies: '',
        motivation: '',
        instagram: '',
        twitter: '',
        linkedin: ''
    });
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
    const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await userService.getProfile();
                const u = data.user;
                setProfileData(u);
                setForm({
                    name: u.name || '',
                    phone: u.phone || '',
                    age: u.age ? String(u.age) : '',
                    gender: u.gender || '',
                    height: u.height ? String(u.height) : '',
                    weight: u.weight ? String(u.weight) : '',
                    city: u.location?.city || '',
                    area: u.location?.area || '',
                    fitnessGoals: u.fitnessGoals || [],
                    workoutType: u.workoutType || [],
                    preferredWorkoutTime: u.preferredWorkoutTime || '',
                    experienceLevel: u.experienceLevel || '',
                    bio: u.bio || '',
                    hobbies: Array.isArray(u.hobbies) ? u.hobbies.join(', ') : (u.hobbies || ''),
                    motivation: u.motivation || '',
                    instagram: u.socialLinks?.instagram || '',
                    twitter: u.socialLinks?.twitter || '',
                    linkedin: u.socialLinks?.linkedin || ''
                });
            } catch {
                setError('Failed to load profile.');
                toast.addToast('Failed to load profile', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [toast]);

    const toggleArray = (field: 'fitnessGoals' | 'workoutType', value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter((g) => g !== value)
                : [...prev[field], value]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            if (profilePhoto) {
                const v = validatePhoto(profilePhoto);
                if (!v.valid) {
                    setError(v.message || 'Invalid photo');
                    setSaving(false);
                    return;
                }
                await userService.updateProfilePhoto(profilePhoto);
                setProfilePhoto(null);
                updateUser({ profilePhoto: `/uploads/${(profilePhoto as File & { name?: string }).name}` });
            }
            if (coverPhoto) {
                const v = validatePhoto(coverPhoto);
                if (!v.valid) {
                    setError(v.message || 'Invalid cover');
                    setSaving(false);
                    return;
                }
                await userService.updateCoverPhoto(coverPhoto);
                setCoverPhoto(null);
            }

            const profileData = {
                name: form.name.trim(),
                phone: form.phone.trim() || undefined,
                age: form.age ? parseInt(form.age, 10) : undefined,
                gender: form.gender || undefined,
                height: form.height ? parseInt(form.height, 10) : undefined,
                weight: form.weight ? parseFloat(form.weight) : undefined,
                location: (form.city || form.area) ? { city: form.city.trim(), area: form.area.trim() } : undefined,
                fitnessGoals: form.fitnessGoals,
                workoutType: form.workoutType,
                preferredWorkoutTime: form.preferredWorkoutTime || undefined,
                experienceLevel: form.experienceLevel || undefined,
                bio: form.bio.trim() || undefined,
                hobbies: form.hobbies ? form.hobbies.split(',').map((h) => h.trim()).filter(Boolean) : [],
                motivation: form.motivation.trim() || undefined,
                socialLinks: {
                    instagram: form.instagram.trim() || undefined,
                    twitter: form.twitter.trim() || undefined,
                    linkedin: form.linkedin.trim() || undefined
                }
            };

            const result = await userService.updateProfile(profileData);
            setProfileData(result.user);
            updateUser({
                name: form.name.trim(),
                isProfileComplete: result.user?.isProfileComplete ?? true
            });
            toast.addToast('Profile saved successfully', 'success');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save';
            setError(msg);
            toast.addToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const completion = profileData ? getProfileCompletion(profileData) : { percent: 0, missing: [] };

    if (loading) {
        return (
            <PageBackground image="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80&auto=format">
                <div className="flex min-h-[calc(100vh-4rem)]">
                    <Sidebar />
                    <main className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </main>
                </div>
            </PageBackground>
        );
    }

    const avatarUrl = getAvatarUrl((user?.profilePhoto || user?.profilePicture || profileData?.profilePhoto || profileData?.profilePicture) as string);

    return (
        <PageBackground image="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80&auto=format" align="top">
        <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-8 overflow-auto">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <User className="w-6 h-6 text-primary" /> My Profile
                            {completion.percent === 100 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                                    <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-dark-300 mt-1">Manage your fitness profile</p>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-4">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                </div>

                {/* Profile completion bar */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-dark-200">Profile completion</span>
                        <span className="text-sm font-bold text-primary">{completion.percent}%</span>
                    </div>
                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                            style={{ width: `${completion.percent}%` }}
                        />
                    </div>
                    {completion.missing.length > 0 && (
                        <p className="text-xs text-dark-400 mt-2">Complete: {completion.missing.join(', ')}</p>
                    )}
                </div>

                {error && (
                    <div className="glass-card p-4 mb-4 border-danger/30 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                        <p className="text-sm text-danger-light">{error}</p>
                    </div>
                )}

                {/* Cover & Avatar */}
                <div className="glass-card overflow-hidden mb-6">
                    <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                        {coverPhoto ? (
                            <img src={URL.createObjectURL(coverPhoto)} alt="" className="w-full h-full object-cover" />
                        ) : profileData?.coverPhoto ? (
                            <img src={getAvatarUrl(profileData.coverPhoto as string) || ''} alt="" className="w-full h-full object-cover" />
                        ) : null}
                        <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-dark-900/80 text-xs font-medium text-white cursor-pointer hover:bg-dark-800 flex items-center gap-1">
                            <Camera className="w-3 h-3" /> Change cover
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f && validatePhoto(f).valid) setCoverPhoto(f);
                                }}
                            />
                        </label>
                    </div>
                    <div className="px-6 pb-6 -mt-12 relative">
                        <div className="flex items-end gap-4">
                            <label className="relative cursor-pointer block">
                                <div className="w-24 h-24 rounded-2xl border-4 border-dark-800 overflow-hidden bg-dark-700 flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : profilePhoto ? (
                                        <img src={URL.createObjectURL(profilePhoto)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-dark-400">{form.name?.charAt(0)?.toUpperCase() || '?'}</span>
                                    )}
                                </div>
                                <span className="absolute bottom-0 right-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <Camera className="w-4 h-4 text-primary-dark" />
                                </span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f && validatePhoto(f).valid) setProfilePhoto(f);
                                    }}
                                />
                            </label>
                            <div className="flex-1 pb-1">
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input-field text-lg font-semibold bg-transparent border-0 px-0 focus:ring-0"
                                    placeholder="Your name"
                                />
                                <p className="text-xs text-dark-400 mt-1">{user?.email} • {user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic info */}
                <div className="glass-card p-6 mb-6">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Basic info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Age</label>
                            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-field" placeholder="25" min="16" max="80" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Gender</label>
                            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Phone</label>
                            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Height (cm)</label>
                            <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="input-field" placeholder="170" min="100" max="250" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Weight (kg)</label>
                            <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" placeholder="70" min="30" max="200" step="0.1" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">City</label>
                            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="Mumbai" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-dark-300 mb-1">Area / Locality</label>
                            <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-field" placeholder="Andheri West" />
                        </div>
                    </div>
                </div>

                {/* Fitness */}
                <div className="glass-card p-6 mb-6">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-secondary" /> Fitness</h3>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-dark-300 mb-2">Goals</label>
                        <div className="flex flex-wrap gap-2">
                            {['weight-loss', 'muscle-gain', 'general-fitness', 'flexibility', 'endurance', 'strength'].map((g) => (
                                <button key={g} type="button" onClick={() => toggleArray('fitnessGoals', g)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${form.fitnessGoals.includes(g) ? 'border-primary bg-primary/10 text-white' : 'border-dark-500 text-dark-300'}`}>
                                    {g.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-dark-300 mb-2">Workout style</label>
                        <div className="flex flex-wrap gap-2">
                            {['strength', 'cardio', 'hybrid', 'crossfit', 'yoga', 'pilates', 'boxing', 'swimming'].map((w) => (
                                <button key={w} type="button" onClick={() => toggleArray('workoutType', w)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${form.workoutType.includes(w) ? 'border-secondary bg-secondary/10 text-secondary-light' : 'border-dark-500 text-dark-300'}`}>
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Experience</label>
                            <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="input-field">
                                <option value="">Select</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Preferred time</label>
                            <select value={form.preferredWorkoutTime} onChange={(e) => setForm({ ...form, preferredWorkoutTime: e.target.value })} className="input-field">
                                <option value="">Select</option>
                                <option value="early-morning">Early morning</option>
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                                <option value="night">Night</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="glass-card p-6 mb-6">
                    <h3 className="text-base font-bold text-white mb-4">About</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Bio</label>
                            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field min-h-[80px] resize-none" placeholder="Tell potential partners about yourself..." maxLength={500} />
                            <p className="text-[10px] text-dark-400 mt-1">{form.bio.length}/500</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Hobbies</label>
                            <input type="text" value={form.hobbies} onChange={(e) => setForm({ ...form, hobbies: e.target.value })} className="input-field" placeholder="football, swimming (comma separated)" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Motivation</label>
                            <textarea value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} className="input-field min-h-[60px] resize-none" placeholder="What drives you?" />
                        </div>
                    </div>
                </div>

                {/* Social */}
                <div className="glass-card p-6">
                    <h3 className="text-base font-bold text-white mb-4">Social links</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Instagram</label>
                            <input type="text" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="input-field" placeholder="@username" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">Twitter</label>
                            <input type="text" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="input-field" placeholder="@username" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-300 mb-1">LinkedIn</label>
                            <input type="text" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="input-field" placeholder="Profile URL" />
                        </div>
                    </div>
                </div>
                </div>
            </main>
        </div>
        </PageBackground>
    );
}
