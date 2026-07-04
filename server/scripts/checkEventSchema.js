require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

const checkEventSchema = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    // Check the category field schema
    const categoryPath = Event.schema.path('category');
    console.log('Category field schema:', JSON.stringify({
      instance: categoryPath.instance,
      options: categoryPath.options,
      validators: categoryPath.validators
    }, null, 2));

    // Check all paths
    console.log('\nAll schema paths:');
    Event.schema.eachPath((path, schemaType) => {
      console.log(`${path}: ${schemaType.instance}`, schemaType.options);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
};

checkEventSchema();
