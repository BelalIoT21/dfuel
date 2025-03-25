
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
      }

      // Check if we need to seed courses
      if (courseCount === 0) {
        console.log('No courses found. Seeding courses...');
        await seedCourses();
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

// New function to seed courses
async function seedCourses() {
  try {
    const courses = [
      {
        _id: '1',
        title: 'Laser Cutting Basics',
        description: 'Learn the fundamentals of laser cutting technology.',
        category: 'Fabrication',
        content: '# Laser Cutting Basics\n\nWelcome to the Laser Cutting Basics course. This course will introduce you to the fundamental concepts of laser cutting.\n\n## Safety First\n\nBefore operating any laser cutting equipment, it\'s essential to understand the safety procedures.\n\n## Materials\n\nDifferent materials react differently to laser cutting. In this section, we\'ll explore various materials and their properties.',
        imageUrl: '/courses/laser-cutting.jpg',
        relatedMachineIds: ['1'],
        quizId: '1',
        difficulty: 'Beginner'
      },
      {
        _id: '2',
        title: '3D Printing Fundamentals',
        description: 'Get started with 3D printing technology.',
        category: 'Fabrication',
        content: '# 3D Printing Fundamentals\n\nWelcome to the 3D Printing Fundamentals course. This course will introduce you to the exciting world of 3D printing.\n\n## What is 3D Printing?\n\n3D printing, also known as additive manufacturing, is a process of making three dimensional solid objects from a digital file.\n\n## Common Technologies\n\nThere are several technologies used in 3D printing, including FDM, SLA, and SLS.',
        imageUrl: '/courses/3d-printing.jpg',
        relatedMachineIds: ['2', '3', '4'],
        quizId: '2',
        difficulty: 'Beginner'
      },
      {
        _id: '3',
        title: 'Makerspace Safety',
        description: 'Essential safety protocols for makerspace environments.',
        category: 'Safety',
        content: '# Makerspace Safety\n\nWelcome to the Makerspace Safety course. This course covers essential safety protocols that all makerspace users must follow.\n\n## General Safety Guidelines\n\nAlways wear appropriate personal protective equipment (PPE) when working with machinery or chemicals.\n\n## Emergency Procedures\n\nKnow the location of fire extinguishers, first aid kits, and emergency exits.',
        imageUrl: '/courses/safety.jpg',
        relatedMachineIds: ['5', '6'],
        quizId: '3',
        difficulty: 'Beginner'
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
        title: '3D Printing Knowledge Check',
        description: 'Verify your understanding of 3D printing concepts and best practices.',
        category: 'Fabrication',
        imageUrl: '/quizzes/3d-printing-quiz.jpg',
        questions: [
          {
            question: 'What does FDM stand for in 3D printing?',
            options: ['Fast Deposition Method', 'Fused Deposition Modeling', 'Filament Direct Manufacturing', 'Final Design Model'],
            correctAnswer: 1,
            explanation: 'FDM stands for Fused Deposition Modeling, which is a common 3D printing technology.'
          },
          {
            question: 'Which material is most commonly used in FDM 3D printing?',
            options: ['Resin', 'Metal powder', 'PLA/ABS filament', 'Clay'],
            correctAnswer: 2,
            explanation: 'PLA and ABS filaments are the most commonly used materials in FDM 3D printing.'
          },
          {
            question: 'What is the purpose of a heated bed on a 3D printer?',
            options: ['To speed up printing', 'To prevent warping', 'To melt the filament', 'To sterilize the print area'],
            correctAnswer: 1,
            explanation: 'A heated bed helps prevent warping by keeping the first layers of a print warm during the printing process.'
          }
        ],
        passingScore: 70,
        relatedMachineIds: ['2', '3', '4'],
        relatedCourseId: '2',
        difficulty: 'Intermediate'
      },
      {
        _id: '3',
        title: 'General Safety Quiz',
        description: 'Test your knowledge of general makerspace safety.',
        category: 'Safety',
        imageUrl: '/quizzes/safety-quiz.jpg',
        questions: [
          {
            question: 'What should you do if you witness an accident in the makerspace?',
            options: ['Ignore it if it\'s minor', 'Take a photo first', 'Alert staff immediately', 'Try to fix the problem yourself'],
            correctAnswer: 2,
            explanation: 'Always alert staff immediately if you witness an accident, regardless of severity.'
          },
          {
            question: 'When is it acceptable to wear loose clothing while operating machinery?',
            options: ['When it\'s hot in the makerspace', 'When you\'re careful', 'When using non-rotating equipment only', 'Never'],
            correctAnswer: 3,
            explanation: 'It is never acceptable to wear loose clothing when operating machinery as it can get caught in moving parts.'
          },
          {
            question: 'What is the first step when using a new piece of equipment?',
            options: ['Ask for training from staff', 'Read the manual online', 'Watch YouTube tutorials', 'Try it out carefully'],
            correctAnswer: 0,
            explanation: 'Always ask for proper training from staff before using any new equipment.'
          }
        ],
        passingScore: 100, // Safety quiz requires perfect score
        relatedMachineIds: ['5', '6'],
        relatedCourseId: '3',
        difficulty: 'Beginner'
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

// New function to ensure machine order
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
