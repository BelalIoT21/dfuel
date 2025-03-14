
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Protect routes - check for valid JWT
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

      // Get user from the token
      req.user = await User.findById((decoded as any).id).select('-password');
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

// Admin middleware - check if user is admin
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    console.error('Admin access denied for user:', req.user ? req.user._id : 'unknown');
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};
