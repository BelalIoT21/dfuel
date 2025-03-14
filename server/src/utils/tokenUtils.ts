
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

// Define a type for our supported expiration values
type ExpiresInType = string | number;

// Generate JWT Token
export const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  
  // Create a properly typed options object
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as ExpiresInType,
  };
  
  return jwt.sign({ id }, secret, options);
};
