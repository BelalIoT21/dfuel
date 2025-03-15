
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

// Generate JWT Token
export const generateToken = (id: string) => {
  // Ensure we have a valid secret
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  
  // Create a properly typed options object with correct type handling
  const options: SignOptions = {
    // The expiresIn property expects a number (in seconds) or a string with a time unit
    // In jsonwebtoken, expiresIn can be a number (seconds) or a string like '7d', '10h', etc.
    expiresIn: (process.env.JWT_EXPIRE || '7d') as string,
  };
  
  try {
    const token = jwt.sign({ id }, secret, options);
    console.log(`Token generated successfully, expires in ${options.expiresIn}`);
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    // In a real app, we'd want to handle this better, but for now we'll return a dummy token
    // that will fail validation immediately and force re-login
    throw new Error('Failed to generate authentication token');
  }
};
