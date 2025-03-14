
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

// Generate JWT Token
export const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  };
  
  return jwt.sign(
    { id },
    secret,
    options
  );
};
