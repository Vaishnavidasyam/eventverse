require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

const deleteTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    // Delete Test Comedy Show event
    const testEvent = await Event.findOne({ title: 'Test Comedy Show' });
    if (testEvent) {
      await Event.findByIdAndDelete(testEvent._id);
      console.log('Deleted Test Comedy Show event');
    } else {
      console.log('Test Comedy Show event not found');
    }

    // Delete test organizer user
    const testOrganizer = await User.findOne({ email: 'testorganizer@test.com' });
    if (testOrganizer) {
      await User.findByIdAndDelete(testOrganizer._id);
      console.log('Deleted test organizer user (testorganizer@test.com)');
    } else {
      console.log('Test organizer user not found');
    }

    // Show remaining events to verify rajamamidi comedy show is still there
    const comedyEvents = await Event.find({ category: 'comedy' });
    console.log('\nRemaining comedy events:');
    comedyEvents.forEach(event => {
      console.log(`- ${event.title} (ID: ${event._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteTestData();
