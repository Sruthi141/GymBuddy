// Mock data for frontend demonstration when backend is not connected

export const mockUsers = [
    {
        _id: '1',
        name: 'Arjun Sharma',
        age: 25,
        gender: 'male',
        location: { city: 'Mumbai', area: 'Andheri' },
        fitnessGoals: ['muscle-gain', 'strength'],
        preferredWorkoutTime: 'morning',
        experienceLevel: 'intermediate',
        bio: 'Fitness enthusiast looking for a committed gym partner.',
        profilePicture: ''
    },
    {
        _id: '2',
        name: 'Priya Patel',
        age: 23,
        gender: 'female',
        location: { city: 'Mumbai', area: 'Andheri' },
        fitnessGoals: ['weight-loss', 'general-fitness'],
        preferredWorkoutTime: 'morning',
        experienceLevel: 'beginner',
        bio: 'Beginner looking for a supportive workout buddy!',
        profilePicture: ''
    },
    {
        _id: '3',
        name: 'Rahul Kumar',
        age: 28,
        gender: 'male',
        location: { city: 'Mumbai', area: 'Bandra' },
        fitnessGoals: ['muscle-gain', 'endurance'],
        preferredWorkoutTime: 'evening',
        experienceLevel: 'advanced',
        bio: "Advanced lifter, 5 years experience. Let's grind!",
        profilePicture: ''
    },
    {
        _id: '4',
        name: 'Sneha Gupta',
        age: 26,
        gender: 'female',
        location: { city: 'Mumbai', area: 'Powai' },
        fitnessGoals: ['general-fitness', 'flexibility'],
        preferredWorkoutTime: 'morning',
        experienceLevel: 'intermediate',
        bio: 'Enjoy group workouts and staying active.',
        profilePicture: ''
    },
    {
        _id: '5',
        name: 'Vikram Singh',
        age: 30,
        gender: 'male',
        location: { city: 'Delhi', area: 'Connaught Place' },
        fitnessGoals: ['strength', 'muscle-gain'],
        preferredWorkoutTime: 'evening',
        experienceLevel: 'advanced',
        bio: 'Powerlifter and coach.',
        profilePicture: ''
    },
    {
        _id: '6',
        name: 'Ananya Reddy',
        age: 22,
        gender: 'female',
        location: { city: 'Delhi', area: 'South Delhi' },
        fitnessGoals: ['weight-loss', 'endurance'],
        preferredWorkoutTime: 'evening',
        experienceLevel: 'beginner',
        bio: 'New to gym, would love a friendly gym partner!',
        profilePicture: ''
    }
];

export const mockMatches = [
    {
        user: mockUsers[1],
        compatibilityScore: 80,
        scoreBreakdown: { location: 30, workoutTime: 25, fitnessGoal: 5, experience: 20 },
        matchId: 'm1',
        matchStatus: 'accepted',
        isInitiator: true
    },
    {
        user: mockUsers[2],
        compatibilityScore: 55,
        scoreBreakdown: { location: 30, workoutTime: 0, fitnessGoal: 25, experience: 0 },
        matchId: 'm2',
        matchStatus: 'pending',
        isInitiator: true
    },
    {
        user: mockUsers[3],
        compatibilityScore: 75,
        scoreBreakdown: { location: 30, workoutTime: 25, fitnessGoal: 10, experience: 10 },
        matchId: null,
        matchStatus: null,
        isInitiator: false
    },
    {
        user: mockUsers[4],
        compatibilityScore: 45,
        scoreBreakdown: { location: 0, workoutTime: 0, fitnessGoal: 25, experience: 20 },
        matchId: null,
        matchStatus: null,
        isInitiator: false
    },
    {
        user: mockUsers[5],
        compatibilityScore: 25,
        scoreBreakdown: { location: 0, workoutTime: 0, fitnessGoal: 5, experience: 20 },
        matchId: null,
        matchStatus: null,
        isInitiator: false
    }
];

export const mockGyms = [
    {
        _id: 'g1',
        name: 'FitZone Premium',
        address: { city: 'Mumbai', area: 'Andheri West' },
        pricing: { monthly: 2500, dayPass: 200 },
        facilities: ['cardio', 'weights', 'crossfit', 'personal-training', 'shower', 'locker', 'parking'],
        rating: 4.5,
        openingHours: { weekdays: { open: '05:00', close: '23:00' } },
        description: 'State-of-the-art gym with latest equipment and certified trainers.',
        photos: []
    },
    {
        _id: 'g2',
        name: 'Iron Paradise',
        address: { city: 'Mumbai', area: 'Bandra West' },
        pricing: { monthly: 3500, dayPass: 350 },
        facilities: ['weights', 'crossfit', 'personal-training', 'sauna', 'steam-room', 'shower', 'locker', 'cafe'],
        rating: 4.8,
        openingHours: { weekdays: { open: '06:00', close: '22:00' } },
        description: 'Premium bodybuilding and strength training facility.',
        photos: []
    },
    {
        _id: 'g3',
        name: 'Yoga & Wellness Studio',
        address: { city: 'Mumbai', area: 'Powai' },
        pricing: { monthly: 2000, dayPass: 150 },
        facilities: ['yoga', 'group-classes', 'shower', 'locker', 'parking'],
        rating: 4.3,
        openingHours: { weekdays: { open: '06:00', close: '21:00' } },
        description: 'Holistic wellness center with yoga, pilates, and meditation.',
        photos: []
    },
    {
        _id: 'g4',
        name: 'PowerHouse Gym',
        address: { city: 'Delhi', area: 'West Delhi' },
        pricing: { monthly: 2000, dayPass: 180 },
        facilities: ['cardio', 'weights', 'crossfit', 'group-classes', 'shower', 'parking'],
        rating: 4.2,
        openingHours: { weekdays: { open: '05:30', close: '22:30' } },
        description: 'No-nonsense gym for serious lifters.',
        photos: []
    },
    {
        _id: 'g5',
        name: 'Cult.fit Studio',
        address: { city: 'Bangalore', area: 'Koramangala' },
        pricing: { monthly: 3000, dayPass: 300 },
        facilities: ['cardio', 'weights', 'crossfit', 'yoga', 'group-classes', 'personal-training', 'shower', 'locker', 'cafe'],
        rating: 4.6,
        openingHours: { weekdays: { open: '05:00', close: '23:00' } },
        description: 'Premium fitness studio with group workouts and personal training.',
        photos: []
    }
];

export const mockTickets = [
    {
        _id: 't1',
        status: 'active',
        workoutDate: new Date(Date.now() + 86400000).toISOString(),
        workoutType: 'Strength Training',
        notes: "Let's focus on upper body today!",
        participants: [
            { _id: '1', name: 'Arjun Sharma' },
            { _id: '2', name: 'Priya Patel' }
        ],
        gym: { _id: 'g1', name: 'FitZone Premium', address: { city: 'Mumbai' } },
        match: { compatibilityScore: 80 },
        createdAt: new Date().toISOString()
    },
    {
        _id: 't2',
        status: 'pending',
        workoutDate: new Date(Date.now() + 172800000).toISOString(),
        workoutType: 'Cardio & HIIT',
        notes: 'Morning session preferred',
        participants: [
            { _id: '1', name: 'Arjun Sharma' },
            { _id: '3', name: 'Rahul Kumar' }
        ],
        gym: null,
        match: { compatibilityScore: 55 },
        createdAt: new Date().toISOString()
    },
    {
        _id: 't3',
        status: 'completed',
        workoutDate: new Date(Date.now() - 86400000).toISOString(),
        workoutType: 'Full Body',
        participants: [
            { _id: '1', name: 'Arjun Sharma' },
            { _id: '2', name: 'Priya Patel' }
        ],
        gym: { _id: 'g1', name: 'FitZone Premium', address: { city: 'Mumbai' } },
        match: { compatibilityScore: 80 },
        createdAt: new Date(Date.now() - 172800000).toISOString()
    }
];

export const mockNotifications = [
    { _id: 'n1', type: 'match-accepted', message: 'Priya accepted your match request!', read: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'n2', type: 'ticket-created', message: 'New collaboration ticket with Priya!', read: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
    { _id: 'n3', type: 'match-request', message: 'Sneha sent you a match request! (75% compatible)', read: false, createdAt: new Date(Date.now() - 900000).toISOString() },
];

export const mockStats = {
    totalUsers: 156,
    totalGyms: 23,
    totalMatches: 89,
    totalTickets: 45,
    activeTickets: 12,
    completedTickets: 28,
    acceptedMatches: 67,
    recentSignups: 34,
    usersByRole: { user: 140, gymOwner: 12, admin: 4 }
};

export const testimonials = [
    {
        name: 'Aditya M.',
        text: 'Found my perfect gym partner within a day! Our workout schedules aligned perfectly.',
        role: 'Software Engineer',
        score: 92
    },
    {
        name: 'Meera R.',
        text: 'As a beginner, I was nervous about going to the gym alone. GymBuddy matched me with an amazing partner!',
        role: 'Marketing Manager',
        score: 87
    },
    {
        name: 'Rohit K.',
        text: 'The compatibility algorithm is spot on. My gym buddy and I have the same goals and schedule.',
        role: 'Fitness Enthusiast',
        score: 95
    }
];

export const features = [
    {
        title: 'Smart Matching',
        description: 'AI-powered algorithm matches you with compatible workout partners based on goals, schedule, and experience.',
        icon: '🎯'
    },
    {
        title: 'Nearby Gyms',
        description: 'Discover and explore gyms in your area with detailed information about facilities and pricing.',
        icon: '📍'
    },
    {
        title: 'Collaboration Tickets',
        description: 'Create workout sessions, select a gym, and track your fitness journey with your buddy.',
        icon: '🎫'
    },
    {
        title: 'Compatibility Score',
        description: 'See exactly how well you match with potential partners across multiple fitness dimensions.',
        icon: '📊'
    },
    {
        title: 'Gym Partnership',
        description: 'Local gyms can list their facilities and attract motivated pairs of workout partners.',
        icon: '🤝'
    },
    {
        title: 'Track Progress',
        description: 'Monitor your workout consistency and collaboration history to stay motivated.',
        icon: '📈'
    }
];
