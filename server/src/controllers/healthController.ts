
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Health check controller
export const healthCheck = (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  console.log(`Health check request received. DB Status: ${dbStatus}`);
  
  res.status(200).json({ 
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'not connected'
    },
    environment: process.env.NODE_ENV || 'development'
  });
};

// Simple ping endpoint for connectivity testing
export const ping = (req: Request, res: Response) => {
  res.status(200).json({ pong: true });
};
