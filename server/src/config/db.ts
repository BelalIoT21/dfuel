
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Use the MongoDB URI from .env but provide a fallback for local development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnit';

export const connectDB = async () => {
  try {
    console.log(`Server attempting to connect to MongoDB at: ${MONGODB_URI}`);
    
    const conn = await mongoose.connect(MONGODB_URI);
    
    console.log(`MongoDB Connected on server: ${conn.connection.host}`);
    
    // Add event listeners for connection issues
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
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
