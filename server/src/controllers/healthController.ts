
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// @desc    Get server health status
// @route   GET /api/health
// @access  Public
export const healthCheck = (req: Request, res: Response) => {
  console.log('Health check request received');
  
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: dbStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
};

// @desc    Simple ping endpoint
// @route   GET /api/health/ping
// @access  Public
export const ping = (req: Request, res: Response) => {
  console.log('Ping request received from:', req.ip);
  res.status(200).json({ pong: true, time: new Date().toISOString() });
};
