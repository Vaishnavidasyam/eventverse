const mongoose = require('mongoose');
const Category = require('./models/Category');

const systemCategories = [
  { name: 'wedding', icon: '💒', label: 'Weddings', color: 'from-pink-500 to-rose-500', description: 'Wedding ceremonies and receptions' },
  { name: 'birthday', icon: '🎂', label: 'Birthdays', color: 'from-yellow-500 to-orange-500', description: 'Birthday parties and celebrations' },
  { name: 'concert', icon: '🎵', label: 'Concerts', color: 'from-purple-500 to-indigo-500', description: 'Music concerts and performances' },
  { name: 'conference', icon: '🎤', label: 'Conferences', color: 'from-blue-500 to-cyan-500', description: 'Business conferences and seminars' },
  { name: 'workshop', icon: '📚', label: 'Workshops', color: 'from-green-500 to-emerald-500', description: 'Educational workshops and training sessions' },
  { name: 'festival', icon: '🎪', label: 'Festivals', color: 'from-red-500 to-pink-500', description: 'Cultural and music festivals' },
  { name: 'sports', icon: '⚽', label: 'Sports', color: 'from-orange-500 to-red-500', description: 'Sports events and tournaments' },
  { name: 'corporate', icon: '💼', label: 'Corporate', color: 'from-slate-500 to-gray-500', description: 'Corporate events and meetings' },
];

require('dotenv').config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    // Clear existing system categories
    await Category.deleteMany({ isSystem: true });
    console.log('Cleared existing system categories');

    // Insert system categories
    await Category.insertMany(
      systemCategories.map(cat => ({ ...cat, isSystem: true, isActive: true }))
    );
    console.log('System categories seeded successfully');

    const count = await Category.countDocuments({ isSystem: true });
    console.log(`Total system categories: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
