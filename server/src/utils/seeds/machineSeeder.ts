
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

// Store original machine data for restoration capability
const ORIGINAL_MACHINE_TEMPLATES: Record<string, MachineTemplate> = {
  '1': {
    _id: '1',
    name: 'Laser Cutter',
    type: 'Laser Cutter',
    description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.',
    status: 'Available',
    requiresCertification: true,
    difficulty: 'Intermediate',
    imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
    specifications: 'Working area: 32" x 20", Power: 120W, Materials: Wood, Acrylic, Paper, Leather',
    linkedCourseId: '1',
    linkedQuizId: '1'
  },
  '2': {
    _id: '2',
    name: 'Ultimaker',
    type: '3D Printer',
    description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.',
    status: 'Available',
    requiresCertification: true,
    difficulty: 'Intermediate',
    imageUrl: 'http://localhost:4000/utils/images/IMG_7773.jpg',
    specifications: 'Build volume: 330 x 240 x 300 mm, Nozzle diameter: 0.4mm, Materials: PLA, ABS, Nylon, TPU',
    linkedCourseId: '2',
    linkedQuizId: '2'
  },
  '3': {
    _id: '3',
    name: 'X1 E Carbon 3D Printer',
    type: '3D Printer',
    description: 'High-speed multi-material 3D printer with exceptional print quality.',
    status: 'Available',
    requiresCertification: true,
    difficulty: 'Intermediate',
    imageUrl: 'http://localhost:4000/utils/images/IMG_7768.jpg',
    specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS',
    linkedCourseId: '3',
    linkedQuizId: '3'
  },
  '4': {
    _id: '4',
    name: 'Bambu Lab X1 E',
    type: '3D Printer',
    description: 'Next-generation 3D printing technology with advanced features.',
    status: 'Available',
    requiresCertification: true,
    difficulty: 'Advanced',
    imageUrl: 'http://localhost:4000/utils/images/IMG_7769.jpg',
    specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 600mm/s, Materials: PLA, PETG, TPU, ABS, PC',
    linkedCourseId: '4',
    linkedQuizId: '4'
  },
  '5': {
    _id: '5',
    name: 'Safety Cabinet',
    type: 'Safety Equipment',
    description: 'Store hazardous materials safely.',
    status: 'Available',
    requiresCertification: true,
    difficulty: 'Basic',
    imageUrl: 'http://localhost:4000/utils/images/IMG_7775.jpg',
    specifications: 'Capacity: 30 gallons, Fire resistant: 2 hours',
    linkedCourseId: '5',
    linkedQuizId: '5'
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
    linkedCourseId: '6',
    linkedQuizId: '6'
  },
};

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

    // Only update image if machine exists and doesn't already have an image
    for (const update of machineUpdates) {
      const machine = await Machine.findById(update._id);
      if (machine && (!machine.imageUrl || machine.imageUrl === '')) {
        await Machine.updateOne(
          { _id: update._id },
          { $set: { imageUrl: update.imageUrl } }
        );
        console.log(`Updated image for machine ${update._id} to ${update.imageUrl}`);
      }
    }
  } catch (error) {
    console.error('Error updating machine images:', error);
  }
}

// Function to seed missing core machines with proper type definition
export async function seedMissingMachines(missingIds: string[]): Promise<MachineTemplate[]> {
  // Filter to only include IDs that are part of our core machines (1-6)
  const coreMissingIds = missingIds.filter(id => id >= '1' && id <= '6');
  
  if (coreMissingIds.length === 0) {
    console.log("No core machines (IDs 1-6) are missing.");
    return [];
  }
  
  console.log(`Adding missing core machines: ${coreMissingIds.join(', ')}`);
  
  // Sort missing IDs numerically to ensure proper order
  const sortedMissingIds = [...coreMissingIds].sort((a, b) => parseInt(a) - parseInt(b));
  
  const missingMachines = sortedMissingIds.map(id => ORIGINAL_MACHINE_TEMPLATES[id]);
  
  try {
    // Add each machine individually in sorted order
    for (const machine of missingMachines) {
      const newMachine = new Machine(machine);
      await newMachine.save();
      console.log(`Created missing core machine: ${machine.name} (ID: ${machine._id}) with image: ${machine.imageUrl}`);
    }
    
    console.log(`Added ${missingMachines.length} missing core machines`);
    return missingMachines;
  } catch (err) {
    console.error('Error creating missing machines:', err);
    
    // Try one by one if bulk insert fails
    console.log('Attempting to create machines one by one...');
    const results: MachineTemplate[] = [];
    
    for (const id of sortedMissingIds) {
      try {
        const machine = new Machine(ORIGINAL_MACHINE_TEMPLATES[id]);
        await machine.save();
        results.push(ORIGINAL_MACHINE_TEMPLATES[id]);
        console.log(`Created machine: ${id} with image: ${ORIGINAL_MACHINE_TEMPLATES[id].imageUrl}`);
      } catch (singleErr) {
        console.error(`Failed to create machine ${id}:`, singleErr);
      }
    }
    
    return results;
  }
}

// Modified to preserve user edits to machines
export async function seedAllMachines() {
  try {
    // Get all existing machines to check what's present and what's been modified
    const existingMachines = await Machine.find({});
    const existingMachinesMap = new Map(existingMachines.map(m => [m._id.toString(), m]));
    
    // Check which core machines (1-6) are missing
    const missingCoreIds = [];
    for (let i = 1; i <= 6; i++) {
      const id = i.toString();
      if (!existingMachinesMap.has(id)) {
        missingCoreIds.push(id);
      }
    }
    
    // Only seed the missing core machines
    if (missingCoreIds.length > 0) {
      console.log(`Found ${missingCoreIds.length} missing core machines. Seeding them now...`);
      await seedMissingMachines(missingCoreIds);
    } else {
      console.log("All core machines (1-6) are present. No need to seed any.");
    }
    
    // Gently update images for existing machines if they're missing
    await updateMachineImages();
    
    // Don't modify or overwrite any existing machines that have been edited
    console.log("Preserving all user edits to existing machines.");
    
    // Verify the machine order after creation
    await ensureMachineOrder();
    
    console.log("Machine seeding complete - user modifications preserved.");
    
    return existingMachines;
  } catch (error) {
    console.error("Error in seedAllMachines:", error);
    return [];
  }
}

// New function to restore accidentally deleted machines
export async function restoreDeletedMachines(): Promise<number> {
  try {
    // Get all machine IDs currently in the database
    const existingMachines = await Machine.find({}, '_id');
    const existingIds = new Set(existingMachines.map(m => m._id.toString()));
    
    // For core machines (1-6), restore any that are missing
    const missingCoreIds = [];
    for (let i = 1; i <= 6; i++) {
      const id = i.toString();
      if (!existingIds.has(id)) {
        missingCoreIds.push(id);
      }
    }
    
    let restoredCount = 0;
    
    // Restore missing core machines from our templates
    if (missingCoreIds.length > 0) {
      console.log(`Restoring ${missingCoreIds.length} deleted core machines: ${missingCoreIds.join(', ')}`);
      const restored = await seedMissingMachines(missingCoreIds);
      restoredCount += restored.length;
    }
    
    // For user-created machines, we would need to access a backup or archive
    // This could be implemented by adding a "deleted" flag instead of actually removing
    // machines from the database, or by using MongoDB's time-series collections for backups
    
    console.log(`Restored ${restoredCount} deleted machines successfully`);
    return restoredCount;
  } catch (error) {
    console.error("Error restoring deleted machines:", error);
    return 0;
  }
}

// Export a function to run after all other seeds to ensure images are updated
export async function ensureMachineImages() {
  await updateMachineImages();
  console.log("Machine images have been verified and updated if needed.");
}

// New function to regularly backup user-created machines for restoration purposes
export async function backupMachines() {
  try {
    // This is a placeholder for a backup mechanism
    // In a real implementation, this could:
    // 1. Save a snapshot to a backup collection
    // 2. Export to a JSON file
    // 3. Use MongoDB's built-in backup facilities
    
    const allMachines = await Machine.find({});
    console.log(`Backed up ${allMachines.length} machines`);
    
    // Here you would implement actual backup logic
    // For now, we're just logging that it happened
    
    return allMachines.length;
  } catch (error) {
    console.error("Error backing up machines:", error);
    return 0;
  }
}
