
import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (id: string, isAdmin: boolean = false) => {
  console.log(`Generating token for user ID: ${id}, isAdmin: ${isAdmin}`);
  return jwt.sign(
    { id, isAdmin }, 
    process.env.JWT_SECRET || 'fallback-secret', 
    { expiresIn: '7d' }
  );
};
