import { UserCheck, Send, Clock, Target, Zap, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface MatchCardProps {
    user: {
        _id: string;
        name: string;
        age?: number;
        gender?: string;
        location?: { city: string; area?: string };
        fitnessGoals?: string[];
        preferredWorkoutTime?: string;
        experienceLevel?: string;
        bio?: string;
        profilePicture?: string;
    };
    compatibilityScore: number;
    scoreBreakdown?: {
        location: number;
        workoutTime: number;
        fitnessGoal: number;
        experience: number;
    };
    matchId?: string | null;
    matchStatus?: string | null;
    isInitiator?: boolean;
    onConnect?: (userId: string) => void;
    onAccept?: (matchId: string) => void;
    onReject?: (matchId: string) => void;
}

const goalLabels: Record<string, string> = {
    'weight-loss': '🔥 Weight Loss',
    'muscle-gain': '💪 Muscle Gain',
    'general-fitness': '🏃 General Fitness',
    'flexibility': '🧘 Flexibility',
    'endurance': '🚴 Endurance',
    'strength': '🏋️ Strength',
};

const timeLabels: Record<string, string> = {
    'early-morning': '🌅 Early Morning',
    'morning': '☀️ Morning',
    'afternoon': '🌤️ Afternoon',
    'evening': '🌆 Evening',
    'night': '🌙 Night',
};

const MatchCard = ({
    user, compatibilityScore, scoreBreakdown,
    matchId, matchStatus, isInitiator,
    onConnect, onAccept, onReject
}: MatchCardProps) => {
    const scoreColor = compatibilityScore >= 70 ? 'text-secondary' :
        compatibilityScore >= 40 ? 'text-accent' : 'text-dark-300';

    return (
        <div className="glass-card p-5 hover:border-primary/20 transition-all animate-fadeIn">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                        user.name.charAt(0).toUpperCase()
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h3 className="text-base font-semibold text-white truncate">{user.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                {user.age && <span className="text-xs text-dark-300">{user.age}y</span>}
                                {user.location?.city && (
                                    <span className="flex items-center gap-1 text-xs text-dark-300">
                                        <MapPin className="w-3 h-3" />
                                        {user.location.area || user.location.city}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                            <div className={`text-2xl font-black ${scoreColor}`}>{compatibilityScore}%</div>
                            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Match</p>
                        </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <p className="text-xs text-dark-300 mt-2 line-clamp-2">{user.bio}</p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {user.experienceLevel && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary-light capitalize flex items-center gap-1">
                                <Zap className="w-3 h-3" />{user.experienceLevel}
                            </span>
                        )}
                        {user.preferredWorkoutTime && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-accent/10 text-accent-light">
                                {timeLabels[user.preferredWorkoutTime] || user.preferredWorkoutTime}
                            </span>
                        )}
                        {user.fitnessGoals?.slice(0, 2).map(goal => (
                            <span key={goal} className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-secondary/10 text-secondary-light">
                                {goalLabels[goal] || goal}
                            </span>
                        ))}
                    </div>

                    {/* Score Breakdown */}
                    {scoreBreakdown && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                            {[
                                { label: 'Location', value: scoreBreakdown.location, max: 30, icon: MapPin },
                                { label: 'Time', value: scoreBreakdown.workoutTime, max: 25, icon: Clock },
                                { label: 'Goals', value: scoreBreakdown.fitnessGoal, max: 25, icon: Target },
                                { label: 'Level', value: scoreBreakdown.experience, max: 20, icon: Zap },
                            ].map(item => (
                                <div key={item.label} className="text-center">
                                    <div className="w-full bg-dark-600 rounded-full h-1 mb-1">
                                        <div
                                            className="h-1 rounded-full bg-gradient-to-r from-primary to-secondary"
                                            style={{ width: `${(item.value / item.max) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-dark-400">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                        {!matchStatus && onConnect && (
                            <button onClick={() => onConnect(user._id)} className="btn-primary text-xs py-2 px-4">
                                <Send className="w-3.5 h-3.5" /> Connect
                            </button>
                        )}
                        {matchStatus === 'pending' && !isInitiator && onAccept && onReject && matchId && (
                            <>
                                <button onClick={() => onAccept(matchId)} className="btn-success text-xs py-2 px-4">
                                    <UserCheck className="w-3.5 h-3.5" /> Accept
                                </button>
                                <button onClick={() => onReject(matchId)} className="btn-danger text-xs py-2 px-3">
                                    Reject
                                </button>
                            </>
                        )}
                        {matchStatus && (
                            <StatusBadge status={matchStatus} />
                        )}
                        {matchStatus === 'pending' && isInitiator && (
                            <span className="text-xs text-dark-400">Request sent</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchCard;
