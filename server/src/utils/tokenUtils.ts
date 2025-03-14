
import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (id: string, isAdmin: boolean = false) => {
  console.log(`Generating token for user ID: ${id}, isAdmin: ${isAdmin}`);
  
  // Make sure isAdmin is explicitly a boolean
  const adminStatus = isAdmin === true;
  
  return jwt.sign(
    { 
      id, 
      isAdmin: adminStatus 
    }, 
    process.env.JWT_SECRET || 'fallback-secret', 
    { expiresIn: '30d' } // Extended token expiry for testing
  );
};
