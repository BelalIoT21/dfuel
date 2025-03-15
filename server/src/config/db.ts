
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
    
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Falling back to local data storage');
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
