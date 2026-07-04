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

// Delete all users
const deleteAllUsers = async () => {
  try {
    const result = await User.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} users from the database`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting users:', error);
    process.exit(1);
  }
};

// Run the deletion
deleteAllUsers();
