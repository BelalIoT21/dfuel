
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import os from 'os';

// Health check controller
export const healthCheck = (req: Request, res: Response) => {
  // Check MongoDB connection status
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const dbName = mongoose.connection.db?.databaseName || mongoose.connection.name;
  
  // Get CORS origin information
  const origin = req.headers.origin || 'unknown';
  
  // Server information
  const serverInfo = {
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    hostname: os.hostname(),
    loadAverage: os.loadavg(),
    freeMemory: os.freemem(),
    totalMemory: os.totalmem()
  };
  
  res.status(200).json({ 
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString(),
    request: {
      id: req.requestId || 'unknown',
      origin,
      method: req.method,
      path: req.path,
      ip: req.ip,
      headers: {
        // Only include safe headers for debugging
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'accept': req.headers['accept']
      }
    },
    server: serverInfo,
    database: {
      status: dbStatus,
      name: dbName || 'Not connected',
      host: mongoose.connection.host || 'Unknown',
      port: mongoose.connection.port || 'Unknown',
      models: Object.keys(mongoose.connection.models),
      mongoose: mongoose.version
    },
    cors: {
      enabled: true,
      origins: [
        'http://localhost:8080', 
        'http://localhost:5173',
        'http://localhost:3000',
        'https://learnit-client.vercel.app', 
        'https://lovableproject.com',
        '*.lovableproject.com'
      ]
    },
    env: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '4000',
    }
  });
};
