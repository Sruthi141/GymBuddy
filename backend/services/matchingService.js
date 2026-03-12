/**
 * Matching Service
 * Calculates compatibility score between two users based on:
 * - Same location: +30 points
 * - Same workout time: +25 points
 * - Similar fitness goals: +25 points
 * - Same experience level: +20 points
 * Total possible: 100 points
 */

/**
 * Calculate compatibility score between two users
 * @param {Object} userA - First user document
 * @param {Object} userB - Second user document
 * @returns {Object} { totalScore, breakdown }
 */
const calculateCompatibility = (userA, userB) => {
    const breakdown = {
        location: 0,
        workoutTime: 0,
        fitnessGoal: 0,
        experience: 0
    };

    // Location match: +30 points
    if (userA.location?.city && userB.location?.city) {
        if (userA.location.city.toLowerCase() === userB.location.city.toLowerCase()) {
            breakdown.location = 30;
            // Bonus for same area within city
            if (userA.location.area && userB.location.area &&
                userA.location.area.toLowerCase() === userB.location.area.toLowerCase()) {
                breakdown.location = 30; // Same max, but prioritized in sorting
            }
        }
    }

    // Workout time match: +25 points
    if (userA.preferredWorkoutTime && userB.preferredWorkoutTime) {
        if (userA.preferredWorkoutTime === userB.preferredWorkoutTime) {
            breakdown.workoutTime = 25;
        }
    }

    // Fitness goals match: +25 points
    if (userA.fitnessGoals?.length > 0 && userB.fitnessGoals?.length > 0) {
        const commonGoals = userA.fitnessGoals.filter(g =>
            userB.fitnessGoals.includes(g)
        );
        if (commonGoals.length > 0) {
            // Proportional score based on overlap
            const overlapRatio = commonGoals.length /
                Math.max(userA.fitnessGoals.length, userB.fitnessGoals.length);
            breakdown.fitnessGoal = Math.round(25 * overlapRatio);
        }
    }

    // Experience level match: +20 points
    if (userA.experienceLevel && userB.experienceLevel) {
        if (userA.experienceLevel === userB.experienceLevel) {
            breakdown.experience = 20;
        } else {
            // Adjacent levels get partial score
            const levels = ['beginner', 'intermediate', 'advanced'];
            const diff = Math.abs(levels.indexOf(userA.experienceLevel) - levels.indexOf(userB.experienceLevel));
            if (diff === 1) {
                breakdown.experience = 10; // Adjacent levels get half points
            }
        }
    }

    const totalScore = breakdown.location + breakdown.workoutTime +
        breakdown.fitnessGoal + breakdown.experience;

    return {
        totalScore,
        breakdown
    };
};

/**
 * Find compatible users for a given user
 * @param {Object} currentUser - The user to find matches for
 * @param {Array} allUsers - All potential match candidates
 * @returns {Array} Sorted array of { user, score, breakdown }
 */
const findCompatibleUsers = (currentUser, allUsers) => {
    const matches = allUsers
        .filter(u => u._id.toString() !== currentUser._id.toString())
        .map(user => {
            const { totalScore, breakdown } = calculateCompatibility(currentUser, user);
            return {
                user,
                compatibilityScore: totalScore,
                scoreBreakdown: breakdown
            };
        })
        .filter(m => m.compatibilityScore > 0 && m.scoreBreakdown.location > 0 && m.scoreBreakdown.fitnessGoal > 0) // Only show users in the same city with at least one shared fitness goal
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return matches;
};

module.exports = {
    calculateCompatibility,
    findCompatibleUsers
};
