
import { Request, Response, NextFunction } from 'express';

// Catch 404 errors
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  // Add CORS headers for 404 responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom error handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Add CORS headers for error responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Determine status code (default to 500 if not set)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error for debugging
  console.error(`Error: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  
  // If the error has additional properties (like a MongoDB validation error), include them
  const errorResponse: any = {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.originalUrl,
    method: req.method
  };
  
  // Add any additional error details if they exist
  if ((err as any).errors) {
    errorResponse.errors = (err as any).errors;
  }
  
  if ((err as any).error) {
    errorResponse.error = (err as any).error;
  }

  res.status(statusCode).json(errorResponse);
};
