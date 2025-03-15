
import { Request, Response } from 'express';
import { checkDbConnection } from '../config/db';

// Health check controller
export const healthCheck = (req: Request, res: Response) => {
  // Get the current MongoDB connection status
  const dbStatus = checkDbConnection();
  
  // Send a more explicit response with detailed MongoDB connection status
  res.status(200).json({ 
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected === true, // Ensure boolean type
      state: dbStatus.state,
      host: dbStatus.host
    }
  });
};
