require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const resetUserPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    // Reset organizer password
    const organizer = await User.findOne({ role: 'organizer' });
    if (organizer) {
      organizer.password = 'test123';
      await organizer.save();
      console.log('Organizer password reset to: test123');
      console.log('Email:', organizer.email);
    }

    // Reset user password
    const user = await User.findOne({ role: 'user' });
    if (user) {
      user.password = 'test123';
      await user.save();
      console.log('User password reset to: test123');
      console.log('Email:', user.email);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetUserPassword();
