
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Machine } from '../models/Machine';
import User from '../models/User';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
export const getMachines = asyncHandler(async (req: Request, res: Response) => {
  const machines = await Machine.find({});
  res.json(machines);
});

// @desc    Get machine by ID
// @route   GET /api/machines/:id
// @access  Public
export const getMachineById = asyncHandler(async (req: Request, res: Response) => {
  const machine = await Machine.findById(req.params.id);
  
  if (machine) {
    res.json(machine);
  } else {
    res.status(404);
    throw new Error('Machine not found');
  }
});

// @desc    Update machine
// @route   PUT /api/machines/:id
// @access  Private/Admin
export const updateMachine = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, description, status, requiresCertification, difficulty, imageUrl, specifications } = req.body;
  
  const machine = await Machine.findById(req.params.id);
  
  if (!machine) {
    res.status(404);
    throw new Error('Machine not found');
  }
  
  // Update machine properties
  machine.name = name || machine.name;
  machine.type = type || machine.type;
  machine.description = description || machine.description;
  machine.status = status || machine.status;
  
  if (requiresCertification !== undefined) {
    machine.requiresCertification = requiresCertification;
  }
  
  if (difficulty !== undefined) {
    machine.difficulty = difficulty;
  }
  
  if (imageUrl !== undefined) {
    machine.imageUrl = imageUrl;
  }
  
  if (specifications !== undefined) {
    machine.specifications = specifications;
  }
  
  const updatedMachine = await machine.save();
  
  res.json({
    success: true,
    machine: updatedMachine
  });
});

// @desc    Delete machine
// @route   DELETE /api/machines/:id
// @access  Private/Admin
export const deleteMachine = asyncHandler(async (req: Request, res: Response) => {
  const machine = await Machine.findById(req.params.id);
  
  if (!machine) {
    res.status(404);
    throw new Error('Machine not found');
  }
  
  await Machine.deleteOne({ _id: req.params.id });
  
  res.json({
    success: true,
    message: 'Machine removed'
  });
});

// @desc    Update machine status
// @route   PUT /api/machines/:id/status
// @access  Private/Admin
export const updateMachineStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, maintenanceNote } = req.body;
  const user = req.user as any; // Type as any to avoid the IUser import issue
  
  console.log(`Attempting to update machine ${req.params.id} status to ${status} by user ${user?.name || 'unknown'}`);
  
  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }
  
  const machine = await Machine.findById(req.params.id);
  
  if (!machine) {
    res.status(404);
    throw new Error('Machine not found');
  }
  
  // Update machine status and note
  machine.status = status;
  
  // Only set maintenance note if provided and status is maintenance
  // Otherwise, clear the maintenance note if status is not maintenance
  if (status === 'maintenance' && maintenanceNote) {
    machine.maintenanceNote = maintenanceNote;
  } else if (status !== 'maintenance') {
    // Clear maintenance note when changing from maintenance to available
    machine.maintenanceNote = undefined;
  }
  
  const updatedMachine = await machine.save();
  console.log(`Machine ${req.params.id} updated: status=${updatedMachine.status}, note=${updatedMachine.maintenanceNote || 'none'}`);
  
  res.json({
    success: true,
    machine: updatedMachine
  });
});

// @desc    Check if all machines exist and seed if needed
// @access  Internal
export const checkAndSeedMachines = async () => {
  console.log('Checking machines in database...');
  
  // Define the required machines with their IDs (1-6)
  const requiredMachines = [
    {
      _id: "1",
      name: "Laser Cutter",
      type: "Laser Cutter",
      description: "Professional grade 120W CO2 laser cutter for precision cutting and engraving.",
      status: "available",
      requiresCertification: true,
      bookedTimeSlots: [],
      difficulty: "Intermediate",
      imageUrl: "/machines/laser-cutter.jpg",
      specifications: "Working area: 32\" x 20\", Power: 120W, Materials: Wood, Acrylic, Paper, Leather"
    },
    {
      _id: "2",
      name: "Ultimaker",
      type: "3D Printer",
      description: "High-precision 3D printer for detailed models and prototypes.",
      status: "available",
      requiresCertification: true,
      bookedTimeSlots: [],
      difficulty: "Beginner",
      imageUrl: "/machines/ultimaker.jpg",
      specifications: "Build volume: 215 x 215 x 200 mm, Layer resolution: 20 microns, Materials: PLA, ABS, Nylon, TPU"
    },
    {
      _id: "3",
      name: "X1 E Carbon 3D Printer",
      type: "3D Printer",
      description: "High-speed multi-material 3D printer with exceptional print quality.",
      status: "available",
      requiresCertification: true,
      bookedTimeSlots: [],
      difficulty: "Intermediate",
      imageUrl: "/machines/bambu-printer.jpg",
      specifications: "Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS"
    },
    {
      _id: "4",
      name: "Bambu Lab X1 E",
      type: "3D Printer",
      description: "Next-generation 3D printing technology with advanced features.",
      status: "available",
      requiresCertification: true,
      bookedTimeSlots: [],
      difficulty: "Advanced",
      imageUrl: "/machines/cnc-mill.jpg",
      specifications: "Build volume: 256 x 256 x 256 mm, Max Speed: 600mm/s, Materials: PLA, PETG, TPU, ABS, PC"
    },
    {
      _id: "5",
      name: "Safety Cabinet",
      type: "Safety Equipment",
      description: "Store hazardous materials safely.",
      status: "available",
      requiresCertification: true,
      bookedTimeSlots: [],
      difficulty: "Basic",
      imageUrl: "/machines/safety-cabinet.jpg",
      specifications: "Capacity: 30 gallons, Fire resistant: 2 hours"
    },
    {
      _id: "6",
      name: "Safety Course",
      type: "Certification",
      description: "Basic safety training for the makerspace.",
      status: "available",
      requiresCertification: false,
      bookedTimeSlots: [],
      difficulty: "Basic",
      imageUrl: "/machines/safety-course.jpg",
      specifications: "Duration: 1 hour, Required for all makerspace users"
    }
  ];
  
  // Check for each required machine
  for (const requiredMachine of requiredMachines) {
    const machineExists = await Machine.findById(requiredMachine._id);
    
    if (!machineExists) {
      console.log(`Machine ${requiredMachine._id} (${requiredMachine.name}) not found, creating it...`);
      try {
        await Machine.create(requiredMachine);
        console.log(`Machine ${requiredMachine._id} (${requiredMachine.name}) created successfully`);
      } catch (error) {
        console.error(`Error creating machine ${requiredMachine._id}:`, error);
      }
    } else {
      console.log(`Machine ${requiredMachine._id} (${machineExists.name}) already exists`);
    }
  }
  
  // Count total machines to verify
  const totalMachines = await Machine.countDocuments();
  console.log(`Total machines in database: ${totalMachines}`);
};
