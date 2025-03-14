
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';
import mongoose from 'mongoose';

// @desc    Get machine by ID
// @route   GET /api/machines/:id
// @access  Public
export const getMachineById = async (req: Request, res: Response) => {
  try {
    // Special case for safety-cabinet - always return a mock safety entity (not a machine)
    if (req.params.id === 'safety-cabinet') {
      console.log('Returning mock safety cabinet data');
      return res.json({
        _id: 'safety-cabinet',
        name: 'Safety Cabinet',
        type: 'Safety',
        description: 'Safety training equipment',
        status: 'available',
        requiresCertification: true,
        difficulty: 'Beginner',
        imageUrl: 'https://images.unsplash.com/photo-1606091505136-3f9e61673f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      });
    }
    
    // Special case for safety-course - return a mock course entity (not a machine)
    if (req.params.id === 'safety-course') {
      console.log('Returning mock safety course data');
      return res.json({
        _id: 'safety-course',
        name: 'General Safety Course',
        type: 'Safety',
        description: 'Required safety training for all workshop users',
        status: 'available',
        requiresCertification: false,
        difficulty: 'Beginner',
        imageUrl: 'https://images.unsplash.com/photo-1541890289-b86df5bafd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
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
      const machineObj = machine.toObject();
      
      // Add default image if none exists
      if (!machineObj.imageUrl) {
        const type = machineObj.type.toLowerCase();
        if (type.includes('laser')) {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1565696392944-b1a54b3102dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
        } else if (type.includes('printer') || type.includes('3d')) {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
        } else if (type.includes('safety')) {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1606091505136-3f9e61673f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
        } else {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
        }
      }
      
      res.json(machineObj);
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
          difficulty: 'Beginner',
          imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
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
