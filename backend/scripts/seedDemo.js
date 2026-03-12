// Seed script for demo data:
// - 1 admin
// - 3 gym owners
// - 6 users
// - sample gyms, matches, tickets, payments, notifications

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Gym = require('../models/Gym');
const Match = require('../models/Match');
const CollaborationTicket = require('../models/CollaborationTicket');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env');
  process.exit(1);
}

const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
};

const run = async () => {
  try {
    console.log('🧹 Connecting to MongoDB for demo seed...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    console.log('🧹 Clearing existing demo data...');
    await Promise.all([
      User.deleteMany({}),
      Gym.deleteMany({}),
      Match.deleteMany({}),
      CollaborationTicket.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('👥 Creating users (1 admin, 3 owners, 6 users)...');

    const passwordUser = await hashPassword('Password1!');
    const passwordAdmin = await hashPassword('Admin1!');

    const [admin, owner1, owner2, owner3, ...users] = await User.insertMany([
      {
        name: 'GymBuddy Admin',
        email: 'admin@gymbuddy.com',
        password: passwordAdmin,
        role: 'admin',
        isEmailVerified: true,
        isProfileComplete: true,
        profilePhoto: '',
        fitnessGoals: ['strength'],
        experienceLevel: 'advanced',
        preferredWorkoutTime: 'morning',
        location: { city: 'Mumbai', area: 'Andheri' },
      },
      {
        name: 'Iron Forge Gym Owner',
        email: 'owner1@gymbuddy.com',
        password: passwordUser,
        role: 'gymOwner',
        isEmailVerified: true,
        isProfileComplete: true,
        profilePhoto: '',
        location: { city: 'Mumbai', area: 'Andheri' },
      },
      {
        name: 'Powerhouse Fitness Owner',
        email: 'owner2@gymbuddy.com',
        password: passwordUser,
        role: 'gymOwner',
        isEmailVerified: true,
        isProfileComplete: true,
        profilePhoto: '',
        location: { city: 'Pune', area: 'Koregaon Park' },
      },
      {
        name: 'Urban Strength Owner',
        email: 'owner3@gymbuddy.com',
        password: passwordUser,
        role: 'gymOwner',
        isEmailVerified: true,
        isProfileComplete: true,
        profilePhoto: '',
        location: { city: 'Bengaluru', area: 'Indiranagar' },
      },
      // 6 users
      {
        name: 'Arjun Mehta',
        email: 'arjun@example.com',
        password: passwordUser,
        role: 'user',
        isEmailVerified: true,
        isProfileComplete: true,
        fitnessGoals: ['muscle-gain'],
        workoutType: ['strength'],
        preferredWorkoutTime: 'evening',
        experienceLevel: 'intermediate',
        location: { city: 'Mumbai', area: 'Andheri' },
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: passwordUser,
        role: 'user',
        isEmailVerified: true,
        isProfileComplete: true,
        fitnessGoals: ['weight-loss', 'endurance'],
        workoutType: ['cardio', 'yoga'],
        preferredWorkoutTime: 'morning',
        experienceLevel: 'beginner',
        location: { city: 'Mumbai', area: 'Bandra' },
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        password: passwordUser,
        role: 'user',
        isEmailVerified: true,
        isProfileComplete: true,
        fitnessGoals: ['general-fitness'],
        workoutType: ['hybrid'],
        preferredWorkoutTime: 'evening',
        experienceLevel: 'intermediate',
        location: { city: 'Pune', area: 'Kothrud' },
      },
      {
        name: 'Neha Iyer',
        email: 'neha@example.com',
        password: passwordUser,
        role: 'user',
        isEmailVerified: true,
        isProfileComplete: true,
        fitnessGoals: ['flexibility'],
        workoutType: ['yoga', 'pilates'],
        preferredWorkoutTime: 'morning',
        experienceLevel: 'intermediate',
        location: { city: 'Bengaluru', area: 'Indiranagar' },
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        password: passwordUser,
        role: 'user',
        isEmailVerified: true,
        isProfileComplete: true,
        fitnessGoals: ['strength'],
        workoutType: ['crossfit'],
        preferredWorkoutTime: 'early-morning',
        experienceLevel: 'advanced',
        location: { city: 'Mumbai', area: 'Powai' },
      },
      {
        name: 'Sara Ali',
        email: 'sara@example.com',
        password: passwordUser,
        role: 'user',
        isEmailVerified: true,
        isProfileComplete: true,
        fitnessGoals: ['general-fitness', 'endurance'],
        workoutType: ['cardio'],
        preferredWorkoutTime: 'evening',
        experienceLevel: 'beginner',
        location: { city: 'Pune', area: 'Viman Nagar' },
      },
    ]);

    console.log('🏋️  Users created.');

    console.log('🏢 Creating gyms for each owner...');
    const gyms = await Gym.insertMany([
      {
        owner: owner1._id,
        name: 'Iron Forge Gym',
        address: { city: 'Mumbai', area: 'Andheri West', street: 'Link Road' },
        pricing: { monthly: 2500, dayPass: 300 },
        facilities: ['cardio', 'weights', 'personal-training', 'locker', 'shower'],
        description: 'Premium strength training facility with top-tier equipment.',
        rating: 4.7,
        status: 'approved',
      },
      {
        owner: owner2._id,
        name: 'Powerhouse Fitness',
        address: { city: 'Pune', area: 'Koregaon Park' },
        pricing: { monthly: 2200, dayPass: 250 },
        facilities: ['cardio', 'weights', 'group-classes', 'parking'],
        description: 'Community-driven gym with energetic group classes.',
        rating: 4.5,
        status: 'approved',
      },
      {
        owner: owner3._id,
        name: 'Urban Strength Club',
        address: { city: 'Bengaluru', area: 'Indiranagar' },
        pricing: { monthly: 2600, dayPass: 350 },
        facilities: ['weights', 'crossfit', 'yoga', 'cafe'],
        description: 'Functional training and lifestyle fitness under one roof.',
        rating: 4.8,
        status: 'approved',
      },
    ]);

    console.log('✅ Gyms created.');

    console.log('🤝 Creating sample matches and collaboration tickets...');
    const u1 = users[0]; // Arjun
    const u2 = users[1]; // Priya
    const u3 = users[2]; // Rahul

    const match1 = await Match.create({
      userA: u1._id,
      userB: u2._id,
      compatibilityScore: 82,
      scoreBreakdown: { location: 25, workoutTime: 20, fitnessGoal: 22, experience: 15 },
      initiatedBy: u1._id,
      status: 'accepted',
    });

    const match2 = await Match.create({
      userA: u1._id,
      userB: u3._id,
      compatibilityScore: 68,
      scoreBreakdown: { location: 20, workoutTime: 18, fitnessGoal: 15, experience: 15 },
      initiatedBy: u3._id,
      status: 'pending',
    });

    const ticket = await CollaborationTicket.create({
      participants: [u1._id, u2._id],
      createdBy: u1._id,
      match: match1._id,
      gym: gyms[0]._id,
      status: 'confirmed',
      workoutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      workoutType: 'Push Day Strength',
      notes: 'Chest + triceps heavy day',
      statusHistory: [{ status: 'confirmed', changedBy: u1._id }],
    });

    console.log('📅 Collaboration ticket created.');

    console.log('💳 Creating sample payments and notifications...');
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5);

    await Payment.create({
      user: u1._id,
      gym: gyms[0]._id,
      amount: 2500,
      currency: 'INR',
      status: 'upcoming',
      dueDate,
      periodStart: now,
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
      notes: 'Monthly membership at Iron Forge Gym',
    });

    await Notification.insertMany([
      {
        user: u2._id,
        type: 'match-request',
        message: `${u1.name} sent you a match request! (82% compatible)`,
        relatedId: match1._id,
        relatedModel: 'Match',
      },
      {
        user: u1._id,
        type: 'ticket-created',
        message: `Collaboration ticket created with ${u2.name} at ${gyms[0].name}.`,
        relatedId: ticket._id,
        relatedModel: 'CollaborationTicket',
      },
    ]);

    console.log('📨 Notifications and payments created.');

    console.log('✅ Demo seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Demo seed failed:', err.message);
    process.exit(1);
  }
};

run();

