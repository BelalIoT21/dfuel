
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

// Custom token for request body logging (with password masking)
morgan.token('request-body', (req: Request) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    // Create a copy of the body to modify it
    const sanitizedBody = { ...req.body };
    
    // Mask sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '********';
    if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '********';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '********';
    
    return JSON.stringify(sanitizedBody);
  }
  return '';
});

// Enhanced logging format
const logFormat = ':method :url :status :response-time ms - :res[content-length] - :request-body';

// Create the morgan middleware with our custom format
export const requestLogger = morgan(logFormat, {
  skip: (req) => {
    // Fixed: Check if url is defined before using it
    return req.url ? req.url.includes('/health') : false;
  } // Skip health check logs to reduce noise
});

// Custom API request logger middleware
export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request details
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  
  // Log sanitized request body for POST and PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '********';
    if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '********';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '********';
    
    console.log(`Request Body: ${JSON.stringify(sanitizedBody)}`);
  }
  
  // Capture the original send function
  const originalSend = res.send;
  
  // Override the send function to log response
  res.send = function(body) {
    const duration = Date.now() - start;
    
    // Log response details
    console.log(`API Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    
    // Restore original send function and call it
    res.send = originalSend;
    return originalSend.call(this, body);
  };
  
  next();
};
