
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';
import mongoose from 'mongoose';

// @desc    Get machine by ID
// @route   GET /api/machines/:id
// @access  Public
export const getMachineById = async (req: Request, res: Response) => {
  try {
    // Special case for safety-cabinet - always return a mock machine
    if (req.params.id === 'safety-cabinet') {
      console.log('Returning mock safety cabinet data');
      return res.json({
        _id: 'safety-cabinet',
        name: 'Safety Cabinet',
        type: 'Safety',
        description: 'Safety training equipment',
        status: 'available',
        requiresCertification: true,
        difficulty: 'Beginner'
      });
    }
    
    // Check if ID is a valid MongoDB ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    
    let machine;
    if (isValidObjectId) {
      machine = await Machine.findById(req.params.id);
    } else {
      // If not a valid ObjectId, try to find by a custom id field
      machine = await Machine.findOne({ machineId: req.params.id });
    }
    
    if (machine) {
      res.json(machine);
    } else {
      // For demo/development purposes, return a mock machine for non-existent IDs
      // This helps when frontend is using mock data with numeric IDs
      if (!isValidObjectId && !isNaN(parseInt(req.params.id))) {
        return res.json({
          _id: req.params.id,
          name: `Mock Machine ${req.params.id}`,
          type: 'Mock',
          description: 'This is a mock machine for development',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Beginner'
        });
      }
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (error) {
    console.error('Error in getMachineById:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
