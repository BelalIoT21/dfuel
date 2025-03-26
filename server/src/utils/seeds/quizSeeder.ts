
import { Quiz } from '../../models/Quiz';

// Default quiz data array
const defaultQuizzes = [
  {
    _id: '1',
    title: 'Laser Cutter Certification Quiz',
    description: 'Test your knowledge of laser cutting safety and operation.',
    category: 'Fabrication',
    imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
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
    imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
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
    imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
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
    imageUrl: 'http://localhost:4000/utils/images/IMG_7825.jpg',
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

// Function to seed quizzes
export async function seedQuizzes() {
  try {
    const quizzes = defaultQuizzes;

    for (const quiz of quizzes) {
      const existingQuiz = await Quiz.findOne({ _id: quiz._id });
      if (existingQuiz) {
        console.log(`Quiz ${quiz._id}: ${quiz.title} already exists, skipping`);
        continue;
      }
      
      const newQuiz = new Quiz(quiz);
      await newQuiz.save();
      console.log(`Created quiz: ${quiz.title} (ID: ${quiz._id})`);
    }

    console.log(`Seeded quizzes successfully`);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
  }
}

// Function to check for missing quizzes and seed only those
export async function checkAndSeedQuizzes() {
  try {
    const quizzes = defaultQuizzes;
    let seededCount = 0;

    // Get existing quiz IDs
    const existingQuizzes = await Quiz.find({}, '_id');
    const existingQuizIds = existingQuizzes.map(quiz => quiz._id.toString());
    
    // Find missing quizzes
    const missingQuizzes = quizzes.filter(quiz => !existingQuizIds.includes(quiz._id));
    
    if (missingQuizzes.length === 0) {
      console.log('No missing quizzes found. All default quizzes exist.');
      return;
    }
    
    // Seed only missing quizzes
    for (const quiz of missingQuizzes) {
      const newQuiz = new Quiz(quiz);
      await newQuiz.save();
      console.log(`Created missing quiz: ${quiz.title} (ID: ${quiz._id})`);
      seededCount++;
    }

    console.log(`Seeded ${seededCount} missing quizzes successfully`);
  } catch (error) {
    console.error('Error seeding missing quizzes:', error);
  }
}

