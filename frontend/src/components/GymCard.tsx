import { MapPin, Star, Clock, Dumbbell, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GymCardProps {
    gym: {
        _id: string;
        name: string;
        address: { city: string; area?: string };
        pricing?: { monthly?: number; dayPass?: number };
        facilities?: string[];
        rating?: number;
        openingHours?: {
            weekdays?: { open: string; close: string };
        };
        photos?: string[];
        description?: string;
    };
    distanceKm?: number;
    onSelect?: (gymId: string) => void;
    showSelect?: boolean;
}

const facilityIcons: Record<string, string> = {
    cardio: '🏃', weights: '🏋️', crossfit: '💪', yoga: '🧘',
    swimming: '🏊', sauna: '🧖', 'steam-room': '♨️',
    'personal-training': '👨‍🏫', 'group-classes': '👥',
    parking: '🅿️', shower: '🚿', locker: '🔐', cafe: '☕',
    'basketball-court': '🏀'
};

const GymCard = ({ gym, distanceKm, onSelect, showSelect }: GymCardProps) => {
    return (
        <div className="glass-card overflow-hidden hover:border-primary/20 transition-all group">
            {/* Photo placeholder */}
            <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                {gym.photos && gym.photos[0] ? (
                    <img src={gym.photos[0]} alt={gym.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Dumbbell className="w-12 h-12 text-dark-500" />
                    </div>
                )}
                {gym.rating !== undefined && gym.rating > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-dark-900/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                        <span className="text-xs font-bold text-white">{gym.rating.toFixed(1)}</span>
                    </div>
                )}
                {distanceKm !== undefined && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <MapPin className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold text-white">{distanceKm} km away</span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-base font-bold text-white group-hover:text-primary-light transition-colors">{gym.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-dark-300">
                    <MapPin className="w-3 h-3" />
                    {gym.address.area ? `${gym.address.area}, ${gym.address.city}` : gym.address.city}
                </div>

                {gym.description && (
                    <p className="text-xs text-dark-400 mt-2 line-clamp-2">{gym.description}</p>
                )}

                {/* Facilities */}
                {gym.facilities && gym.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {gym.facilities.slice(0, 5).map(f => (
                            <span key={f} className="px-2 py-0.5 text-[10px] rounded-full bg-dark-600 text-dark-200">
                                {facilityIcons[f] || '✓'} {f.replace('-', ' ')}
                            </span>
                        ))}
                        {gym.facilities.length > 5 && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-dark-600 text-dark-300">
                                +{gym.facilities.length - 5} more
                            </span>
                        )}
                    </div>
                )}

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-600/50">
                    <div className="flex items-center gap-3">
                        {gym.pricing?.monthly ? (
                            <span className="flex items-center gap-0.5 text-sm font-bold text-secondary">
                                <IndianRupee className="w-3.5 h-3.5" />{gym.pricing.monthly}<span className="text-[10px] text-dark-400 font-normal">/mo</span>
                            </span>
                        ) : null}
                        {gym.openingHours?.weekdays && (
                            <span className="flex items-center gap-1 text-[10px] text-dark-400">
                                <Clock className="w-3 h-3" />
                                {gym.openingHours.weekdays.open} - {gym.openingHours.weekdays.close}
                            </span>
                        )}
                    </div>

                    {showSelect && onSelect ? (
                        <button onClick={() => onSelect(gym._id)} className="btn-primary text-xs py-1.5 px-3">
                            Select
                        </button>
                    ) : (
                        <Link to={`/gyms/${gym._id}`} className="text-xs font-semibold text-primary-light hover:text-white transition-colors">
                            View Details →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GymCard;
