
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnit';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'learnit';

export const connectDB = async () => {
  try {
    console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI}`);
    
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Using database: ${MONGODB_DB_NAME}`);
    
    // Verify connection by listing collections
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    } catch (error) {
      console.warn("Could not list collections, but connection appears successful", error);
    }
    
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Please make sure MongoDB is running and accessible.');
    
    // Don't exit in development to allow fallback to localStorage
    if (process.env.NODE_ENV === 'production') {
      console.error("Production environment detected, exiting due to MongoDB connection failure");
      process.exit(1);
    }
    
    return false;
  }
};

// Close the MongoDB connection when the application shuts down
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
