
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
export const getMachines = async (req: Request, res: Response) => {
  try {
    // Get all machines except for safety cabinet
    const machines = await Machine.find({ 
      $or: [
        { machineId: { $ne: 'safety-cabinet' } },
        { _id: { $ne: 'safety-cabinet' } }
      ]
    });
    res.json(machines);
  } catch (error) {
    console.error('Error in getMachines:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
