require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Update user to admin
const makeAdmin = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`No user found with email: ${email}`);
      process.exit(1);
    }
    
    console.log(`Updating user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);
    
    user.role = 'admin';
    await user.save();
    
    console.log(`Updated role to: ${user.role}`);
    console.log('User is now an admin!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  }
};

// Get email from command line or use default
const email = process.argv[2] || 'vaish@gmail.com';
makeAdmin(email);
