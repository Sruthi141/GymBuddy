import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import GymCard from '../components/GymCard';
import { gymService } from '../services/gymService';
import PageBackground from '../layouts/PageBackground';
import { MapPin, Search, Loader2, Navigation, AlertCircle } from 'lucide-react';

type LocationMode = 'detecting' | 'gps' | 'city' | 'denied';

const GymsPage = () => {
    const [gyms, setGyms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [locationMode, setLocationMode] = useState<LocationMode>('detecting');

    // Fetch gyms by GPS coords
    const fetchNearbyGyms = useCallback(async (lat: number, lng: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await gymService.getNearbyGyms(lat, lng, 10);
            setGyms(data.gyms || []);
            setLocationMode('gps');
            // Silently save coords to backend for future notifications
            gymService.updateUserLocation(lat, lng).catch(() => { });
        } catch (err: any) {
            setError('Failed to load nearby gyms');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch gyms by city text filter (fallback)
    const fetchByCity = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await gymService.getGyms(cityFilter ? { city: cityFilter } : undefined);
            setGyms(data.gyms || []);
        } catch (err: any) {
            setError('Failed to load gyms');
        } finally {
            setLoading(false);
        }
    }, [cityFilter]);

    const hasRequestedLocation = useRef(false);

    // Try to get GPS on mount
    useEffect(() => {
        if (hasRequestedLocation.current) return;
        hasRequestedLocation.current = true;

        if (!navigator.geolocation) {
            setLocationMode('denied');
            fetchByCity();
            return;
        }
        setLocationMode('detecting');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                fetchNearbyGyms(latitude, longitude);
            },
            () => {
                // GPS denied or failed — fall back to city text filter
                setLocationMode('denied');
                fetchByCity();
            },
            { timeout: 8000 }
        );
    }, [fetchByCity]); // Only depend on fetchByCity which is memoized

    // Re-fetch when city filter changes (only in city/denied mode)
    useEffect(() => {
        if (locationMode === 'city' || locationMode === 'denied') {
            fetchByCity();
        }
    }, [cityFilter, locationMode, fetchByCity]);

    const cities = [...new Set(gyms.map((g: any) => g.address?.city).filter(Boolean))];

    const filteredGyms = gyms.filter((g: any) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            g.name?.toLowerCase().includes(term) ||
            g.address?.city?.toLowerCase().includes(term) ||
            g.address?.area?.toLowerCase().includes(term)
        );
    });

    return (
        <PageBackground image="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80&auto=format" align="top">
            <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-accent" /> Nearby Gyms
                        </h1>
                        {/* Location status banner */}
                        {locationMode === 'detecting' && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-dark-300">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                Detecting your location...
                            </div>
                        )}
                        {locationMode === 'gps' && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                                <Navigation className="w-3.5 h-3.5" />
                                Showing gyms within 10 km of your location
                            </div>
                        )}
                        {locationMode === 'denied' && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Location access denied — filter by city below or&nbsp;
                                <button
                                    className="underline hover:text-white transition-colors"
                                    onClick={() => {
                                        setLoading(true);
                                        setGyms([]);
                                        setLocationMode('detecting');
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => fetchNearbyGyms(pos.coords.latitude, pos.coords.longitude),
                                            () => { setLocationMode('denied'); fetchByCity(); }
                                        );
                                    }}
                                >
                                    try again
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search gyms by name or area..."
                                className="input-field pl-10"
                            />
                        </div>
                        {/* City filter — show when GPS not active */}
                        {(locationMode === 'denied' || locationMode === 'city') && (
                            <select
                                value={cityFilter}
                                onChange={e => { setCityFilter(e.target.value); setLocationMode('city'); }}
                                className="input-field w-auto min-w-[150px]"
                            >
                                <option value="">All Cities</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        )}
                        {/* GPS mode: offer to switch to city browsing */}
                        {locationMode === 'gps' && (
                            <button
                                onClick={() => { setLocationMode('city'); }}
                                className="btn-secondary text-xs py-2 whitespace-nowrap"
                            >
                                Browse All Cities
                            </button>
                        )}
                    </div>

                    {/* Results count */}
                    {!loading && <p className="text-xs text-dark-400 mb-4">{filteredGyms.length} gyms found</p>}

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-dark-400">
                                {locationMode === 'detecting' ? 'Finding gyms near you...' : 'Loading gyms...'}
                            </p>
                        </div>
                    ) : error ? (
                        <div className="glass-card p-6 text-center">
                            <p className="text-danger-light text-sm">{error}</p>
                            <button onClick={fetchByCity} className="btn-secondary text-xs mt-3">Try Again</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredGyms.length > 0 ? (
                                filteredGyms.map(gym => (
                                    <GymCard key={gym._id} gym={gym} distanceKm={gym.distanceKm} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16">
                                    <MapPin className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                                    <p className="text-dark-300">No gyms found</p>
                                    <p className="text-xs text-dark-400 mt-1">
                                        {locationMode === 'gps'
                                            ? 'No gyms within 10 km. Try browsing all cities.'
                                            : searchTerm || cityFilter ? 'Try adjusting your search' : 'No gyms have been added yet'}
                                    </p>
                                    {locationMode === 'gps' && (
                                        <button
                                            onClick={() => setLocationMode('city')}
                                            className="btn-secondary text-xs mt-3"
                                        >
                                            Browse All Cities
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            </div>
        </PageBackground>
    );
};

export default GymsPage;
