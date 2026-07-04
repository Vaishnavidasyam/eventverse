require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const getValidUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    // Get an organizer user
    const organizer = await User.findOne({ role: 'organizer' });
    if (organizer) {
      console.log('Organizer found:');
      console.log('Email:', organizer.email);
      console.log('Name:', organizer.name);
      console.log('Role:', organizer.role);
      console.log('ID:', organizer._id);
    } else {
      console.log('No organizer found');
    }

    // Get a regular user
    const user = await User.findOne({ role: 'user' });
    if (user) {
      console.log('\nUser found:');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Role:', user.role);
      console.log('ID:', user._id);
    } else {
      console.log('\nNo user found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

getValidUser();
