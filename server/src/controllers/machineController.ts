
import { Request, Response } from 'express';
import { Machine } from '../models/Machine';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machines = await Machine.find({});
    
    // Ensure all machines have 'Machine' as their type
    const machinesWithFixedType = machines.map(machine => {
      return {
        ...machine.toObject(),
        type: 'Machine'
      };
    });
    
    res.json(machinesWithFixedType);
  } catch (error) {
    console.error('Error in getMachines:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Get machine by ID
// @route   GET /api/machines/:id
// @access  Public
export const getMachineById = async (req: Request, res: Response) => {
  try {
    const machine = await Machine.findById(req.params.id);
    
    if (machine) {
      // Ensure machine has 'Machine' as its type
      const machineWithFixedType = {
        ...machine.toObject(),
        type: 'Machine'
      };
      
      res.json(machineWithFixedType);
    } else {
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

// @desc    Update machine status
// @route   PUT /api/machines/:id/status
// @access  Private/Admin
export const updateMachineStatus = async (req: Request, res: Response) => {
  try {
    const { status, maintenanceNote } = req.body;
    
    const machine = await Machine.findById(req.params.id);
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    machine.status = status;
    if (maintenanceNote !== undefined) {
      machine.maintenanceNote = maintenanceNote;
    }
    
    const updatedMachine = await machine.save();
    
    // Ensure machine has 'Machine' as its type in the response
    const machineWithFixedType = {
      ...updatedMachine.toObject(),
      type: 'Machine'
    };
    
    res.json(machineWithFixedType);
  } catch (error) {
    console.error('Error in updateMachineStatus:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

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
      description, 
      status, 
      maintenanceNote,
      requiresCertification, 
      difficulty, 
      imageUrl,
      details,
      specifications,
      certificationInstructions,
      linkedCourseId,
      linkedQuizId
    } = req.body;
    
    // Update fields if provided, but always set type to 'Machine'
    if (name) machine.name = name;
    machine.type = 'Machine'; // Always set type to 'Machine'
    if (description) machine.description = description;
    if (status) machine.status = status;
    if (maintenanceNote !== undefined) machine.maintenanceNote = maintenanceNote;
    if (requiresCertification !== undefined) machine.requiresCertification = requiresCertification;
    if (difficulty) machine.difficulty = difficulty;
    if (imageUrl) machine.imageUrl = imageUrl;
    if (details !== undefined) machine.details = details;
    if (specifications !== undefined) machine.specifications = specifications;
    if (certificationInstructions !== undefined) machine.certificationInstructions = certificationInstructions;
    if (linkedCourseId !== undefined) machine.linkedCourseId = linkedCourseId;
    if (linkedQuizId !== undefined) machine.linkedQuizId = linkedQuizId;
    
    const updatedMachine = await machine.save();
    
    // Ensure machine has 'Machine' as its type in the response
    const machineWithFixedType = {
      ...updatedMachine.toObject(),
      type: 'Machine'
    };
    
    res.json(machineWithFixedType);
  } catch (error) {
    console.error('Error in updateMachine:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Delete a machine
// @route   DELETE /api/machines/:id
// @access  Private/Admin
export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const machine = await Machine.findById(req.params.id);
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    await machine.deleteOne();
    res.json({ message: 'Machine removed' });
  } catch (error) {
    console.error('Error in deleteMachine:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
