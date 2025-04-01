
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

// Simple in-memory cache for user lookups
// Keys are user IDs, values are user objects with an expiry timestamp
const userCache: { [key: string]: { user: any, expiry: number } } = {};
const CACHE_DURATION = 300000; // 5 minutes in ms

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(userCache).forEach(key => {
    if (userCache[key].expiry < now) {
      delete userCache[key];
    }
  });
}, 600000); // Run every 10 minutes

// Helper function to find a user with any ID format with caching
async function findUserWithAnyIdFormat(userId: string) {
  console.log(`Auth middleware: Looking for user with ID: ${userId}`);
  
  // Check cache first
  const now = Date.now();
  if (userCache[userId] && userCache[userId].expiry > now) {
    console.log(`Auth middleware: Found user in cache: ${userId}`);
    return userCache[userId].user;
  }
  
  // Try all possible ways to find the user
  let user = null;
  
  // Method 1: findById
  try {
    user = await User.findById(userId).select('-password');
    if (user) {
      console.log(`Auth middleware: Found user with findById: ${user._id}`);
      // Cache the user
      userCache[userId] = {
        user,
        expiry: now + CACHE_DURATION
      };
      return user;
    }
  } catch (err) {
    console.log('Auth middleware: Error in findById, trying other methods');
  }
  
  // Method 2: _id as string exact match
  try {
    user = await User.findOne({ _id: userId }).select('-password');
    if (user) {
      console.log(`Auth middleware: Found user with _id exact match: ${user._id}`);
      userCache[userId] = {
        user,
        expiry: now + CACHE_DURATION
      };
      return user;
    }
  } catch (err) {
    console.log('Auth middleware: Error in _id exact match, trying other methods');
  }
  
  // Method 3: id field
  try {
    user = await User.findOne({ id: userId }).select('-password');
    if (user) {
      console.log(`Auth middleware: Found user with id field: ${user._id}`);
      userCache[userId] = {
        user,
        expiry: now + CACHE_DURATION
      };
      return user;
    }
  } catch (err) {
    console.log('Auth middleware: Error in id field search, trying other methods');
  }
  
  // Method 4: numeric conversion
  if (!isNaN(Number(userId))) {
    const numericId = Number(userId);
    
    try {
      user = await User.findById(numericId).select('-password');
      if (user) {
        console.log(`Auth middleware: Found user with numeric findById: ${user._id}`);
        userCache[userId] = {
          user,
          expiry: now + CACHE_DURATION
        };
        return user;
      }
    } catch (err) {
      console.log('Auth middleware: Error in numeric findById');
    }
    
    try {
      user = await User.findOne({ id: numericId }).select('-password');
      if (user) {
        console.log(`Auth middleware: Found user with numeric id field: ${user._id}`);
        userCache[userId] = {
          user,
          expiry: now + CACHE_DURATION
        };
        return user;
      }
    } catch (err) {
      console.log('Auth middleware: Error in numeric id field search');
    }
  }
  
  console.log(`Auth middleware: User not found with any method for ID: ${userId}`);
  return null;
}

// Simple token verification cache
const tokenCache: { [key: string]: { decoded: any, expiry: number } } = {};

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
    // Check if token is in cache
    const now = Date.now();
    if (tokenCache[token] && tokenCache[token].expiry > now) {
      req.user = tokenCache[token].decoded;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };

    // Find user by ID with enhanced user lookup
    const user = await findUserWithAnyIdFormat(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cache the token verification result
    tokenCache[token] = {
      decoded: user,
      expiry: now + CACHE_DURATION
    };

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
