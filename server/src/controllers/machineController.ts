
import { Request, Response } from 'express';
import { Machine } from '../models/Machine';
import mongoose from 'mongoose';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machines = await Machine.find({});
    res.json(machines);
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
    // Special case for safety-cabinet, which might not exist as a real DB entity
    if (req.params.id === 'safety-cabinet') {
      return res.json({
        _id: 'safety-cabinet',
        name: 'Safety Cabinet',
        type: 'Safety',
        description: 'Safety training equipment',
        status: 'Available',
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

// @desc    Get machine status
// @route   GET /api/machines/:id/status
// @access  Public
export const getMachineStatus = async (req: Request, res: Response) => {
  try {
    // Special case for safety-cabinet
    if (req.params.id === 'safety-cabinet') {
      return res.json({ 
        status: 'Available',
        note: ''
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
        note: machine.maintenanceNote || ''
      });
    } else {
      // For demo/development purposes, return a default status for non-existent machine IDs
      // This helps when frontend is using mock data with numeric IDs
      if (!isValidObjectId && !isNaN(parseInt(req.params.id))) {
        return res.json({
          status: 'Available',
          note: ''
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
    res.json(updatedMachine);
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
