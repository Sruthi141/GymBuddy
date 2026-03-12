const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Gym = require('./models/Gym');
const Match = require('./models/Match');
const CollaborationTicket = require('./models/CollaborationTicket');
const Notification = require('./models/Notification');

/**
 * Seed script - populates database with sample data
 * Run: node seed.js
 */

const seedData = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            Notification.deleteMany({}),
            CollaborationTicket.deleteMany({}),
            Match.deleteMany({}),
            Gym.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log('🗑️ Cleared existing data');

        // Create users
        const users = await User.create([
            {
                name: 'Arjun Sharma',
                email: 'arjun@example.com',
                password: 'Password1!',
                role: 'user',
                age: 25,
                gender: 'male',
                location: { city: 'Mumbai', area: 'Andheri' },
                fitnessGoals: ['muscle-gain', 'strength'],
                preferredWorkoutTime: 'morning',
                experienceLevel: 'intermediate',
                hobbies: ['football', 'swimming'],
                motivation: 'Build strength and stay consistent',
                bio: 'Fitness enthusiast looking for a committed gym partner.',
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            },
            {
                name: 'Priya Patel',
                email: 'priya@example.com',
                password: 'Password1!',
                role: 'user',
                age: 23,
                gender: 'female',
                location: { city: 'Mumbai', area: 'Andheri' },
                fitnessGoals: ['weight-loss', 'general-fitness'],
                preferredWorkoutTime: 'morning',
                experienceLevel: 'beginner',
                hobbies: ['yoga', 'running'],
                motivation: 'Get fit and feel confident',
                bio: 'Beginner looking for a supportive workout buddy!',
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            },
            {
                name: 'Rahul Kumar',
                email: 'rahul@example.com',
                password: 'Password1!',
                role: 'user',
                age: 28,
                gender: 'male',
                location: { city: 'Mumbai', area: 'Bandra' },
                fitnessGoals: ['muscle-gain', 'endurance'],
                preferredWorkoutTime: 'evening',
                experienceLevel: 'advanced',
                hobbies: ['basketball', 'cycling'],
                motivation: 'Push limits and compete',
                bio: "Advanced lifter, 5 years experience. Let's grind!",
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            },
            {
                name: 'Sneha Gupta',
                email: 'sneha@example.com',
                password: 'Password1!',
                role: 'user',
                age: 26,
                gender: 'female',
                location: { city: 'Mumbai', area: 'Powai' },
                fitnessGoals: ['general-fitness', 'flexibility'],
                preferredWorkoutTime: 'morning',
                experienceLevel: 'intermediate',
                hobbies: ['dance', 'hiking'],
                motivation: 'Stay active and healthy',
                bio: 'Enjoy group workouts and staying active.',
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            },
            {
                name: 'Vikram Singh',
                email: 'vikram@example.com',
                password: 'Password1!',
                role: 'user',
                age: 30,
                gender: 'male',
                location: { city: 'Delhi', area: 'Connaught Place' },
                fitnessGoals: ['strength', 'muscle-gain'],
                preferredWorkoutTime: 'evening',
                experienceLevel: 'advanced',
                hobbies: ['martial-arts', 'cricket'],
                motivation: 'Discipline and dedication',
                bio: 'Powerlifter and coach. Always down for a training session.',
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            },
            {
                name: 'Ananya Reddy',
                email: 'ananya@example.com',
                password: 'Password1!',
                role: 'user',
                age: 22,
                gender: 'female',
                location: { city: 'Delhi', area: 'South Delhi' },
                fitnessGoals: ['weight-loss', 'endurance'],
                preferredWorkoutTime: 'evening',
                experienceLevel: 'beginner',
                hobbies: ['tennis', 'reading'],
                motivation: 'Start my fitness journey with a friend',
                bio: 'New to gym, would love a friendly gym partner!',
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            },
            {
                name: 'Karan Mehta',
                email: 'karan@example.com',
                password: 'Password1!',
                role: 'user',
                age: 27,
                gender: 'male',
                location: { city: 'Bangalore', area: 'Koramangala' },
                fitnessGoals: ['general-fitness', 'muscle-gain'],
                preferredWorkoutTime: 'morning',
                experienceLevel: 'intermediate',
                hobbies: ['photography', 'trekking'],
                motivation: 'Consistency is key',
                bio: 'Software engineer by day, gym enthusiast by evening.',
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            },
            {
                name: 'Riya Joshi',
                email: 'riya@example.com',
                password: 'Password1!',
                role: 'user',
                age: 24,
                gender: 'female',
                location: { city: 'Bangalore', area: 'HSR Layout' },
                fitnessGoals: ['weight-loss', 'flexibility'],
                preferredWorkoutTime: 'afternoon',
                experienceLevel: 'beginner',
                hobbies: ['cooking', 'meditation'],
                motivation: 'Feel better about myself',
                bio: 'Looking for a workout partner to keep me accountable.',
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            },
            {
                name: 'Raj Fitness (Owner)',
                email: 'gymowner@example.com',
                password: 'Password1!',
                role: 'gymOwner',
                age: 35,
                gender: 'male',
                location: { city: 'Mumbai', area: 'Andheri' },
                bio: 'Proud owner of FitZone Gym chain.',
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            },
            {
                name: 'GymBuddy Admin',
                email: 'admin@gymbuddy.com',
                password: 'Admin1!',
                role: 'admin',
                age: 30,
                gender: 'male',
                location: { city: 'Mumbai', area: 'Mumbai' },
                bio: 'Platform administrator.',
                isProfileComplete: true,
                isEmailVerified: true,
                profilePhoto: ''
            }
        ]);

        console.log(`👤 Created ${users.length} users`);

        const gymOwner = users.find((user) => user.role === 'gymOwner');
        const regularUsers = users.filter((user) => user.role === 'user');

        if (!gymOwner) {
            throw new Error('Gym owner user not found after seeding users');
        }

        // Create gyms
        const gyms = await Gym.create([
            {
                owner: gymOwner._id,
                name: 'FitZone Premium',
                address: {
                    street: 'Link Road',
                    city: 'Mumbai',
                    area: 'Andheri West',
                    state: 'Maharashtra',
                    zipCode: '400053'
                },
                coordinates: { latitude: 19.1364, longitude: 72.8296 },
                pricing: { monthly: 2500, quarterly: 6500, yearly: 22000, dayPass: 200 },
                facilities: ['cardio', 'weights', 'crossfit', 'personal-training', 'shower', 'locker', 'parking'],
                contact: { phone: '+91-9876543210', email: 'info@fitzone.com', website: 'www.fitzone.com' },
                openingHours: {
                    weekdays: { open: '05:00', close: '23:00' },
                    weekends: { open: '06:00', close: '21:00' }
                },
                description: 'State-of-the-art gym with latest equipment and certified trainers.',
                rating: 4.5,
                totalVisitors: 150
            },
            {
                owner: gymOwner._id,
                name: 'Iron Paradise',
                address: {
                    street: 'Turner Road',
                    city: 'Mumbai',
                    area: 'Bandra West',
                    state: 'Maharashtra',
                    zipCode: '400050'
                },
                coordinates: { latitude: 19.0596, longitude: 72.8295 },
                pricing: { monthly: 3500, quarterly: 9000, yearly: 30000, dayPass: 350 },
                facilities: ['weights', 'crossfit', 'personal-training', 'sauna', 'steam-room', 'shower', 'locker', 'cafe'],
                contact: { phone: '+91-9876543211', email: 'contact@ironparadise.com' },
                openingHours: {
                    weekdays: { open: '06:00', close: '22:00' },
                    weekends: { open: '07:00', close: '20:00' }
                },
                description: 'Premium bodybuilding and strength training facility.',
                rating: 4.8,
                totalVisitors: 200
            },
            {
                owner: gymOwner._id,
                name: 'Yoga & Wellness Studio',
                address: {
                    street: 'Hiranandani Gardens',
                    city: 'Mumbai',
                    area: 'Powai',
                    state: 'Maharashtra',
                    zipCode: '400076'
                },
                coordinates: { latitude: 19.1197, longitude: 72.9051 },
                pricing: { monthly: 2000, quarterly: 5000, yearly: 18000, dayPass: 150 },
                facilities: ['yoga', 'group-classes', 'shower', 'locker', 'parking'],
                contact: { phone: '+91-9876543212', email: 'hello@yogawellness.com' },
                openingHours: {
                    weekdays: { open: '06:00', close: '21:00' },
                    weekends: { open: '07:00', close: '19:00' }
                },
                description: 'Holistic wellness center with yoga, pilates, and meditation classes.',
                rating: 4.3,
                totalVisitors: 80
            },
            {
                owner: gymOwner._id,
                name: 'PowerHouse Gym',
                address: {
                    street: 'Rajouri Garden',
                    city: 'Delhi',
                    area: 'West Delhi',
                    state: 'Delhi',
                    zipCode: '110027'
                },
                coordinates: { latitude: 28.6466, longitude: 77.1237 },
                pricing: { monthly: 2000, quarterly: 5500, yearly: 20000, dayPass: 180 },
                facilities: ['cardio', 'weights', 'crossfit', 'group-classes', 'shower', 'parking'],
                contact: { phone: '+91-9876543213', email: 'info@powerhouse.com' },
                openingHours: {
                    weekdays: { open: '05:30', close: '22:30' },
                    weekends: { open: '06:30', close: '20:30' }
                },
                description: 'No-nonsense gym for serious lifters and fitness enthusiasts.',
                rating: 4.2,
                totalVisitors: 120
            },
            {
                owner: gymOwner._id,
                name: 'Cult.fit Studio',
                address: {
                    street: '80 Feet Road',
                    city: 'Bangalore',
                    area: 'Koramangala',
                    state: 'Karnataka',
                    zipCode: '560034'
                },
                coordinates: { latitude: 12.9352, longitude: 77.6245 },
                pricing: { monthly: 3000, quarterly: 8000, yearly: 28000, dayPass: 300 },
                facilities: ['cardio', 'weights', 'crossfit', 'yoga', 'group-classes', 'personal-training', 'shower', 'locker', 'cafe'],
                contact: { phone: '+91-9876543214', email: 'info@cultfit.com', website: 'www.cultfit.com' },
                openingHours: {
                    weekdays: { open: '05:00', close: '23:00' },
                    weekends: { open: '06:00', close: '22:00' }
                },
                description: 'Premium fitness studio with group workouts, yoga, and personal training.',
                rating: 4.6,
                totalVisitors: 300
            }
        ]);

        console.log(`🏋️ Created ${gyms.length} gyms`);

        // Create sample matches
        const matches = await Match.create([
            {
                userA: regularUsers[0]._id,
                userB: regularUsers[1]._id,
                compatibilityScore: 80,
                scoreBreakdown: { location: 30, workoutTime: 25, fitnessGoal: 5, experience: 20 },
                status: 'accepted',
                initiatedBy: regularUsers[0]._id
            },
            {
                userA: regularUsers[0]._id,
                userB: regularUsers[2]._id,
                compatibilityScore: 55,
                scoreBreakdown: { location: 30, workoutTime: 0, fitnessGoal: 25, experience: 0 },
                status: 'pending',
                initiatedBy: regularUsers[0]._id
            }
        ]);

        console.log(`🤝 Created ${matches.length} sample matches`);

        // Create sample collaboration ticket
        await CollaborationTicket.create({
            participants: [regularUsers[0]._id, regularUsers[1]._id],
            match: matches[0]._id,
            gym: gyms[0]._id,
            status: 'active',
            workoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            workoutType: 'Strength Training',
            notes: "Let's focus on upper body today!",
            statusHistory: [
                { status: 'pending', changedBy: regularUsers[0]._id },
                { status: 'confirmed', changedBy: regularUsers[1]._id },
                { status: 'active', changedBy: regularUsers[0]._id }
            ]
        });

        console.log('🎫 Created sample collaboration ticket');

        // Create sample notifications
        await Notification.create([
            {
                user: regularUsers[1]._id,
                type: 'match-request',
                message: `${regularUsers[0].name} sent you a match request!`,
                relatedId: matches[0]._id,
                relatedModel: 'Match',
                read: true
            },
            {
                user: regularUsers[0]._id,
                type: 'match-accepted',
                message: `${regularUsers[1].name} accepted your match request!`,
                relatedId: matches[0]._id,
                relatedModel: 'Match',
                read: true
            },
            {
                user: regularUsers[2]._id,
                type: 'match-request',
                message: `${regularUsers[0].name} sent you a match request! (55% compatible)`,
                relatedId: matches[1]._id,
                relatedModel: 'Match',
                read: false
            }
        ]);

        console.log('🔔 Created sample notifications');

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📧 Test accounts:');
        console.log('   User: arjun@example.com / Password1!');
        console.log('   User: priya@example.com / Password1!');
        console.log('   Gym Owner: gymowner@example.com / Password1!');
        console.log('   Admin: admin@gymbuddy.com / Admin1!');
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        console.error(error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        process.exit();
    }
};

seedData();