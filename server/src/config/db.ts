
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnit';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      // These settings help maintain a stable connection
      // Set a shorter server selection timeout (ms)
      serverSelectionTimeoutMS: 5000,
      // Set connection timeout (ms)
      connectTimeoutMS: 10000,
      // Set socket timeout (ms)
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected, attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    return mongoose.connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
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
