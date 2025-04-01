
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
    return cachedData.user;
  }
  
  // Try findById first
  try {
    const user = await User.findById(userId).select('-password');
    if (user) {
      userCache.set(userId, { user, timestamp: Date.now() });
      return user;
    }
  } catch (err) {
    // Continue to next method if this fails
  }
  
  // Also try finding by _id as string
  try {
    const user = await User.findOne({ _id: userId }).select('-password');
    if (user) {
      userCache.set(userId, { user, timestamp: Date.now() });
      return user;
    }
  } catch (err) {
    // Continue to numeric ID conversion if needed
  }
  
  // Numeric ID conversion as last resort
  if (!isNaN(Number(userId))) {
    try {
      const user = await User.findOne({ _id: Number(userId) }).select('-password');
      if (user) {
        userCache.set(userId, { user, timestamp: Date.now() });
        return user;
      }
    } catch (err) {
      // Last attempt failed
    }
  }
  
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
    
    // Find user by ID 
    const user = await findUserWithAnyIdFormat(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
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
