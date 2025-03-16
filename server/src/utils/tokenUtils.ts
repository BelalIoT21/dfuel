
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

// Generate JWT Token
export const generateToken = (id: string) => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    console.log(`Generating token for user ID: ${id}`);
    
    if (!id) {
      throw new Error('User ID is required to generate token');
    }
    
    // Create a properly typed options object with correct type handling
    const options: SignOptions = {
      // The expiresIn property expects a number (in seconds) or a string with a time unit
      // In jsonwebtoken, expiresIn can be a number (seconds) or a string like '7d', '10h', etc.
      expiresIn: process.env.JWT_EXPIRE || '7d',
    };
    
    const token = jwt.sign({ id }, secret, options);
    console.log('Token generated successfully');
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};
