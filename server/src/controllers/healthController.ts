
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';

// Health check controller
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get user count if connected to MongoDB
    let userCount = null;
    if (mongoStatus === 'connected') {
      try {
        userCount = await User.countDocuments({});
      } catch (err) {
        console.error('Error counting users:', err);
      }
    }
    
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
        readyState: mongoose.connection.readyState,
        userCount: userCount
      },
      server: {
        port: process.env.PORT || 4000,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error performing health check',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
