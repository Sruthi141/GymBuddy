/**
 * Profile completion calculation
 * Required: name, profilePhoto, age, gender, city, fitnessGoals, preferredWorkoutTime, experienceLevel
 */
const REQUIRED_FIELDS = [
    'name',
    'profilePhoto',
    'age',
    'gender',
    'location',
    'fitnessGoals',
    'preferredWorkoutTime',
    'experienceLevel'
] as const;

export const getProfileCompletion = (user: Record<string, unknown>): { percent: number; missing: string[] } => {
    const missing: string[] = [];
    if (!user?.name || String(user.name).trim().length < 2) missing.push('name');
    const hasPhoto = !!(user?.profilePhoto || (user as Record<string, unknown>)?.profilePicture);
    if (!hasPhoto) missing.push('profilePhoto');
    if (!user?.age || Number(user.age) < 16) missing.push('age');
    if (!user?.gender) missing.push('gender');
    const loc = user?.location as { city?: string } | undefined;
    if (!loc?.city || String(loc.city).trim().length === 0) missing.push('location');
    const goals = user?.fitnessGoals as string[] | undefined;
    if (!goals?.length) missing.push('fitnessGoals');
    if (!user?.preferredWorkoutTime) missing.push('preferredWorkoutTime');
    if (!user?.experienceLevel) missing.push('experienceLevel');

    const filled = REQUIRED_FIELDS.length - missing.length;
    const percent = Math.round((filled / REQUIRED_FIELDS.length) * 100);
    return { percent, missing };
};
