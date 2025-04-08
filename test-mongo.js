import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Successfully connected to MongoDB!');
    console.log('Connection details:', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    });
    
    await mongoose.connection.close();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

testConnection(); 