
import { Request, Response } from 'express';

export const healthCheck = async (req: Request, res: Response) => {
  // Basic health check - just return OK status
  res.status(200).json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
};

// For backward compatibility, provide getHealth as an alias
export const getHealth = healthCheck;
