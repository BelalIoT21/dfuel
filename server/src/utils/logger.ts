
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, `access-${format(new Date(), 'yyyy-MM-dd')}.log`),
  { flags: 'a' }
);

// Create a write stream for error logs
const errorLogStream = fs.createWriteStream(
  path.join(logsDir, `error-${format(new Date(), 'yyyy-MM-dd')}.log`),
  { flags: 'a' }
);

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

// Custom token for formatted date
morgan.token('formatted-date', () => {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
});

// Enhanced logging format with timestamp
const logFormat = ':formatted-date | :method :url :status :response-time ms - :res[content-length] - :request-body';

// Create the morgan middleware with our custom format for console
export const requestLogger = morgan(logFormat, {
  skip: (req) => {
    // Skip health check logs to reduce noise
    return req.url ? req.url.includes('/health') : false;
  }
});

// File logging middleware with the same format
export const fileLogger = morgan(logFormat, {
  stream: accessLogStream,
  skip: (req) => {
    // Skip health check logs in file too
    return req.url ? req.url.includes('/health') : false;
  }
});

// Custom API request logger middleware with file logging
export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  
  // Log request details
  const requestLog = `${timestamp} | API Request: ${req.method} ${req.originalUrl}`;
  console.log(requestLog);
  accessLogStream.write(requestLog + '\n');
  
  // Log sanitized request body for POST and PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '********';
    if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '********';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '********';
    
    const bodyLog = `${timestamp} | Request Body: ${JSON.stringify(sanitizedBody)}`;
    console.log(bodyLog);
    accessLogStream.write(bodyLog + '\n');
  }
  
  // Capture the original send function
  const originalSend = res.send;
  
  // Override the send function to log response
  res.send = function(body) {
    const duration = Date.now() - start;
    
    // Log response details
    const responseLog = `${timestamp} | API Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`;
    console.log(responseLog);
    accessLogStream.write(responseLog + '\n');
    
    // Log errors to error log
    if (res.statusCode >= 400) {
      const errorLog = `${timestamp} | ERROR: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${body}`;
      console.error(errorLog);
      errorLogStream.write(errorLog + '\n');
    }
    
    // Restore original send function and call it
    res.send = originalSend;
    return originalSend.call(this, body);
  };
  
  next();
};

// Log uncaught exceptions and unhandled rejections
export const setupGlobalErrorLogging = () => {
  process.on('uncaughtException', (error) => {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const errorLog = `${timestamp} | UNCAUGHT EXCEPTION: ${error.message}\n${error.stack}\n`;
    console.error(errorLog);
    errorLogStream.write(errorLog);
    
    // Give logger time to write before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason, promise) => {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const errorLog = `${timestamp} | UNHANDLED REJECTION: ${reason}\n`;
    console.error(errorLog);
    errorLogStream.write(errorLog);
  });
};

