
import { Request, Response, NextFunction } from 'express';

// Catch 404 errors
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom error handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Determine status code (default to 500 if not set)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error details
  console.error(`[ERROR] ${statusCode} - ${req.method} ${req.originalUrl}`);
  console.error(`Error message: ${err.message}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(`Stack trace: ${err.stack}`);
  }
  
  // Additional information for debugging specific error types
  if (err.name === 'ValidationError') {
    console.error('Validation Error Details:', err);
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    console.error('MongoDB Error Details:', err);
  }
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};
