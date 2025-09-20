// cleanup-email.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Show indexes
    console.log(await usersCollection.indexes());

    // Remove documents with null email (optional)
    const deleteResult = await usersCollection.deleteMany({ email: null });
    console.log(`Deleted ${deleteResult.deletedCount} documents with null email`);

    // Drop email index if exists
    try {
      await usersCollection.dropIndex('email_1');
      console.log('Dropped email_1 index successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('email_1 index does not exist');
      } else {
        console.log('Error dropping index:', error.message);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanupDatabase();
