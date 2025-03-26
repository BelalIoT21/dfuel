
import { Machine } from '../models/Machine';
import User from '../models/User';
import { Booking } from '../models/Booking';
import { Course } from '../models/Course';
import { Quiz } from '../models/Quiz';
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
      const courseCount = await Course.countDocuments();
      const quizCount = await Quiz.countDocuments();

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
      } else {
        // Update images even if machines exist
        console.log('Updating machine images...');
        await updateMachineImages();
      }

      // Check if we need to seed courses
      if (courseCount === 0) {
        console.log('No courses found. Seeding courses...');
        await seedCourses();
      } else {
        // Update course images even if courses exist
        console.log('Updating course images...');
        await updateCourseImages();
      }

      // Check if we need to seed quizzes
      if (quizCount === 0) {
        console.log('No quizzes found. Seeding quizzes...');
        await seedQuizzes();
      }

      if (userCount > 0 && machineCount > 0 && bookingCount > 0 && courseCount > 0 && quizCount > 0) {
        console.log('Database already seeded. All expected entities present. Checking order...');
        // Always check and fix order even if all machines exist
        await ensureMachineOrder();
        return;
      }

      // If we reach here, something may be missing, ensure it's created
      console.log('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}

// New function to update machine images
async function updateMachineImages() {
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

// Define machine template type for strong typing
interface MachineTemplate {
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

// Function to seed missing machines with proper type definition
async function seedMissingMachines(missingIds: string[]): Promise<MachineTemplate[]> {
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

// Helper function to ensure machine order
async function ensureMachineOrder() {
  try {
    console.log('Ensuring machines are in correct order...');
    
    // Get all machines
    const machines = await Machine.find().lean();
    
    // Check if machines are sorted by numeric ID
    let machinesSorted = [...machines].sort((a, b) => 
      parseInt(a._id) - parseInt(b._id)
    );
    
    // Check if the current order matches the sorted order
    let needsReordering = false;
    for (let i = 0; i < machines.length; i++) {
      if (machines[i]._id !== machinesSorted[i]._id) {
        needsReordering = true;
        break;
      }
    }
    
    // Print the current order vs expected order for debugging
    if (machines.length > 0) {
      const currentOrder = machines.map(m => m._id);
      const expectedOrder = machinesSorted.map(m => m._id);
      console.log('Current machine order:', currentOrder);
      console.log('Expected machine order:', expectedOrder);
    }
    
    if (needsReordering) {
      console.log('Machines need reordering. Reordering...');
      
      // Delete all machines
      await Machine.deleteMany({});
      
      // Reinsert in correct order
      for (const machine of machinesSorted) {
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
        console.log(`Reordered machine ${machine._id}: ${machine.name}`);
      }
      
      // Verify the new order
      const verifyMachines = await Machine.find({}, '_id').sort({ _id: 1 });
      const verifyIds = verifyMachines.map(m => m._id);
      console.log('New machine order after reordering:', verifyIds);
      
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

// New function to update course images
async function updateCourseImages() {
  try {
    const courseUpdates = [
      {
        _id: '1',
        imageUrl: '/courses/laser-course-updated.jpg'
      },
      {
        _id: '2',
        imageUrl: '/courses/3d-printing-updated.jpg'
      },
      {
        _id: '3',
        imageUrl: '/courses/carbon-3d-updated.jpg'
      },
      {
        _id: '4',
        imageUrl: '/courses/bambu-lab-updated.jpg'
      }
    ];

    for (const update of courseUpdates) {
      await Course.updateOne(
        { _id: update._id },
        { $set: { imageUrl: update.imageUrl } }
      );
      console.log(`Updated image for course ${update._id}`);
    }
  } catch (error) {
    console.error('Error updating course images:', error);
  }
}

// New function to seed courses
async function seedCourses() {
  try {
    const courses = [
      {
        _id: '1',
        title: 'Laser Cutter Safety Course',
        description: 'Learn the fundamentals of laser cutting technology and safety protocols.',
        category: 'Fabrication',
        content: '# Laser Cutter Safety Course\n\nWelcome to the Laser Cutter Safety Course. This course will introduce you to the fundamental concepts of laser cutting and important safety procedures.\n\n## Safety First\n\nBefore operating the laser cutter, it\'s essential to understand the safety procedures.\n\n## Materials\n\nDifferent materials react differently to laser cutting. In this section, we\'ll explore various materials and their properties.',
        imageUrl: '/courses/laser-cutting.jpg',
        relatedMachineIds: ['1'],
        quizId: '1',
        difficulty: 'Intermediate'
      },
      {
        _id: '2',
        title: 'Ultimaker 3D Printer Course',
        description: 'Get started with Ultimaker 3D printing technology.',
        category: 'Fabrication',
        content: '# Ultimaker 3D Printer Course\n\nWelcome to the Ultimaker 3D Printer Course. This course will introduce you to the exciting world of 3D printing with the Ultimaker.\n\n## What is 3D Printing?\n\n3D printing, also known as additive manufacturing, is a process of making three dimensional solid objects from a digital file.\n\n## Common Technologies\n\nThe Ultimaker uses FDM (Fused Deposition Modeling) technology to create precise and reliable prints.',
        imageUrl: '/courses/3d-printing.jpg',
        relatedMachineIds: ['2'],
        quizId: '2',
        difficulty: 'Beginner'
      },
      {
        _id: '3',
        title: 'X1 E Carbon 3D Printer Training',
        description: 'Advanced training for the X1 E Carbon 3D Printer.',
        category: 'Fabrication',
        content: '# X1 E Carbon 3D Printer Training\n\nWelcome to the X1 E Carbon 3D Printer training course. This advanced 3D printer offers exceptional capabilities for creating high-strength parts with carbon fiber materials.\n\n## Carbon Fiber Printing\n\nLearn how to work with carbon fiber reinforced materials for maximum strength and durability.\n\n## Advanced Settings\n\nMaster the specialized settings required for optimal printing results with the X1 E Carbon.',
        imageUrl: '/courses/carbon-3d.jpg',
        relatedMachineIds: ['3'],
        quizId: '3',
        difficulty: 'Advanced'
      },
      {
        _id: '4',
        title: 'Bambu Lab X1 E Course',
        description: 'Complete guide to using the Bambu Lab X1 E 3D printer.',
        category: 'Fabrication',
        content: '# Bambu Lab X1 E Course\n\nWelcome to the Bambu Lab X1 E Course. This comprehensive guide will teach you how to get the most out of your Bambu Lab X1 E 3D printer.\n\n## High-Speed Printing\n\nLearn how to utilize the X1 E\'s impressive 500mm/s print speeds while maintaining quality.\n\n## Multi-Material Printing\n\nMaster the art of printing with multiple materials in a single print job using the Bambu Lab X1 E.',
        imageUrl: '/courses/bambu-lab.jpg',
        relatedMachineIds: ['4'],
        quizId: '4',
        difficulty: 'Intermediate'
      }
    ];

    for (const course of courses) {
      const newCourse = new Course(course);
      await newCourse.save();
      console.log(`Created course: ${course.title}`);
    }

    console.log(`Created ${courses.length} courses successfully`);
  } catch (error) {
    console.error('Error seeding courses:', error);
  }
}

// New function to seed quizzes
async function seedQuizzes() {
  try {
    const quizzes = [
      {
        _id: '1',
        title: 'Laser Cutter Certification Quiz',
        description: 'Test your knowledge of laser cutting safety and operation.',
        category: 'Fabrication',
        imageUrl: '/quizzes/laser-quiz.jpg',
        questions: [
          {
            question: 'What should you NEVER put in a laser cutter?',
            options: ['Acrylic', 'Wood', 'PVC', 'Paper'],
            correctAnswer: 2,
            explanation: 'PVC releases chlorine gas when cut which is harmful to humans and damages the machine.'
          },
          {
            question: 'What is the primary safety concern when operating a laser cutter?',
            options: ['Fire hazard', 'Electrical shock', 'Noise level', 'Water damage'],
            correctAnswer: 0,
            explanation: 'Fire is the primary safety concern when operating a laser cutter.'
          },
          {
            question: 'What should you do before starting a laser cutting job?',
            options: ['Leave the room', 'Close the lid/door', 'Remove the exhaust hose', 'Turn off the air assist'],
            correctAnswer: 1,
            explanation: 'Always close the lid/door before starting a laser cutting job to contain the laser beam.'
          }
        ],
        passingScore: 70,
        relatedMachineIds: ['1'],
        relatedCourseId: '1',
        difficulty: 'Intermediate'
      },
      {
        _id: '2',
        title: 'Ultimaker Certification Quiz',
        description: 'Verify your understanding of Ultimaker 3D printing concepts and best practices.',
        category: 'Fabrication',
        imageUrl: '/quizzes/3d-printing-quiz.jpg',
        questions: [
          {
            question: 'What does FDM stand for in 3D printing?',
            options: ['Fast Deposition Method', 'Fused Deposition Modeling', 'Filament Direct Manufacturing', 'Final Design Model'],
            correctAnswer: 1,
            explanation: 'FDM stands for Fused Deposition Modeling, which is the technology used by Ultimaker 3D printers.'
          },
          {
            question: 'Which material is most commonly used with Ultimaker printers?',
            options: ['Resin', 'Metal powder', 'PLA/ABS filament', 'Clay'],
            correctAnswer: 2,
            explanation: 'PLA and ABS filaments are the most commonly used materials in Ultimaker 3D printers.'
          },
          {
            question: 'What is the purpose of a heated bed on the Ultimaker?',
            options: ['To speed up printing', 'To prevent warping', 'To melt the filament', 'To sterilize the print area'],
            correctAnswer: 1,
            explanation: 'A heated bed helps prevent warping by keeping the first layers of a print warm during the printing process.'
          }
        ],
        passingScore: 70,
        relatedMachineIds: ['2'],
        relatedCourseId: '2',
        difficulty: 'Beginner'
      },
      {
        _id: '3',
        title: 'X1 E Carbon 3D Printer Certification',
        description: 'Advanced certification for carbon fiber 3D printing.',
        category: 'Fabrication',
        imageUrl: '/quizzes/carbon-quiz.jpg',
        questions: [
          {
            question: 'What is the primary advantage of carbon fiber reinforcement in 3D printing?',
            options: ['Decreased weight', 'Increased strength', 'Lower cost', 'Faster printing'],
            correctAnswer: 1,
            explanation: 'Carbon fiber reinforcement significantly increases the strength and stiffness of printed parts.'
          },
          {
            question: 'What temperature range is typically used for printing carbon fiber materials?',
            options: ['180-200°C', '220-240°C', '250-280°C', '300-350°C'],
            correctAnswer: 2,
            explanation: 'Carbon fiber reinforced materials typically require higher temperatures in the 250-280°C range.'
          },
          {
            question: 'What special hardware feature does the X1 E Carbon printer have?',
            options: ['Dual extruders', 'Hardened steel nozzle', 'Enclosed chamber', 'All of the above'],
            correctAnswer: 3,
            explanation: 'The X1 E Carbon has all these features to properly handle abrasive carbon fiber materials.'
          }
        ],
        passingScore: 80,
        relatedMachineIds: ['3'],
        relatedCourseId: '3',
        difficulty: 'Advanced'
      },
      {
        _id: '4',
        title: 'Bambu Lab X1 E Certification Quiz',
        description: 'Test your knowledge of the Bambu Lab X1 E 3D printer.',
        category: 'Fabrication',
        imageUrl: '/quizzes/bambu-quiz.jpg',
        questions: [
          {
            question: 'What is the maximum print speed of the Bambu Lab X1 E?',
            options: ['100 mm/s', '250 mm/s', '500 mm/s', '1000 mm/s'],
            correctAnswer: 2,
            explanation: 'The Bambu Lab X1 E can print at speeds up to 500 mm/s.'
          },
          {
            question: 'What type of printer architecture does the Bambu Lab X1 E use?',
            options: ['Delta', 'Cartesian', 'Core XY', 'Polar'],
            correctAnswer: 2,
            explanation: 'The Bambu Lab X1 E uses a Core XY architecture for faster and more precise movements.'
          },
          {
            question: 'What special feature helps with multi-material printing on the Bambu Lab X1 E?',
            options: ['Dual extruders', 'AMS (Automatic Material System)', 'Tool changing', 'Manual filament switching'],
            correctAnswer: 1,
            explanation: 'The AMS (Automatic Material System) allows the Bambu Lab X1 E to print with multiple materials automatically.'
          }
        ],
        passingScore: 75,
        relatedMachineIds: ['4'],
        relatedCourseId: '4',
        difficulty: 'Intermediate'
      }
    ];

    for (const quiz of quizzes) {
      const newQuiz = new Quiz(quiz);
      await newQuiz.save();
      console.log(`Created quiz: ${quiz.title}`);
    }

    console.log(`Created ${quizzes.length} quizzes successfully`);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
  }
}
