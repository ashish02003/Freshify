// cleanup.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check current indexes
    console.log('Current indexes:');
    const indexes = await usersCollection.indexes();
    console.log(indexes);

    // Remove documents with null username
    console.log('Removing documents with null username...');
    const deleteResult = await usersCollection.deleteMany({ username: null });
    console.log(`Deleted ${deleteResult.deletedCount} documents with null username`);

    // Drop username index if it exists
    try {
      await usersCollection.dropIndex('username_1');
      console.log('Dropped username_1 index successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('username_1 index does not exist');
      } else {
        console.log('Error dropping index:', error.message);
      }
    }

    // Check remaining documents
    const remainingDocs = await usersCollection.countDocuments();
    console.log(`Remaining documents in users collection: ${remainingDocs}`);

    console.log('Cleanup completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanupDatabase();
