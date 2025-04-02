
import { Request, Response, NextFunction } from 'express';

// Add CORS headers to all responses
const addCorsHeaders = (res: Response) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Catch 404 errors
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  // Add CORS headers for 404 responses
  addCorsHeaders(res);
  
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom error handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Add CORS headers for error responses
  addCorsHeaders(res);
  
  // Log original URL in error for better debugging
  console.error(`Error on ${req.method} ${req.originalUrl}:`, err.message);
  
  // Determine status code (default to 500 if not set)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  
  // For rate limiting responses, ensure proper content type
  const isRateLimit = statusCode === 429;
  if (isRateLimit) {
    res.setHeader('Content-Type', 'application/json');
  }
  
  // Handle database connection errors specially
  const isDbError = err.message && (
    err.message.includes('MongoDB') || 
    err.message.includes('database') ||
    err.message.includes('connection')
  );
  
  if (isDbError) {
    console.error('Database connection error:', err.message);
  }
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.originalUrl,
    method: req.method,
    code: isDbError ? 'DATABASE_ERROR' : 'SERVER_ERROR'
  });
};
