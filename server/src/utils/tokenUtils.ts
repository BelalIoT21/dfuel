
import jwt from 'jsonwebtoken';

// Generate JWT Token
export const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign(
    { id },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};
