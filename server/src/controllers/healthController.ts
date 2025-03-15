
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import os from 'os';

// Enhanced health check controller
export const healthCheck = (req: Request, res: Response) => {
  // Get MongoDB connection status
  const mongoStatus = {
    connected: mongoose.connection.readyState === 1,
    state: getMongoConnectionState(mongoose.connection.readyState),
    host: mongoose.connection.host || 'Not connected',
    database: mongoose.connection.name || 'Not connected'
  };
  
  // Get basic server information
  const serverInfo = {
    uptime: Math.floor(process.uptime()),
    memoryUsage: process.memoryUsage(),
    hostname: os.hostname(),
    platform: os.platform(),
    nodeVersion: process.version,
    cpuCores: os.cpus().length
  };
  
  res.status(200).json({ 
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoStatus,
    server: serverInfo
  });
};

// Helper function to get readable connection state name
// Fixed: Using a type-safe approach with Record<number, string>
const getMongoConnectionState = (state: number): string => {
  const states: Record<number, string> = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
    99: 'Uninitialized'
  };
  return states[state] || 'Unknown';
};
