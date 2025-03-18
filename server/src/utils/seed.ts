
import { Machine } from '../models/Machine';
import User from '../models/User';
import { Booking } from '../models/Booking';
import dotenv from 'dotenv';

dotenv.config();

export class SeedService {
  static async seedDatabase() {
    try {
      console.log('Starting database seeding process...');

      // Check if data already exists
      const userCount = await User.countDocuments();
      const machineCount = await Machine.countDocuments();
      const bookingCount = await Booking.countDocuments();

      // Get existing machine IDs
      const existingMachines = await Machine.find({}, '_id');
      const existingMachineIds = existingMachines.map(m => m._id);
      
      console.log('Existing machine IDs:', existingMachineIds);
      
      // Define expected machine IDs (1-6)
      const expectedMachineIds = ['1', '2', '3', '4', '5', '6'];
      
      // Check if any expected machine IDs are missing
      const missingMachineIds = expectedMachineIds.filter(id => !existingMachineIds.includes(id));
      
      if (missingMachineIds.length > 0) {
        console.log(`Missing machine IDs: ${missingMachineIds.join(', ')}. Seeding missing machines...`);
        await seedMissingMachines(missingMachineIds);
        
        // After seeding, we need to ensure proper order
        await ensureMachineOrder();
        return;
      }

      if (userCount > 0 && machineCount > 0 && bookingCount > 0) {
        console.log('Database already seeded. All expected machines present. Checking order...');
        // Always check and fix order even if all machines exist
        await ensureMachineOrder();
        return;
      }

      // Clear existing data
      console.log('Clearing existing data...');
      await Machine.deleteMany({});

      if (!process.env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_PASSWORD environment variable is not set');
      }
      
      // Create all machines with consistent IDs and names
      console.log('Creating all machines...');
      await seedAllMachines();
      console.log('Database seeded successfully!');
      
      // Ensure proper order
      await ensureMachineOrder();
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}

// New function to ensure machine order
async function ensureMachineOrder() {
  try {
    console.log('Ensuring machines are in correct order...');
    
    // Get all machines
    const machines = await Machine.find().sort({ _id: 1 }).lean();
    
    // Check if we need to reorder
    let needsReordering = false;
    for (let i = 0; i < machines.length - 1; i++) {
      // Compare numeric values of _id
      if (parseInt(machines[i]._id) > parseInt(machines[i+1]._id)) {
        needsReordering = true;
        break;
      }
    }
    
    if (needsReordering) {
      console.log('Machines need reordering. Reordering...');
      
      // Sort machines by ID
      const sortedMachines = [...machines].sort((a, b) => 
        parseInt(a._id) - parseInt(b._id)
      );
      
      // Delete all machines
      await Machine.deleteMany({});
      
      // Reinsert in correct order
      for (const machine of sortedMachines) {
        // Create a new machine object with only the necessary fields
        const machineData = {
          _id: machine._id.toString(),
          name: machine.name,
          type: machine.type,
          description: machine.description,
          status: machine.status,
          requiresCertification: machine.requiresCertification,
          difficulty: machine.difficulty,
          imageUrl: machine.imageUrl,
          specifications: machine.specifications,
          // Include any other relevant fields
          maintenanceNote: machine.maintenanceNote,
          bookedTimeSlots: machine.bookedTimeSlots || [],
          details: machine.details,
          certificationInstructions: machine.certificationInstructions,
          linkedCourseId: machine.linkedCourseId,
          linkedQuizId: machine.linkedQuizId,
          note: machine.note
        };
        
        // Create a new machine with the filtered data
        const newMachine = new Machine(machineData);
        await newMachine.save();
      }
      
      console.log('Machine reordering complete!');
    } else {
      console.log('Machines are already in correct order.');
    }
  } catch (error) {
    console.error('Error ensuring machine order:', error);
  }
}

// Helper function to seed all machines
async function seedAllMachines() {
  const machines = [
    {
      _id: '1',
      name: 'Laser Cutter',
      type: 'Laser Cutter',
      description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/machines/laser-cutter.jpg',
      specifications: 'Working area: 32" x 20", Power: 120W, Materials: Wood, Acrylic, Paper, Leather',
    },
    {
      _id: '2',
      name: 'Ultimaker',
      type: '3D Printer',
      description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/machines/3d-printer.jpg',
      specifications: 'Build volume: 330 x 240 x 300 mm, Nozzle diameter: 0.4mm, Materials: PLA, ABS, Nylon, TPU',
    },
    {
      _id: '3',
      name: 'X1 E Carbon 3D Printer',
      type: '3D Printer',
      description: 'High-speed multi-material 3D printer with exceptional print quality.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/machines/bambu-printer.jpg',
      specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS',
    },
    {
      _id: '4',
      name: 'Bambu Lab X1 E',
      type: '3D Printer',
      description: 'Next-generation 3D printing technology with advanced features.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Advanced',
      imageUrl: '/machines/cnc-mill.jpg',
      specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 600mm/s, Materials: PLA, PETG, TPU, ABS, PC',
    },
    {
      _id: '5',
      name: 'Safety Cabinet',
      type: 'Safety Equipment',
      description: 'Store hazardous materials safely.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Basic',
      imageUrl: '/machines/safety-cabinet.jpg',
      specifications: 'Capacity: 30 gallons, Fire resistant: 2 hours',
    },
    {
      _id: '6',
      name: 'Safety Course',
      type: 'Certification',
      description: 'Basic safety training for the makerspace.',
      status: 'Available',
      requiresCertification: false,
      difficulty: 'Basic',
      imageUrl: '/machines/safety-course.jpg',
      specifications: 'Duration: 1 hour, Required for all makerspace users',
    },
  ];

  // Insert machines in order
  for (const machine of machines) {
    const newMachine = new Machine(machine);
    await newMachine.save();
    console.log(`Created machine ${machine._id}: ${machine.name}`);
  }
  
  console.log(`Created ${machines.length} machines successfully in specific order`);
  return machines;
}

// Define machine template type
type MachineTemplate = {
  _id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  requiresCertification: boolean;
  difficulty: string;
  imageUrl: string;
  specifications: string;
};

// Define the machine templates record
type MachineTemplates = {
  [key: string]: MachineTemplate;
};

// Helper function to seed only missing machines
async function seedMissingMachines(missingIds: string[]) {
  const machineTemplates: MachineTemplates = {
    '1': {
      _id: '1',
      name: 'Laser Cutter',
      type: 'Laser Cutter',
      description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/machines/laser-cutter.jpg',
      specifications: 'Working area: 32" x 20", Power: 120W, Materials: Wood, Acrylic, Paper, Leather',
    },
    '2': {
      _id: '2',
      name: 'Ultimaker',
      type: '3D Printer',
      description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/machines/3d-printer.jpg',
      specifications: 'Build volume: 330 x 240 x 300 mm, Nozzle diameter: 0.4mm, Materials: PLA, ABS, Nylon, TPU',
    },
    '3': {
      _id: '3',
      name: 'X1 E Carbon 3D Printer',
      type: '3D Printer',
      description: 'High-speed multi-material 3D printer with exceptional print quality.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/machines/bambu-printer.jpg',
      specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS',
    },
    '4': {
      _id: '4',
      name: 'Bambu Lab X1 E',
      type: '3D Printer',
      description: 'Next-generation 3D printing technology with advanced features.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Advanced',
      imageUrl: '/machines/cnc-mill.jpg',
      specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 600mm/s, Materials: PLA, PETG, TPU, ABS, PC',
    },
    '5': {
      _id: '5',
      name: 'Safety Cabinet',
      type: 'Safety Equipment',
      description: 'Store hazardous materials safely.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Basic',
      imageUrl: '/machines/safety-cabinet.jpg',
      specifications: 'Capacity: 30 gallons, Fire resistant: 2 hours',
    },
    '6': {
      _id: '6',
      name: 'Safety Course',
      type: 'Certification',
      description: 'Basic safety training for the makerspace.',
      status: 'Available',
      requiresCertification: false,
      difficulty: 'Basic',
      imageUrl: '/machines/safety-course.jpg',
      specifications: 'Duration: 1 hour, Required for all makerspace users',
    },
  };
  
  // Sort missing IDs numerically to ensure proper order
  const sortedMissingIds = [...missingIds].sort((a, b) => parseInt(a) - parseInt(b));
  console.log(`Adding missing machines in order: ${sortedMissingIds.join(', ')}`);
  
  const missingMachines = sortedMissingIds.map(id => machineTemplates[id]);
  
  try {
    // Add each machine individually in sorted order
    for (const machine of missingMachines) {
      const newMachine = new Machine(machine);
      await newMachine.save();
      console.log(`Created missing machine: ${machine.name} (ID: ${machine._id})`);
    }
    
    console.log(`Added ${missingMachines.length} missing machines in order`);
    return missingMachines;
  } catch (err) {
    console.error('Error creating missing machines:', err);
    
    // Try one by one if bulk insert fails
    console.log('Attempting to create machines one by one...');
    const results = [];
    
    for (const id of sortedMissingIds) {
      try {
        const machine = new Machine(machineTemplates[id]);
        await machine.save();
        results.push(machine);
        console.log(`Created machine: ${id}`);
      } catch (singleErr) {
        console.error(`Failed to create machine ${id}:`, singleErr);
      }
    }
    
    return results;
  }
}
