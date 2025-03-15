
import { Request, Response } from 'express';
import { Machine } from '../models/Machine';
import { validationResult } from 'express-validator';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
export const getMachines = async (req: Request, res: Response) => {
  try {
    console.log('Fetching all machines from MongoDB');
    const machines = await Machine.find({});
    console.log(`Found ${machines.length} machines`);
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
    console.log(`Fetching machine with ID: ${req.params.id}`);
    const machine = await Machine.findById(req.params.id);
    
    if (machine) {
      console.log(`Found machine: ${machine.name}`);
      res.json(machine);
    } else {
      console.log(`Machine not found with ID: ${req.params.id}`);
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

// @desc    Create a new machine
// @route   POST /api/machines
// @access  Private/Admin
export const createMachine = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    console.log('Received machine data:', req.body);
    
    const { 
      name, 
      type, 
      description, 
      status, 
      requiresCertification, 
      difficulty, 
      imageUrl,
      details,
      specifications,
      certificationInstructions,
      linkedCourseId,
      linkedQuizId
    } = req.body;

    const machine = new Machine({
      name,
      type,
      description,
      status: status || 'Available',
      requiresCertification: requiresCertification !== undefined ? requiresCertification : true,
      difficulty,
      imageUrl,
      details,
      specifications,
      certificationInstructions,
      linkedCourseId: linkedCourseId || undefined,
      linkedQuizId: linkedQuizId || undefined,
      bookedTimeSlots: []
    });

    const createdMachine = await machine.save();
    console.log('Machine created successfully:', createdMachine);
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
    console.log(`Updating machine status: ID=${req.params.id}, status=${status}`);
    
    const machine = await Machine.findById(req.params.id);
    
    if (!machine) {
      console.log(`Machine not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    machine.status = status;
    if (maintenanceNote !== undefined) {
      machine.maintenanceNote = maintenanceNote;
    }
    
    const updatedMachine = await machine.save();
    console.log(`Machine status updated: ${updatedMachine.name} -> ${updatedMachine.status}`);
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
    console.log(`Updating machine: ID=${req.params.id}`);
    
    const machine = await Machine.findById(req.params.id);
    
    if (!machine) {
      console.log(`Machine not found with ID: ${req.params.id}`);
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
      imageUrl,
      details,
      specifications,
      certificationInstructions,
      linkedCourseId,
      linkedQuizId
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
    if (details !== undefined) machine.details = details;
    if (specifications !== undefined) machine.specifications = specifications;
    if (certificationInstructions !== undefined) machine.certificationInstructions = certificationInstructions;
    if (linkedCourseId !== undefined) machine.linkedCourseId = linkedCourseId;
    if (linkedQuizId !== undefined) machine.linkedQuizId = linkedQuizId;
    
    const updatedMachine = await machine.save();
    console.log(`Machine updated successfully: ${updatedMachine.name}`);
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
    console.log(`Deleting machine: ID=${req.params.id}`);
    
    const machine = await Machine.findById(req.params.id);
    
    if (!machine) {
      console.log(`Machine not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    await machine.deleteOne();
    console.log(`Machine deleted: ${machine.name}`);
    res.json({ message: 'Machine removed' });
  } catch (error) {
    console.error('Error in deleteMachine:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
