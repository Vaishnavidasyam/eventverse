require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const showAllLoginData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    const users = await User.find({}).sort({ role: 1, createdAt: 1 });
    
    console.log('\n=== ALL USER LOGIN DATA ===\n');
    console.log('Total users:', users.length);
    console.log('================================\n');

    users.forEach((user, index) => {
      console.log(`User #${index + 1}`);
      console.log('----------------------------------------');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Password (hashed):', user.password);
      console.log('Role:', user.role);
      console.log('Phone:', user.phone || 'Not provided');
      console.log('Verified:', user.isVerified ? 'Yes' : 'No');
      console.log('Blocked:', user.isBlocked ? 'Yes' : 'No');
      console.log('Avatar:', user.avatar || 'Not set');
      console.log('User ID:', user._id);
      console.log('Created:', user.createdAt);
      console.log('Updated:', user.updatedAt);
      console.log('Interests:', user.interests?.join(', ') || 'None');
      console.log('Saved Events:', user.savedEvents?.length || 0);
      console.log('========================================\n');
    });

    // Summary by role
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('=== SUMMARY BY ROLE ===');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`${role.toUpperCase()}: ${count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

showAllLoginData();
