import { useState } from 'react';
import api from '../services/api';
import { X, Building2, Dumbbell, IndianRupee, Clock, Loader2, CheckCircle2 } from 'lucide-react';

interface Gym {
    _id: string;
    name: string;
    description?: string;
    address?: { city?: string; area?: string };
    location?: { type: string; coordinates: number[] };
    facilities?: string[];
    pricing?: { monthly?: number; dayPass?: number };
    openingHours?: {
        weekdays?: { open?: string; close?: string };
        weekends?: { open?: string; close?: string };
    };
}

interface Props {
    gym: Gym;
    onClose: () => void;
    onUpdated: (updated: Gym) => void;
}

const FACILITIES = [
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
];

const EditGymModal = ({ gym, onClose, onUpdated }: Props) => {
    const [form, setForm] = useState({
        name: gym.name || '',
        city: gym.address?.city || '',
        area: gym.address?.area || '',
        latitude: gym.location?.coordinates ? String(gym.location.coordinates[1]) : '',
        longitude: gym.location?.coordinates ? String(gym.location.coordinates[0]) : '',
        description: gym.description || '',
        facilities: gym.facilities || [],
        monthlyPrice: String(gym.pricing?.monthly || ''),
        dayPassPrice: String(gym.pricing?.dayPass || ''),
        weekdayOpen: gym.openingHours?.weekdays?.open || '06:00',
        weekdayClose: gym.openingHours?.weekdays?.close || '22:00',
        weekendOpen: gym.openingHours?.weekends?.open || '07:00',
        weekendClose: gym.openingHours?.weekends?.close || '20:00',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleFacility = (val: string) => {
        setForm(prev => ({
            ...prev,
            facilities: prev.facilities.includes(val)
                ? prev.facilities.filter(f => f !== val)
                : [...prev.facilities, val]
        }));
    };

    const handleAutoDetectLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({
                    ...prev,
                    latitude: String(pos.coords.latitude),
                    longitude: String(pos.coords.longitude)
                }));
            },
            () => setError('Failed to get location. Please allow location access.')
        );
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setError('Gym name is required'); return; }
        setLoading(true);
        setError('');
        try {
            const payload: any = {
                name: form.name,
                description: form.description,
                address: { city: form.city, area: form.area },
                facilities: form.facilities,
                pricing: {
                    monthly: parseInt(form.monthlyPrice) || 0,
                    dayPass: parseInt(form.dayPassPrice) || 0,
                },
                openingHours: {
                    weekdays: { open: form.weekdayOpen, close: form.weekdayClose },
                    weekends: { open: form.weekendOpen, close: form.weekendClose },
                }
            };

            if (form.latitude && form.longitude) {
                payload.location = {
                    type: 'Point',
                    coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)]
                };
            }

            const res = await api.put(`/gyms/${gym._id}`, payload);
            onUpdated(res.data.gym);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update gym');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" /> Edit Gym
                    </h2>
                    <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Basic info */}
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-white">Basic Info</span>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-dark-200 mb-1">Gym Name</label>
                        <input type="text" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="input-field" placeholder="FitZone Pro Gym" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-dark-200 mb-1">City</label>
                            <input type="text" value={form.city}
                                onChange={e => setForm({ ...form, city: e.target.value })}
                                className="input-field" placeholder="Mumbai" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-200 mb-1">Area</label>
                            <input type="text" value={form.area}
                                onChange={e => setForm({ ...form, area: e.target.value })}
                                className="input-field" placeholder="Andheri West" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-dark-200 mb-1">Latitude</label>
                            <input type="number" value={form.latitude}
                                onChange={e => setForm({ ...form, latitude: e.target.value })}
                                className="input-field" placeholder="19.0760" step="any" />
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <label className="block text-xs font-medium text-dark-200">Longitude</label>
                                <button type="button" onClick={handleAutoDetectLocation}
                                    className="text-[10px] text-accent hover:underline">
                                    📍 Use My Location
                                </button>
                            </div>
                            <input type="number" value={form.longitude}
                                onChange={e => setForm({ ...form, longitude: e.target.value })}
                                className="input-field" placeholder="72.8777" step="any" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-dark-200 mb-1">Description</label>
                        <textarea value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="input-field resize-none min-h-[70px]"
                            placeholder="Describe your gym..." maxLength={500} />
                    </div>

                    {/* Facilities */}
                    <div className="flex items-center gap-2 mt-2 mb-1">
                        <Dumbbell className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-semibold text-white">Facilities</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {FACILITIES.map(f => (
                            <button key={f.value} type="button" onClick={() => toggleFacility(f.value)}
                                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${form.facilities.includes(f.value)
                                    ? 'border-secondary bg-secondary/10 text-white'
                                    : 'border-dark-500 text-dark-300 hover:border-dark-400'
                                    }`}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-2 mt-2 mb-1">
                        <IndianRupee className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-white">Pricing</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-dark-200 mb-1">Monthly Fee (₹)</label>
                            <input type="number" value={form.monthlyPrice}
                                onChange={e => setForm({ ...form, monthlyPrice: e.target.value })}
                                className="input-field" placeholder="1500" min="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-200 mb-1">Day Pass (₹)</label>
                            <input type="number" value={form.dayPassPrice}
                                onChange={e => setForm({ ...form, dayPassPrice: e.target.value })}
                                className="input-field" placeholder="200" min="0" />
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-center gap-2 mt-2 mb-1">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-white">Opening Hours</span>
                    </div>
                    <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-dark-700/50 border border-dark-500">
                            <p className="text-[10px] font-semibold text-dark-300 mb-2">Weekdays</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-dark-400 mb-1">Open</label>
                                    <input type="time" value={form.weekdayOpen}
                                        onChange={e => setForm({ ...form, weekdayOpen: e.target.value })}
                                        className="input-field text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-dark-400 mb-1">Close</label>
                                    <input type="time" value={form.weekdayClose}
                                        onChange={e => setForm({ ...form, weekdayClose: e.target.value })}
                                        className="input-field text-xs" />
                                </div>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-700/50 border border-dark-500">
                            <p className="text-[10px] font-semibold text-dark-300 mb-2">Weekends</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-dark-400 mb-1">Open</label>
                                    <input type="time" value={form.weekendOpen}
                                        onChange={e => setForm({ ...form, weekendOpen: e.target.value })}
                                        className="input-field text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-dark-400 mb-1">Close</label>
                                    <input type="time" value={form.weekendClose}
                                        onChange={e => setForm({ ...form, weekendClose: e.target.value })}
                                        className="input-field text-xs" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-dark-600/50">
                    <button onClick={onClose} className="btn-secondary text-sm flex-1">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="btn-primary text-sm flex-1">
                        {loading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <><CheckCircle2 className="w-4 h-4" /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditGymModal;
