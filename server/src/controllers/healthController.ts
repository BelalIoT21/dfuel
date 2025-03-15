
import { Request, Response } from 'express';

// Health check controller
export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString()
  });
};
