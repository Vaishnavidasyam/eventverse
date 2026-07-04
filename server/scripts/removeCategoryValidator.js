require('dotenv').config();
const mongoose = require('mongoose');

const removeCategoryValidator = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');

    // Get current collection info
    const collectionInfo = await db.listCollections({ name: 'events' }).toArray();
    
    if (collectionInfo.length > 0 && collectionInfo[0].options && collectionInfo[0].options.validator) {
      console.log('Current validator:', JSON.stringify(collectionInfo[0].options.validator, null, 2));
      
      // Remove the validator by updating the collection
      await db.command({
        collMod: 'events',
        validator: {},
        validationLevel: 'off',
        validationAction: 'warn'
      });
      
      console.log('Successfully removed category validator from events collection');
    } else {
      console.log('No validator found on events collection');
    }

    // Verify the change
    const updatedInfo = await db.listCollections({ name: 'events' }).toArray();
    console.log('Updated collection info:', JSON.stringify(updatedInfo[0].options, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error removing validator:', error);
    process.exit(1);
  }
};

removeCategoryValidator();
