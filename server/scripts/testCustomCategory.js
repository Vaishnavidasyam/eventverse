require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

const testCustomCategory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    // Get an organizer user
    const organizer = await User.findOne({ role: 'organizer' });
    if (!organizer) {
      console.log('No organizer found, creating one...');
      organizer = await User.create({
        name: 'Test Organizer',
        email: 'test@organizer.com',
        password: 'password123',
        role: 'organizer',
        isVerified: true
      });
    }
    console.log('Using organizer:', organizer.email);

    // Try to create an event with a custom category
    const testEvent = {
      title: 'Test Comedy Show',
      description: 'A test event with custom category',
      category: 'comedy',
      organizer: organizer._id,
      venue: {
        name: 'Test Venue',
        address: '123 Test St',
        city: 'Test City',
        capacity: 100
      },
      date: new Date('2026-08-01'),
      time: '18:00',
      ticketTypes: [
        { name: 'General', price: 50, available: 100, description: 'Standard entry' }
      ],
      totalSeats: 100,
      availableSeats: 100
    };

    console.log('Attempting to create event with category:', testEvent.category);
    const event = await Event.create(testEvent);
    console.log('SUCCESS! Event created with ID:', event._id);
    console.log('Event category:', event.category);

    // Clean up
    await Event.findByIdAndDelete(event._id);
    console.log('Test event deleted');

    process.exit(0);
  } catch (error) {
    console.error('ERROR creating event:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

testCustomCategory();
