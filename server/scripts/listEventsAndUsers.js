require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

const listEventsAndUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    // List all events
    const events = await Event.find({}).sort({ createdAt: -1 });
    console.log('\n=== All Events ===');
    events.forEach(event => {
      console.log(`Title: ${event.title}`);
      console.log(`Category: ${event.category}`);
      console.log(`Organizer: ${event.organizer}`);
      console.log(`ID: ${event._id}`);
      console.log('---');
    });

    // List all users
    const users = await User.find({}).sort({ createdAt: -1 });
    console.log('\n=== All Users ===');
    users.forEach(user => {
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`ID: ${user._id}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listEventsAndUsers();
