
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Get MongoDB URI from environment variables or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnit';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'learnit';

export const connectDB = async () => {
  try {
    console.log(`Attempting to connect to MongoDB at ${MONGODB_URI}...`);
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }
    
    const options = {
      // Add connection options for local MongoDB
      connectTimeoutMS: 10000, // 10 seconds for local connection
      socketTimeoutMS: 45000,  // 45 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds for local server
      retryWrites: true,
      retryReads: true
    };

    const conn = await mongoose.connect(MONGODB_URI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${MONGODB_DB_NAME}`);
    
    // List all collections for debugging
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Set up error handlers for mongoose connection
    mongoose.connection.on('error', (err) => {
      console.error(`Mongoose connection error: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected from MongoDB');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('Mongoose reconnected to MongoDB');
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Check if MongoDB Compass is running locally');
    process.exit(1);
  }
};

// Function to check the MongoDB connection status
export const checkDbConnection = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[mongoose.connection.readyState] || 'unknown';
  
  console.log(`MongoDB connection state: ${state} (${mongoose.connection.readyState})`);
  return {
    connected: mongoose.connection.readyState === 1,
    state: state
  };
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
