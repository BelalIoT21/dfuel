
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Health check controller
export const healthCheck = (req: Request, res: Response) => {
  // Check MongoDB connection status
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'Not connected'
    },
    cors: {
      enabled: true,
      origins: ['http://localhost:8080', 'https://learnit-client.vercel.app', 'https://lovableproject.com']
    }
  });
};
