
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';

// @desc    Update machine details
// @route   PUT /api/machines/:id
// @access  Private/Admin
export const updateMachine = async (req: Request, res: Response) => {
  try {
    const machine = await Machine.findById(req.params.id);
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    const { 
      name, 
      type, 
      description, 
      status, 
      maintenanceNote,
      requiresCertification, 
      difficulty, 
      imageUrl
    } = req.body;
    
    // Update fields if provided
    if (name) machine.name = name;
    if (type) machine.type = type;
    if (description) machine.description = description;
    if (status) machine.status = status;
    if (maintenanceNote !== undefined) machine.maintenanceNote = maintenanceNote;
    if (requiresCertification !== undefined) machine.requiresCertification = requiresCertification;
    if (difficulty) machine.difficulty = difficulty;
    if (imageUrl) machine.imageUrl = imageUrl;
    
    const updatedMachine = await machine.save();
    res.json(updatedMachine);
  } catch (error) {
    console.error('Error in updateMachine:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
