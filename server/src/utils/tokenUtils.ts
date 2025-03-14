
import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (id: string, isAdmin: boolean = false) => {
  // Force isAdmin to be a boolean with triple equals comparison
  const adminStatus = isAdmin === true;
  
  console.log(`Generating token for user ID: ${id}, isAdmin: ${adminStatus}`);
  
  // Use the explicit adminStatus variable in token payload
  return jwt.sign(
    { 
      id, 
      isAdmin: adminStatus 
    }, 
    process.env.JWT_SECRET || 'fallback-secret', 
    { expiresIn: '30d' } // Extended token expiry for testing
  );
};
