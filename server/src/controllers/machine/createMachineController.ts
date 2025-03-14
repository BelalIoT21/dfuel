
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';

// @desc    Create a new machine
// @route   POST /api/machines
// @access  Private/Admin
export const createMachine = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      type, 
      description, 
      status, 
      requiresCertification, 
      difficulty, 
      imageUrl
    } = req.body;

    const machine = new Machine({
      name,
      type,
      description,
      status: status || 'Available',
      requiresCertification: requiresCertification !== undefined ? requiresCertification : true,
      difficulty,
      imageUrl
    });

    const createdMachine = await machine.save();
    res.status(201).json(createdMachine);
  } catch (error) {
    console.error('Error in createMachine:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
