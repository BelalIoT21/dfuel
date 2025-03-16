
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Health check controller
export const healthCheck = (req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  // Add CORS headers explicitly for health check
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  res.status(200).json({ 
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString(),
    mongodb: {
      status: mongoStatus,
      host: mongoose.connection.host || 'not connected',
      database: mongoose.connection.name || 'not connected',
      readyState: mongoose.connection.readyState
    },
    server: {
      port: process.env.PORT || 4000,
      environment: process.env.NODE_ENV || 'development'
    }
  });
};
