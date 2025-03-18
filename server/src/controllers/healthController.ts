
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Health check controller
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Add CORS headers explicitly for health check
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    console.log(`Health check requested from: ${req.ip}, User-Agent: ${req.headers['user-agent']}`);
    
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
        environment: process.env.NODE_ENV || 'development',
        ip: req.ip
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    // Add CORS headers for error response too
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(500).json({ 
      status: 'error',
      message: 'Error performing health check',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
