require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

// Sample events data
const sampleEvents = [
  {
    title: 'Summer Music Festival 2026',
    description: 'Join us for an unforgettable night of music featuring top artists from around the world. Experience live performances, great food, and amazing vibes.',
    category: 'concert',
    venue: {
      name: 'Central Park Amphitheater',
      address: '123 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      capacity: 5000
    },
    date: new Date('2026-06-30'),
    time: '18:00',
    endTime: '23:00',
    bannerImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
    ticketTypes: [
      { name: 'General Admission', price: 999, available: 3000, description: 'Standing area access' },
      { name: 'VIP', price: 2499, available: 500, description: 'Front row seating + VIP lounge' },
      { name: 'Premium', price: 4999, available: 200, description: 'Backstage access + meet & greet' }
    ],
    totalSeats: 3700,
    availableSeats: 3700,
    isApproved: true,
    isActive: true,
    isFeatured: true,
    rating: 4.5,
    tags: ['music', 'festival', 'live']
  },
  {
    title: 'Tech Innovation Summit',
    description: 'The biggest tech conference of the year featuring industry leaders, workshops, and networking opportunities.',
    category: 'conference',
    venue: {
      name: 'Convention Center',
      address: '456 Tech Park',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      capacity: 2000
    },
    date: new Date('2026-07-15'),
    time: '09:00',
    endTime: '18:00',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    ticketTypes: [
      { name: 'Student', price: 499, available: 500, description: 'Valid student ID required' },
      { name: 'Professional', price: 1499, available: 1000, description: 'Full conference access' },
      { name: 'Executive', price: 2999, available: 100, description: 'VIP sessions + networking dinner' }
    ],
    totalSeats: 1600,
    availableSeats: 1600,
    isApproved: true,
    isActive: true,
    isFeatured: true,
    rating: 4.8,
    tags: ['tech', 'innovation', 'networking']
  },
  {
    title: 'Food & Wine Festival',
    description: 'Savor exquisite cuisines and fine wines from renowned chefs and vineyards. A culinary experience like no other.',
    category: 'festival',
    venue: {
      name: 'Rooftop Garden',
      address: '789 Culinary Street',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      capacity: 800
    },
    date: new Date('2026-08-05'),
    time: '12:00',
    endTime: '22:00',
    bannerImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
    ticketTypes: [
      { name: 'Tasting Pass', price: 799, available: 400, description: 'Food samples + 3 wine tastings' },
      { name: 'Connoisseur', price: 1499, available: 200, description: 'Unlimited tastings + VIP area' }
    ],
    totalSeats: 600,
    availableSeats: 600,
    isApproved: true,
    isActive: true,
    isFeatured: false,
    rating: 4.3,
    tags: ['food', 'wine', 'culinary']
  },
  {
    title: 'Yoga & Wellness Retreat',
    description: 'A day of relaxation, meditation, and wellness activities led by certified instructors.',
    category: 'workshop',
    venue: {
      name: 'Peaceful Gardens',
      address: '321 Wellness Lane',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      capacity: 100
    },
    date: new Date('2026-07-20'),
    time: '06:00',
    endTime: '18:00',
    bannerImage: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=1200',
    imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=1200',
    ticketTypes: [
      { name: 'Day Pass', price: 299, available: 80, description: 'Full day access to all sessions' },
      { name: 'Private Session', price: 999, available: 10, description: 'One-on-one with instructors' }
    ],
    totalSeats: 90,
    availableSeats: 90,
    isApproved: true,
    isActive: true,
    isFeatured: false,
    rating: 4.9,
    tags: ['yoga', 'wellness', 'meditation']
  },
  {
    title: 'Cricket Championship Finals',
    description: 'Watch the thrilling finals of the inter-city cricket championship. Live commentary and entertainment.',
    category: 'sports',
    venue: {
      name: 'Stadium Arena',
      address: '555 Sports Complex',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      capacity: 30000
    },
    date: new Date('2026-09-10'),
    time: '14:00',
    endTime: '22:00',
    bannerImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200',
    ticketTypes: [
      { name: 'General Stand', price: 199, available: 20000, description: 'General seating area' },
      { name: 'Premium Stand', price: 499, available: 8000, description: 'Better view with cushioned seats' },
      { name: 'VIP Box', price: 1499, available: 500, description: 'Private box with food service' }
    ],
    totalSeats: 28500,
    availableSeats: 28500,
    isApproved: true,
    isActive: true,
    isFeatured: true,
    rating: 4.7,
    tags: ['cricket', 'sports', 'championship']
  },
  {
    title: 'Corporate Gala Night',
    description: 'An elegant evening of networking, dinner, and entertainment for business professionals.',
    category: 'corporate',
    venue: {
      name: 'Grand Ballroom',
      address: '888 Business District',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      capacity: 500
    },
    date: new Date('2026-08-25'),
    time: '19:00',
    endTime: '23:00',
    bannerImage: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200',
    imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200',
    ticketTypes: [
      { name: 'Individual', price: 1999, available: 300, description: 'Single entry pass' },
      { name: 'Corporate Table', price: 14999, available: 20, description: 'Table for 10 with branding' }
    ],
    totalSeats: 320,
    availableSeats: 320,
    isApproved: true,
    isActive: true,
    isFeatured: false,
    rating: 4.4,
    tags: ['corporate', 'networking', 'business']
  }
];

async function seedEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    // Get or create an organizer user
    let organizer = await User.findOne({ role: 'organizer' });
    if (!organizer) {
      organizer = await User.create({
        name: 'Event Organizer',
        email: 'organizer@eventverse.com',
        password: 'organizer123',
        role: 'organizer',
        isVerified: true
      });
      console.log('Created organizer user');
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Add organizer ID to events and create them
    const eventsWithOrganizer = sampleEvents.map(event => ({
      ...event,
      organizer: organizer._id
    }));

    await Event.insertMany(eventsWithOrganizer);
    console.log(`Created ${eventsWithOrganizer.length} sample events`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
}

seedEvents();
