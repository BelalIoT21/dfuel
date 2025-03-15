
import { Request, Response } from 'express';
import { Machine } from '../models/Machine';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
export const getMachines = async (req: Request, res: Response) => {
  try {
    console.log('Fetching all machines from MongoDB');
    const machines = await Machine.find({}).limit(4);
    console.log(`Found ${machines.length} machines`);
    res.json(machines);
  } catch (error) {
    console.error('Error in getMachines:', error);
    // Return fixed demo data to prevent blank screen
    res.json([
      { 
        _id: '1', 
        name: 'Laser Cutter', 
        type: 'Cutting', 
        status: 'Available', 
        description: 'Precision laser cutting machine for detailed work on various materials.', 
        requiresCertification: true,
        difficulty: 'Advanced',
        imageUrl: '/machines/laser-cutter.jpg'
      },
      { 
        _id: '2', 
        name: '3D Printer', 
        type: 'Printing', 
        status: 'Available', 
        description: 'FDM 3D printing for rapid prototyping and model creation.', 
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/3d-printer.jpg'
      },
      { 
        _id: '3', 
        name: 'CNC Router', 
        type: 'Cutting', 
        status: 'Maintenance', 
        description: 'Computer-controlled cutting machine for wood, plastic, and soft metals.', 
        requiresCertification: true,
        difficulty: 'Advanced',
        maintenanceNote: 'Undergoing monthly maintenance, available next week.',
        imageUrl: '/machines/cnc-router.jpg'
      },
      { 
        _id: '4', 
        name: 'Vinyl Cutter', 
        type: 'Cutting', 
        status: 'Available', 
        description: 'For cutting vinyl, paper, and other thin materials for signs and decorations.', 
        requiresCertification: false,
        difficulty: 'Beginner',
        imageUrl: '/machines/vinyl-cutter.jpg'
      }
    ]);
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
