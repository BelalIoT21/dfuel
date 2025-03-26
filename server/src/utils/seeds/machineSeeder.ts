
import { Machine } from '../../models/Machine';
import { ensureMachineOrder } from './seedHelpers';

// Define machine template type for strong typing
export interface MachineTemplate {
  _id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  requiresCertification: boolean;
  difficulty: string;
  imageUrl: string;
  bookedTimeSlots?: any[];
  specifications?: string;
  linkedCourseId: string;  // Changed to required
  linkedQuizId: string;    // Changed to required
  maintenanceNote?: string;
}

// Function to update machine images
export async function updateMachineImages() {
  try {
    const machineUpdates = [
      {
        _id: '1',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg'
      },
      {
        _id: '2',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7773.jpg'
      },
      {
        _id: '3',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7768.jpg'
      },
      {
        _id: '4',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7769.jpg'
      },
      {
        _id: '5',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7775.jpg'
      },
      {
        _id: '6',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg'
      }
    ];

    for (const update of machineUpdates) {
      await Machine.updateOne(
        { _id: update._id },
        { $set: { imageUrl: update.imageUrl } }
      );
      console.log(`Updated image for machine ${update._id} to ${update.imageUrl}`);
    }
  } catch (error) {
    console.error('Error updating machine images:', error);
  }
}

// Function to seed missing machines with proper type definition
export async function seedMissingMachines(missingIds: string[]): Promise<MachineTemplate[]> {
  // Define machine templates with the new image URLs and ensure all have course and quiz IDs
  const machineTemplates: Record<string, MachineTemplate> = {
    '1': {
      _id: '1',
      name: 'Laser Cutter',
      type: 'Laser Cutter',
      description: 'Precision laser cutting machine for detailed work on various materials.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Advanced',
      imageUrl: '/utils/images/IMG_7814.jpg',
      bookedTimeSlots: [],
      linkedCourseId: '1',  // Added course ID
      linkedQuizId: '1'     // Added quiz ID
    },
    '2': {
      _id: '2',
      name: 'Ultimaker',
      type: '3D Printer',
      description: 'FDM 3D printing for rapid prototyping and model creation.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/utils/images/IMG_7773.jpg',
      bookedTimeSlots: [],
      linkedCourseId: '2',  // Added course ID
      linkedQuizId: '2'     // Added quiz ID
    },
    '3': {
      _id: '3',
      name: 'X1 E Carbon 3D Printer',
      type: '3D Printer',
      description: 'Carbon fiber 3D printer for high-strength parts.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Advanced',
      imageUrl: '/utils/images/IMG_7768.jpg',
      bookedTimeSlots: [],
      linkedCourseId: '3',  // Added course ID
      linkedQuizId: '3'     // Added quiz ID
    },
    '4': {
      _id: '4',
      name: 'Bambu Lab X1 E',
      type: '3D Printer',
      description: 'Next-generation 3D printing technology with advanced features.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/utils/images/IMG_7769.jpg',
      specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS, PC',
      linkedCourseId: '4',  // Added course ID
      linkedQuizId: '4'     // Added quiz ID
    },
    '5': {
      _id: '5',
      name: 'Safety Cabinet',
      type: 'Safety Equipment',
      description: 'Store hazardous materials safely.',
      status: 'Available',
      requiresCertification: false,
      difficulty: 'Basic',
      imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
      specifications: 'Capacity: 30 gallons, Fire resistant: 2 hours',
      linkedCourseId: '5',  // Added course ID
      linkedQuizId: '5'     // Added quiz ID
    },
    '6': {
      _id: '6',
      name: 'Safety Course',
      type: 'Certification',
      description: 'Basic safety training for the makerspace.',
      status: 'Available',
      requiresCertification: false,
      difficulty: 'Basic',
      imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
      specifications: 'Duration: 1 hour, Required for all makerspace users',
      linkedCourseId: '6',  // Added course ID
      linkedQuizId: '6'     // Added quiz ID
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
      console.log(`Created missing machine: ${machine.name} (ID: ${machine._id}) with image: ${machine.imageUrl}`);
    }
    
    console.log(`Added ${missingMachines.length} missing machines in order`);
    return missingMachines;
  } catch (err) {
    console.error('Error creating missing machines:', err);
    
    // Try one by one if bulk insert fails
    console.log('Attempting to create machines one by one...');
    const results: MachineTemplate[] = [];
    
    for (const id of sortedMissingIds) {
      try {
        const machine = new Machine(machineTemplates[id]);
        await machine.save();
        results.push(machineTemplates[id]);
        console.log(`Created machine: ${id} with image: ${machineTemplates[id].imageUrl}`);
      } catch (singleErr) {
        console.error(`Failed to create machine ${id}:`, singleErr);
      }
    }
    
    return results;
  }
}

// Helper function to seed all machines
export async function seedAllMachines() {
  const machines = [
    {
      _id: '1',
      name: 'Laser Cutter',
      type: 'Laser Cutter',
      description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
      specifications: 'Working area: 32" x 20", Power: 120W, Materials: Wood, Acrylic, Paper, Leather',
      linkedCourseId: '1',  // Added course ID
      linkedQuizId: '1'     // Added quiz ID
    },
    {
      _id: '2',
      name: 'Ultimaker',
      type: '3D Printer',
      description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: 'http://localhost:4000/utils/images/IMG_7773.jpg',
      specifications: 'Build volume: 330 x 240 x 300 mm, Nozzle diameter: 0.4mm, Materials: PLA, ABS, Nylon, TPU',
      linkedCourseId: '2',  // Added course ID
      linkedQuizId: '2'     // Added quiz ID
    },
    {
      _id: '3',
      name: 'X1 E Carbon 3D Printer',
      type: '3D Printer',
      description: 'High-speed multi-material 3D printer with exceptional print quality.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: 'http://localhost:4000/utils/images/IMG_7768.jpg',
      specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS',
      linkedCourseId: '3',  // Added course ID
      linkedQuizId: '3'     // Added quiz ID
    },
    {
      _id: '4',
      name: 'Bambu Lab X1 E',
      type: '3D Printer',
      description: 'Next-generation 3D printing technology with advanced features.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Advanced',
      imageUrl: 'http://localhost:4000/utils/images/IMG_7769.jpg',
      specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 600mm/s, Materials: PLA, PETG, TPU, ABS, PC',
      linkedCourseId: '4',  // Added course ID
      linkedQuizId: '4'     // Added quiz ID
    },
    {
      _id: '5',
      name: 'Safety Cabinet',
      type: 'Safety Equipment',
      description: 'Store hazardous materials safely.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Basic',
      imageUrl: 'http://localhost:4000/utils/images/IMG_7775.jpg',
      specifications: 'Capacity: 30 gallons, Fire resistant: 2 hours',
      linkedCourseId: '5',  // Added course ID
      linkedQuizId: '5'     // Added quiz ID
    },
    {
      _id: '6',
      name: 'Safety Course',
      type: 'Certification',
      description: 'Basic safety training for the makerspace.',
      status: 'Available',
      requiresCertification: false,
      difficulty: 'Basic',
      imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
      specifications: 'Duration: 1 hour, Required for all makerspace users',
      linkedCourseId: '6',  // Added course ID
      linkedQuizId: '6'     // Added quiz ID
    },
  ];

  // Sort machines by ID to ensure proper insertion order
  machines.sort((a, b) => parseInt(a._id) - parseInt(b._id));
  
  // Insert machines in order
  for (const machine of machines) {
    try {
      const existingMachine = await Machine.findById(machine._id);
      if (existingMachine) {
        // Update the existing machine's image URL if needed
        if (existingMachine.imageUrl !== machine.imageUrl) {
          existingMachine.imageUrl = machine.imageUrl;
          await existingMachine.save();
          console.log(`Updated machine ${machine._id} image to: ${machine.imageUrl}`);
        } else {
          console.log(`Machine ${machine._id} already exists with correct image.`);
        }
      } else {
        // Create new machine
        const newMachine = new Machine(machine);
        await newMachine.save();
        console.log(`Created machine ${machine._id}: ${machine.name} with image: ${machine.imageUrl}`);
      }
    } catch (error) {
      console.error(`Error processing machine ${machine._id}:`, error);
    }
  }
  
  // Verify the machine order after creation
  const verifyMachines = await Machine.find({}, '_id imageUrl').sort({ _id: 1 });
  const verifyIds = verifyMachines.map(m => `${m._id} (${m.imageUrl})`);
  console.log(`Created/Updated ${machines.length} machines successfully:`, verifyIds);
  
  return machines;
}

// Export a function to run after all other seeds to ensure images are updated
export async function ensureMachineImages() {
  await updateMachineImages();
  console.log("Machine images have been verified and updated if needed.");
}
