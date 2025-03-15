
import { Request, Response, NextFunction } from 'express';

// Catch 404 errors
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom error handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Determine status code (default to 500 if not set)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Add CORS headers to ensure frontend can read the error
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};
