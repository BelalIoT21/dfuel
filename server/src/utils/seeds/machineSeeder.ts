
import { Machine } from '../../models/Machine';
import { ensureMachineOrder } from './seedHelpers';
import { getImageUrl } from './imageUtils';

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
    imageUrl: getImageUrl('IMG_7814.jpg'),
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
    imageUrl: getImageUrl('IMG_7773.jpg'),
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
    imageUrl: getImageUrl('IMG_7768.jpg'),
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
    imageUrl: getImageUrl('IMG_7769.jpg'),
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
    imageUrl: getImageUrl('IMG_7775.jpg'),
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
    imageUrl: getImageUrl('IMG_7821.jpg'),
    specifications: 'Duration: 1 hour, Required for all makerspace users',
    linkedCourseId: '6',
    linkedQuizId: '6'
  },
};


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
        // Check if this machine was permanently deleted
        const deletedMachine = await Machine.findOne({ 
          _id: id, 
          permanentlyDeleted: true 
        });
        
        // Only add to missing list if it wasn't permanently deleted
        if (!deletedMachine) {
          missingCoreIds.push(id);
        } else {
          console.log(`Machine ${id} was permanently deleted - not restoring`);
        }
      }
    }
    
    // First check for soft-deleted machines to restore
    console.log("Checking for soft-deleted core machines to restore...");
    const softDeletedCount = await restoreSoftDeletedCoreMachines();
    if (softDeletedCount > 0) {
      console.log(`Restored ${softDeletedCount} soft-deleted core machines`);
    }
    
    // Only seed the remaining missing core machines
    if (missingCoreIds.length > 0) {
      console.log(`Found ${missingCoreIds.length} missing core machines. Seeding them now...`);
      await seedMissingMachines(missingCoreIds);
    } else {
      console.log("All non-deleted core machines (1-6) are present. No need to seed any.");
    }
    
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

// New function to specifically restore soft-deleted core machines with their latest changes
async function restoreSoftDeletedCoreMachines(): Promise<number> {
  try {
    // Find core machines (1-6) that are soft-deleted but not permanently deleted
    const softDeletedCoreMachines = await Machine.find({
      _id: { $in: ['1', '2', '3', '4', '5', '6'] },
      deletedAt: { $exists: true, $ne: null },
      permanentlyDeleted: { $ne: true }
    });
    
    console.log(`Found ${softDeletedCoreMachines.length} soft-deleted core machines to restore`);
    
    let restoredCount = 0;
    
    for (const machine of softDeletedCoreMachines) {
      // Restore the machine by clearing the deletedAt field
      // but preserve all other properties/changes
      machine.deletedAt = undefined;
      machine.status = 'Available';
      machine.maintenanceNote = '';
      
      await machine.save();
      console.log(`Restored soft-deleted core machine ${machine._id} with all previous modifications`);
      restoredCount++;
    }
    
    return restoredCount;
  } catch (error) {
    console.error("Error restoring soft-deleted core machines:", error);
    return 0;
  }
}

// Updated function to restore accidentally deleted machines
export async function restoreDeletedMachines(permanentlyDeletedIds: string[] = []): Promise<number> {
  try {
    console.log("Starting restoreDeletedMachines with excluded IDs:", permanentlyDeletedIds);
    
    // First restore any soft-deleted core machines
    const softDeletedCount = await restoreSoftDeletedCoreMachines();
    
    // Get all machine IDs currently in the database
    const existingMachines = await Machine.find({}, '_id');
    const existingIds = new Set(existingMachines.map(m => m._id.toString()));
    
    // For core machines (1-6) that are still missing, recreate them if not permanently deleted
    const missingCoreIds = [];
    for (let i = 1; i <= 6; i++) {
      const id = i.toString();
      
      // Skip if machine exists or is permanently deleted
      if (existingIds.has(id) || permanentlyDeletedIds.includes(id)) {
        continue;
      }
      
      // Check if this ID was permanently deleted
      const permanentlyDeleted = await Machine.findOne({ 
        _id: id, 
        permanentlyDeleted: true 
      });
      
      if (!permanentlyDeleted) {
        missingCoreIds.push(id);
      } else {
        console.log(`Machine ${id} was permanently deleted - not restoring`);
      }
    }
    
    // Restore missing core machines that aren't permanently deleted
    let recreatedCount = 0;
    if (missingCoreIds.length > 0) {
      console.log(`Restoring ${missingCoreIds.length} missing core machines: ${missingCoreIds.join(', ')}`);
      const restored = await seedMissingMachines(missingCoreIds);
      recreatedCount = restored.length;
    }
    
    const totalRestored = softDeletedCount + recreatedCount;
    console.log(`Restored ${totalRestored} deleted machines successfully (${softDeletedCount} soft-deleted, ${recreatedCount} recreated)`);
    return totalRestored;
  } catch (error) {
    console.error("Error restoring deleted machines:", error);
    return 0;
  }
}

// New function to regularly backup user-created machines for restoration purposes
export async function backupMachines() {
  try {
    const allMachines = await Machine.find({});
    let backupCount = 0;
    
    for (const machine of allMachines) {
      // Create backup data with timestamp if it doesn't exist
      if (!machine.backupData) {
        const backupData = {
          ...machine.toObject(),
          _backupTime: new Date().toISOString()
        };
        
        // Store backup as JSON string
        await Machine.findByIdAndUpdate(machine._id, {
          backupData: JSON.stringify(backupData)
        });
        
        backupCount++;
      }
    }
    
    console.log(`Backed up ${backupCount} machines that didn't have backups`);
    return backupCount;
  } catch (error) {
    console.error("Error backing up machines:", error);
    return 0;
  }
}

// Add the missing ensureMachineImages function that was referenced in seeds/index.ts
export async function ensureMachineImages() {
  try {
    console.log('Ensuring machine images are up to date...');
    
    // Get all existing machines
    const machines = await Machine.find({});
    let updatedCount = 0;
    
    // Define the image URLs for core machines
    const coreImageUrls: Record<string, string> = {
      '1': getImageUrl('IMG_7814.jpg'), // Laser Cutter
      '2': getImageUrl('IMG_7773.jpg'), // Ultimaker
      '3': getImageUrl('IMG_7768.jpg'), // X1 E Carbon 3D Printer
      '4': getImageUrl('IMG_7769.jpg'), // Bambu Lab X1 E
      '5': getImageUrl('IMG_7775.jpg'), // Safety Cabinet
      '6': getImageUrl('IMG_7821.jpg'), // Safety Course
    };
    
    // Update each machine if needed
    for (const machine of machines) {
      const machineId = machine._id.toString();
      
      // Only update core machines (IDs 1-6)
      if (machineId >= '1' && machineId <= '6') {
        const expectedImageUrl = coreImageUrls[machineId];
        
        // Update if image URL is missing or different
        if (!machine.imageUrl || machine.imageUrl !== expectedImageUrl) {
          console.log(`Updating image for machine ${machineId} (${machine.name})`);
          machine.imageUrl = expectedImageUrl;
          await machine.save();
          updatedCount++;
        }
      }
    }
    
    console.log(`Updated images for ${updatedCount} machines`);
    return updatedCount;
  } catch (error) {
    console.error('Error ensuring machine images:', error);
    return 0;
  }
}
