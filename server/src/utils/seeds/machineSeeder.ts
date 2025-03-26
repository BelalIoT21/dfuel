
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
  linkedCourseId?: string;
  linkedQuizId?: string;
  maintenanceNote?: string;
}

// Function to update machine images
export async function updateMachineImages() {
  try {
    const machineUpdates = [
      {
        _id: '1',
        imageUrl: '/lovable-uploads/81c40f5d-e4d4-42ef-8262-0467a8fb48c3.png'
      },
      {
        _id: '2',
        imageUrl: '/lovable-uploads/82f38bc9-30e8-4f58-9ad4-93d158cacf88.png'
      },
      {
        _id: '3',
        imageUrl: '/lovable-uploads/381a5202-3287-46e3-9eda-f836609b10ac.png'
      }
    ];

    for (const update of machineUpdates) {
      await Machine.updateOne(
        { _id: update._id },
        { $set: { imageUrl: update.imageUrl } }
      );
      console.log(`Updated image for machine ${update._id}`);
    }
  } catch (error) {
    console.error('Error updating machine images:', error);
  }
}

// Function to seed missing machines with proper type definition
export async function seedMissingMachines(missingIds: string[]): Promise<MachineTemplate[]> {
  // Define machine templates with the new image URLs
  const machineTemplates: Record<string, MachineTemplate> = {
    '1': {
      _id: '1',
      name: 'Laser Cutter',
      type: 'Laser Cutter',
      description: 'Precision laser cutting machine for detailed work on various materials.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Advanced',
      imageUrl: '/lovable-uploads/81c40f5d-e4d4-42ef-8262-0467a8fb48c3.png',
      bookedTimeSlots: []
    },
    '2': {
      _id: '2',
      name: 'Ultimaker',
      type: '3D Printer',
      description: 'FDM 3D printing for rapid prototyping and model creation.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/lovable-uploads/82f38bc9-30e8-4f58-9ad4-93d158cacf88.png',
      bookedTimeSlots: []
    },
    '3': {
      _id: '3',
      name: 'X1 E Carbon 3D Printer',
      type: '3D Printer',
      description: 'Carbon fiber 3D printer for high-strength parts.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Advanced',
      imageUrl: '/lovable-uploads/381a5202-3287-46e3-9eda-f836609b10ac.png',
      bookedTimeSlots: []
    },
    '4': {
      _id: '4',
      name: 'Bambu Lab X1 E',
      type: '3D Printer',
      description: 'Next-generation 3D printing technology with advanced features.',
      status: 'Available',
      requiresCertification: true,
      difficulty: 'Intermediate',
      imageUrl: '/machines/bambu-lab.jpg',
      specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS, PC',
      linkedCourseId: '4',
      linkedQuizId: '4'
    },
    '5': {
      _id: '5',
      name: 'Safety Cabinet',
      type: 'Safety Equipment',
      description: 'Store hazardous materials safely.',
      status: 'Available',
      requiresCertification: false,
      difficulty: 'Basic',
      imageUrl: '/machines/safety-cabinet.jpg',
      specifications: 'Capacity: 30 gallons, Fire resistant: 2 hours'
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
      specifications: 'Duration: 1 hour, Required for all makerspace users'
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
    const results: MachineTemplate[] = [];
    
    for (const id of sortedMissingIds) {
      try {
        const machine = new Machine(machineTemplates[id]);
        await machine.save();
        results.push(machineTemplates[id]);
        console.log(`Created machine: ${id}`);
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
      imageUrl: '/lovable-uploads/81c40f5d-e4d4-42ef-8262-0467a8fb48c3.png',
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
      imageUrl: '/lovable-uploads/82f38bc9-30e8-4f58-9ad4-93d158cacf88.png',
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
      imageUrl: '/lovable-uploads/381a5202-3287-46e3-9eda-f836609b10ac.png',
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
      imageUrl: '/machines/bambu-lab.jpg',
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

  // Sort machines by ID to ensure proper insertion order
  machines.sort((a, b) => parseInt(a._id) - parseInt(b._id));
  
  // Insert machines in order
  for (const machine of machines) {
    const newMachine = new Machine(machine);
    await newMachine.save();
    console.log(`Created machine ${machine._id}: ${machine.name}`);
  }
  
  // Verify the machine order after creation
  const verifyMachines = await Machine.find({}, '_id').sort({ _id: 1 });
  const verifyIds = verifyMachines.map(m => m._id);
  console.log(`Created ${machines.length} machines successfully in order:`, verifyIds);
  
  return machines;
}
