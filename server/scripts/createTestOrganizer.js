require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createTestOrganizer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    // Delete existing test organizer
    await User.deleteOne({ email: 'testorganizer@test.com' });

    // Create new test organizer
    const organizer = await User.create({
      name: 'Test Organizer',
      email: 'testorganizer@test.com',
      password: await bcrypt.hash('test123', 10),
      role: 'organizer',
      isVerified: true
    });

    console.log('Test organizer created:');
    console.log('Email:', organizer.email);
    console.log('Password: test123');
    console.log('Role:', organizer.role);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestOrganizer();
