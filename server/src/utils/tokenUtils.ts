
import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (id: string, isAdmin: boolean = false) => {
  return jwt.sign(
    { id, isAdmin }, 
    process.env.JWT_SECRET || 'fallback-secret', 
    { expiresIn: '7d' }
  );
};
