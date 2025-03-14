
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
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      
      // Set isAdmin from token payload for more reliable admin checks
      if ((decoded as any).isAdmin !== undefined) {
        req.user.isAdmin = (decoded as any).isAdmin;
      }
      
      console.log(`User authenticated: ${req.user.email}, isAdmin: ${req.user.isAdmin}`);
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

// Admin middleware - check if user is admin
export const admin = (req: Request, res: Response, next: NextFunction) => {
  // Using isAdmin property that was set from the token in the protect middleware
  if (req.user && req.user.isAdmin === true) {
    console.log(`Admin access granted for user: ${req.user.email}`);
    next();
  } else {
    console.error('Admin access denied for user:', req.user ? req.user.email : 'unknown', 'isAdmin:', req.user ? req.user.isAdmin : false);
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};
