
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

// Helper function to find a user with any ID format (similar to the one in certificationController)
async function findUserWithAnyIdFormat(userId: string) {
  console.log(`Auth middleware: Looking for user with ID: ${userId}`);
  
  // Try all possible ways to find the user
  let user = null;
  
  // Method 1: findById
  try {
    user = await User.findById(userId).select('-password');
    if (user) {
      console.log(`Auth middleware: Found user with findById: ${user._id}`);
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
        return user;
      }
    } catch (err) {
      console.log('Auth middleware: Error in numeric findById');
    }
    
    try {
      user = await User.findOne({ id: numericId }).select('-password');
      if (user) {
        console.log(`Auth middleware: Found user with numeric id field: ${user._id}`);
        return user;
      }
    } catch (err) {
      console.log('Auth middleware: Error in numeric id field search');
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

    // Find user by ID with enhanced user lookup
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
