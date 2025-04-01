
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Simple in-memory cache for user lookups to reduce database queries
// Key is user ID, value is user object and timestamp
const userCache: Map<string, { user: any, timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function to find a user with any ID format (with caching)
async function findUserWithAnyIdFormat(userId: string) {
  // Check if user is in cache and not expired
  const cachedData = userCache.get(userId);
  if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
    // User found in cache and not expired
    return cachedData.user;
  }
  
  // Not in cache, or cache expired, proceed with database lookup
  console.log(`Auth middleware: Looking for user with ID: ${userId}`);
  
  let user = null;
  
  // Try findById first as it's the most efficient method
  try {
    user = await User.findById(userId).select('-password');
    if (user) {
      // Cache the user for future requests
      userCache.set(userId, { user, timestamp: Date.now() });
      return user;
    }
  } catch (err) {
    // If findById fails, try other methods
  }
  
  // Method 2: _id as string exact match
  try {
    user = await User.findOne({ _id: userId }).select('-password');
    if (user) {
      userCache.set(userId, { user, timestamp: Date.now() });
      return user;
    }
  } catch (err) {
    // Continue to next method
  }
  
  // Method 3: id field
  try {
    user = await User.findOne({ id: userId }).select('-password');
    if (user) {
      userCache.set(userId, { user, timestamp: Date.now() });
      return user;
    }
  } catch (err) {
    // Continue to next method
  }
  
  // Method 4: numeric conversion
  if (!isNaN(Number(userId))) {
    const numericId = Number(userId);
    
    try {
      user = await User.findById(numericId).select('-password');
      if (user) {
        userCache.set(userId, { user, timestamp: Date.now() });
        return user;
      }
    } catch (err) {
      // Continue to next method
    }
    
    try {
      user = await User.findOne({ id: numericId }).select('-password');
      if (user) {
        userCache.set(userId, { user, timestamp: Date.now() });
        return user;
      }
    } catch (err) {
      // Last attempt failed
    }
  }
  
  console.log(`Auth middleware: User not found with any method for ID: ${userId}`);
  return null;
}

// Protect routes with JWT authentication
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };

    // Find user by ID with enhanced user lookup (now with caching)
    const user = await findUserWithAnyIdFormat(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protect middleware:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin middleware
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
