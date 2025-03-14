
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';
import mongoose from 'mongoose';

// @desc    Get machine status
// @route   GET /api/machines/:id/status
// @access  Public
export const getMachineStatus = async (req: Request, res: Response) => {
  try {
    // Special case for safety-cabinet - always return a mock status
    if (req.params.id === 'safety-cabinet') {
      console.log('Returning hardcoded available status for safety cabinet');
      return res.json({ 
        status: 'available',
        note: '',
        isEquipment: true
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
      res.json({ 
        status: machine.status || 'Available',
        note: machine.maintenanceNote || '',
        isEquipment: false
      });
    } else {
      // For demo/development purposes, return a default status for non-existent machine IDs
      // This helps when frontend is using mock data with numeric IDs
      if (!isValidObjectId && !isNaN(parseInt(req.params.id))) {
        return res.json({
          status: 'Available',
          note: '',
          isEquipment: false
        });
      }
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (error) {
    console.error('Error in getMachineStatus:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
