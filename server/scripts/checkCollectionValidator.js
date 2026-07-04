require('dotenv').config();
const mongoose = require('mongoose');

const checkCollectionValidator = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventverse');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get collection info with validator
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      if (collection.name === 'events') {
        console.log('\n=== Events Collection Info ===');
        console.log('Name:', collection.name);
        console.log('Options:', JSON.stringify(collection.options, null, 2));
        
        if (collection.options.validator) {
          console.log('\n=== Validator Found ===');
          console.log(JSON.stringify(collection.options.validator, null, 2));
        } else {
          console.log('\nNo validator found on events collection');
        }
        
        if (collection.options.validationLevel) {
          console.log('Validation Level:', collection.options.validationLevel);
        }
        
        if (collection.options.validationAction) {
          console.log('Validation Action:', collection.options.validationAction);
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking collection:', error);
    process.exit(1);
  }
};

checkCollectionValidator();
