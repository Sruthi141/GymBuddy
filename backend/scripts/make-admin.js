/**
 * One-time script to promote a user to admin.
 * Usage:  node scripts/make-admin.js your@email.com
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
    console.error('❌  Usage: node scripts/make-admin.js <email>');
    process.exit(1);
}

(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB');

    const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { role: 'admin' },
        { new: true }
    );

    if (!user) {
        console.error(`❌  No user found with email: ${email}`);
    } else {
        console.log(`✅  ${user.name} (${user.email}) is now an admin!`);
    }

    await mongoose.disconnect();
    process.exit(0);
})();
