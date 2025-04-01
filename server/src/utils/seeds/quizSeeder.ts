import { Quiz } from '../../models/Quiz';

// Store original quiz data for restoration capability
const ORIGINAL_QUIZ_TEMPLATES = {
  // Define your original quiz templates here
  // This will serve as backup data for core quizzes (1-6)
  // ...
};

// Function to seed safety quizzes
export async function seedSafetyQuizzes() {
  try {
    // Check if quizzes already exist
    const quiz5 = await Quiz.findById('5');
    const quiz6 = await Quiz.findById('6');
    
    // Create Safety Cabinet quiz if it doesn't exist
    if (!quiz5) {
      const safetyCabinetQuiz = new Quiz({
        _id: '5',
        title: 'Safety Cabinet Quiz',
        description: 'Test your knowledge about proper safety cabinet usage',
        category: 'Safety',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
        questions: [
          {
            question: 'Where should heavier items be stored in a safety cabinet?',
            options: [
              'On the top shelf',
              'On the middle shelf',
              'On the lower shelves',
              'Anywhere there is space'
            ],
            correctAnswer: 2,
            explanation: 'Heavier items should be stored on lower shelves to prevent accidents if they fall.'
          },
          {
            question: 'What should you do if you find a chemical spill in the safety cabinet?',
            options: [
              'Clean it up yourself quickly',
              'Ignore it if it\'s small',
              'Alert others and contact the lab supervisor immediately',
              'Cover it with paper towels and come back later'
            ],
            correctAnswer: 2,
            explanation: 'Always alert others and contact the lab supervisor for any chemical spill, regardless of size.'
          },
          {
            question: 'Which of the following is NOT allowed when using the safety cabinet?',
            options: [
              'Storing labeled containers',
              'Mixing chemicals inside the cabinet',
              'Organizing chemicals by compatibility groups',
              'Keeping an inventory of stored materials'
            ],
            correctAnswer: 1,
            explanation: 'Never mix chemicals inside the safety cabinet. Mixing should be done in appropriate workspaces with proper ventilation.'
          },
          {
            question: 'When should safety cabinet doors be closed?',
            options: [
              'Only during weekends',
              'Only when storing flammable materials',
              'When not actively accessing the contents',
              'Only during emergencies'
            ],
            correctAnswer: 2,
            explanation: 'Safety cabinet doors should be closed and locked when not actively accessing the contents to maintain safety.'
          },
          {
            question: 'What is the purpose of a safety cabinet?',
            options: [
              'To display hazardous materials',
              'To mix chemicals safely',
              'To properly store hazardous materials',
              'To dispose of unwanted chemicals'
            ],
            correctAnswer: 2,
            explanation: 'Safety cabinets are designed to safely store hazardous materials and protect them from fire and unauthorized access.'
          }
        ],
        passingScore: 80,
        relatedMachineIds: ['5'],
        relatedCourseId: '5',
        difficulty: 'Basic'
      });
      
      await safetyCabinetQuiz.save();
      console.log('Created Safety Cabinet quiz with ID: 5');
    } else {
      console.log('Safety Cabinet quiz already exists');
    }
    
    // Create Machine Safety quiz if it doesn't exist
    if (!quiz6) {
      const machineSafetyQuiz = new Quiz({
        _id: '6',
        title: 'Machine Safety Fundamentals Quiz',
        description: 'Test your knowledge of basic machine safety principles',
        category: 'Safety',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
        questions: [
          {
            question: 'What should you do before operating any machine?',
            options: [
              'Have a snack to maintain energy',
              'Receive proper training and authorization',
              'Make sure you have your phone ready',
              'Ask a friend to watch you use it'
            ],
            correctAnswer: 1,
            explanation: 'Always receive proper training and authorization before operating any machine in the makerspace.'
          },
          {
            question: 'Which of the following is proper PPE for machine operation?',
            options: [
              'Open-toed shoes for comfort',
              'Loose clothing for freedom of movement',
              'Eye protection and closed-toe shoes',
              'Dangling jewelry to express yourself'
            ],
            correctAnswer: 2,
            explanation: 'Eye protection and closed-toe shoes are essential PPE for machine operation.'
          },
          {
            question: 'What should you do if you notice a machine isn\'t working properly?',
            options: [
              'Try to fix it yourself',
              'Leave it for someone else to discover',
              'Report it to staff immediately',
              'Use it anyway but be more careful'
            ],
            correctAnswer: 2,
            explanation: 'Always report machine issues to staff immediately. Never attempt repairs yourself or use faulty equipment.'
          },
          {
            question: 'Where should food and drinks be kept in relation to machines?',
            options: [
              'Next to the machine while working',
              'On a separate table in the machine area',
              'Entirely outside the machine area',
              'In a covered container near the machine'
            ],
            correctAnswer: 2,
            explanation: 'Food and drinks should be kept entirely outside the machine area to prevent spills and contamination.'
          },
          {
            question: 'What should you do after finishing with a machine?',
            options: [
              'Leave it running for the next person',
              'Turn it off, clean up, and report any issues',
              'Just turn it off and leave quickly',
              'Clean it only if it looks dirty'
            ],
            correctAnswer: 1,
            explanation: 'Always turn off the machine, clean up your work area, and report any issues you encountered.'
          }
        ],
        passingScore: 80,
        relatedMachineIds: ['6'],
        relatedCourseId: '6',
        difficulty: 'Basic'
      });
      
      await machineSafetyQuiz.save();
      console.log('Created Machine Safety quiz with ID: 6');
    } else {
      console.log('Machine Safety quiz already exists');
    }
    
    console.log('Safety quizzes seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding safety quizzes:', error);
    return { success: false, error };
  }
}

// Function to seed all quizzes
export async function seedAllQuizzes() {
  try {
    const quizzes = [
      {
        _id: '1',
        title: 'Laser Cutter Quiz',
        description: 'Test your knowledge about laser cutter safety and operation',
        category: 'Equipment',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
        questions: [
          {
            question: 'What should you NEVER cut in a laser cutter?',
            options: [
              'Wood',
              'Acrylic',
              'PVC/Vinyl',
              'Paper'
            ],
            correctAnswer: 2,
            explanation: 'PVC/Vinyl releases chlorine gas when cut, which is toxic and corrosive to the machine.'
          },
          {
            question: 'What should you do if a fire starts in the laser cutter?',
            options: [
              'Open the lid to check it',
              'Use the emergency stop button and follow fire protocols',
              'Spray water on it',
              'Wait for it to burn out'
            ],
            correctAnswer: 1,
            explanation: 'Always use the emergency stop and follow proper fire safety protocols.'
          },
          {
            question: 'Why is ventilation important for laser cutting?',
            options: [
              'To keep the machine cool',
              'To remove potentially harmful fumes',
              'To improve cutting quality',
              'It\'s not important'
            ],
            correctAnswer: 1,
            explanation: 'Proper ventilation removes harmful fumes and particles produced during cutting.'
          },
          {
            question: 'Which of these is an important safety practice for laser cutting?',
            options: [
              'Leaving the machine while it\'s running',
              'Putting flammable materials near the laser',
              'Never leaving the machine unattended while operating',
              'Turning off ventilation to save energy'
            ],
            correctAnswer: 2,
            explanation: 'Never leave a running laser cutter unattended.'
          },
          {
            question: 'What is the first step before starting a laser cutting job?',
            options: [
              'Close the lid and start immediately',
              'Ensure material is correctly positioned and secured',
              'Set power to maximum',
              'Disable safety features'
            ],
            correctAnswer: 1,
            explanation: 'Proper material placement and securing are critical for safe and accurate cutting.'
          }
        ],
        passingScore: 80,
        relatedMachineIds: ['1'],
        relatedCourseId: '1',
        difficulty: 'Intermediate'
      },
      {
        _id: '2',
        title: 'Ultimaker 3D Printer Quiz',
        description: 'Test your knowledge of 3D printing with the Ultimaker',
        category: 'Equipment',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
        questions: [
          {
            question: 'What is the function of the build plate on a 3D printer?',
            options: [
              'To cool the printer',
              'To provide a surface for the print to adhere to',
              'To increase print speed',
              'To change filament colors'
            ],
            correctAnswer: 1,
            explanation: 'The build plate provides a surface for the first layer to adhere to, allowing the rest of the print to build on top.'
          },
          {
            question: 'What temperature can the nozzle of a 3D printer reach?',
            options: [
              'Up to 50°C',
              'Up to 100°C',
              'Up to 280°C',
              'Only room temperature'
            ],
            correctAnswer: 2,
            explanation: 'The nozzle can reach temperatures up to 280°C, which is why it should never be touched during or immediately after printing.'
          },
          {
            question: 'What should you do after completing a print?',
            options: [
              'Immediately pull the print off while hot',
              'Turn off the printer with the print still attached',
              'Wait for the build plate to cool before removing the print',
              'Use metal tools to scrape off the print'
            ],
            correctAnswer: 2,
            explanation: 'Waiting for the build plate to cool makes print removal easier and safer.'
          },
          {
            question: 'What is "slicing" in 3D printing?',
            options: [
              'Cutting the 3D printed object after it\'s done',
              'Converting a 3D model into layers for the printer to print',
              'Dividing the build plate into sections',
              'Cutting the filament before loading it'
            ],
            correctAnswer: 1,
            explanation: 'Slicing software converts 3D models into layer-by-layer instructions (G-code) for the printer.'
          },
          {
            question: 'Which of these is NOT a common 3D printing material?',
            options: [
              'PLA',
              'ABS',
              'TPU',
              'PVC'
            ],
            correctAnswer: 3,
            explanation: 'PVC is not commonly used in 3D printing due to toxic fumes when heated.'
          }
        ],
        passingScore: 80,
        relatedMachineIds: ['2'],
        relatedCourseId: '2',
        difficulty: 'Basic'
      },
      {
        _id: '3',
        title: 'X1 E Carbon 3D Printer Certification Quiz',
        description: 'Test your knowledge of carbon fiber 3D printing',
        category: 'Equipment',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7773.jpg',
        questions: [
          {
            question: 'What type of materials can the X1 E Carbon 3D Printer use?',
            options: [
              'Only standard PLA',
              'Carbon fiber reinforced composites',
              'Only metals',
              'Clay and ceramics'
            ],
            correctAnswer: 1,
            explanation: 'The X1 E is designed specifically for printing with carbon fiber reinforced composite materials.'
          },
          {
            question: 'What should you wear when handling carbon fiber materials?',
            options: [
              'No special protection needed',
              'Only face mask',
              'Nitrile gloves and appropriate respiratory protection',
              'Thick wool gloves'
            ],
            correctAnswer: 2,
            explanation: 'Carbon fiber particles can irritate skin and lungs, so proper protection is essential.'
          },
          {
            question: 'Why are hardened steel nozzles recommended for carbon fiber printing?',
            options: [
              'They heat up faster',
              'They produce shinier prints',
              'Carbon fiber is abrasive and wears out standard brass nozzles',
              'They use less electricity'
            ],
            correctAnswer: 2,
            explanation: 'Carbon fiber materials are abrasive and will quickly wear out standard brass nozzles.'
          },
          {
            question: 'What is a benefit of carbon fiber reinforced prints?',
            options: [
              'They\'re more flexible',
              'They have higher strength-to-weight ratio',
              'They print faster',
              'They\'re biodegradable'
            ],
            correctAnswer: 1,
            explanation: 'Carbon fiber reinforcement provides exceptional strength while keeping weight low.'
          },
          {
            question: 'What maintenance is particularly important for carbon fiber printing?',
            options: [
              'Painting the machine regularly',
              'Regular nozzle inspection and replacement',
              'Keeping the printer in direct sunlight',
              'Using water to clean the build plate'
            ],
            correctAnswer: 1,
            explanation: 'Due to the abrasive nature of carbon fiber materials, nozzles need regular inspection and replacement.'
          }
        ],
        passingScore: 80,
        relatedMachineIds: ['3'],
        relatedCourseId: '3',
        difficulty: 'Advanced'
      },
      {
        _id: '4',
        title: 'Bambu Lab 3D Printer Certification Quiz',
        description: 'Test your knowledge about Bambu Lab printer operation',
        category: 'Equipment',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
        questions: [
          {
            question: 'What is a key feature of the Bambu Lab 3D printer?',
            options: [
              'Manual bed leveling only',
              'Single material printing only',
              'Automatic bed leveling and multi-material capability',
              'No temperature control'
            ],
            correctAnswer: 2,
            explanation: 'The Bambu Lab printer features automatic bed leveling and can print with multiple materials.'
          },
          {
            question: 'What software is recommended for preparing prints for Bambu Lab printers?',
            options: [
              'Microsoft Word',
              'Bambu Studio',
              'Photoshop',
              'Excel'
            ],
            correctAnswer: 1,
            explanation: 'Bambu Studio is the dedicated software for preparing models for Bambu Lab printers.'
          },
          {
            question: 'What is a unique monitoring feature of Bambu Lab printers?',
            options: [
              'Manual check only',
              'AI camera monitoring system',
              'No monitoring options',
              'Sound detection'
            ],
            correctAnswer: 1,
            explanation: 'Bambu Lab printers include an AI camera system that monitors print progress and can detect issues.'
          },
          {
            question: 'What should you do before starting a print on the Bambu Lab printer?',
            options: [
              'Nothing, just start printing',
              'Apply glue stick to the entire build plate',
              'Ensure the build plate is clean and the filament is properly loaded',
              'Remove the build plate completely'
            ],
            correctAnswer: 2,
            explanation: 'Always ensure the build plate is clean and that filament is properly loaded before starting a print.'
          },
          {
            question: 'What is a benefit of using the Bambu Lab ecosystem?',
            options: [
              'It only works with one type of material',
              'It requires manual calibration for every print',
              'It integrates cloud connectivity and remote monitoring',
              'It can only print very small objects'
            ],
            correctAnswer: 2,
            explanation: 'The Bambu Lab ecosystem offers integrated cloud connectivity and remote monitoring capabilities.'
          }
        ],
        passingScore: 80,
        relatedMachineIds: ['4'],
        relatedCourseId: '4',
        difficulty: 'Intermediate'
      },
      {
        _id: '5',
        title: 'Safety Cabinet Quiz',
        description: 'Test your knowledge about proper safety cabinet usage',
        category: 'Safety',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
        questions: [
          {
            question: 'Where should heavier items be stored in a safety cabinet?',
            options: [
              'On the top shelf',
              'On the middle shelf',
              'On the lower shelves',
              'Anywhere there is space'
            ],
            correctAnswer: 2,
            explanation: 'Heavier items should be stored on lower shelves to prevent accidents if they fall.'
          },
          {
            question: 'What should you do if you find a chemical spill in the safety cabinet?',
            options: [
              'Clean it up yourself quickly',
              'Ignore it if it\'s small',
              'Alert others and contact the lab supervisor immediately',
              'Cover it with paper towels and come back later'
            ],
            correctAnswer: 2,
            explanation: 'Always alert others and contact the lab supervisor for any chemical spill, regardless of size.'
          },
          {
            question: 'Which of the following is NOT allowed when using the safety cabinet?',
            options: [
              'Storing labeled containers',
              'Mixing chemicals inside the cabinet',
              'Organizing chemicals by compatibility groups',
              'Keeping an inventory of stored materials'
            ],
            correctAnswer: 1,
            explanation: 'Never mix chemicals inside the safety cabinet. Mixing should be done in appropriate workspaces with proper ventilation.'
          },
          {
            question: 'When should safety cabinet doors be closed?',
            options: [
              'Only during weekends',
              'Only when storing flammable materials',
              'When not actively accessing the contents',
              'Only during emergencies'
            ],
            correctAnswer: 2,
            explanation: 'Safety cabinet doors should be closed and locked when not actively accessing the contents to maintain safety.'
          },
          {
            question: 'What is the purpose of a safety cabinet?',
            options: [
              'To display hazardous materials',
              'To mix chemicals safely',
              'To properly store hazardous materials',
              'To dispose of unwanted chemicals'
            ],
            correctAnswer: 2,
            explanation: 'Safety cabinets are designed to safely store hazardous materials and protect them from fire and unauthorized access.'
          }
        ],
        passingScore: 80,
        relatedMachineIds: ['5'],
        relatedCourseId: '5',
        difficulty: 'Basic'
      },
      {
        _id: '6',
        title: 'Machine Safety Fundamentals Quiz',
        description: 'Test your knowledge of basic machine safety principles',
        category: 'Safety',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
        questions: [
          {
            question: 'What should you do before operating any machine?',
            options: [
              'Have a snack to maintain energy',
              'Receive proper training and authorization',
              'Make sure you have your phone ready',
              'Ask a friend to watch you use it'
            ],
            correctAnswer: 1,
            explanation: 'Always receive proper training and authorization before operating any machine in the makerspace.'
          },
          {
            question: 'Which of the following is proper PPE for machine operation?',
            options: [
              'Open-toed shoes for comfort',
              'Loose clothing for freedom of movement',
              'Eye protection and closed-toe shoes',
              'Dangling jewelry to express yourself'
            ],
            correctAnswer: 2,
            explanation: 'Eye protection and closed-toe shoes are essential PPE for machine operation.'
          },
          {
            question: 'What should you do if you notice a machine isn\'t working properly?',
            options: [
              'Try to fix it yourself',
              'Leave it for someone else to discover',
              'Report it to staff immediately',
              'Use it anyway but be more careful'
            ],
            correctAnswer: 2,
            explanation: 'Always report machine issues to staff immediately. Never attempt repairs yourself or use faulty equipment.'
          },
          {
            question: 'Where should food and drinks be kept in relation to machines?',
            options: [
              'Next to the machine while working',
              'On a separate table in the machine area',
              'Entirely outside the machine area',
              'In a covered container near the machine'
            ],
            correctAnswer: 2,
            explanation: 'Food and drinks should be kept entirely outside the machine area to prevent spills and contamination.'
          },
          {
            question: 'What should you do after finishing with a machine?',
            options: [
              'Leave it running for the next person',
              'Turn it off, clean up, and report any issues',
              'Just turn it off and leave quickly',
              'Clean it only if it looks dirty'
            ],
            correctAnswer: 1,
            explanation: 'Always turn off the machine, clean up your work area, and report any issues you encountered.'
          }
        ],
        passingScore: 80,
        relatedMachineIds: ['6'],
        relatedCourseId: '6',
        difficulty: 'Basic'
      }
    ];

    // Create or update each quiz
    for (const quizData of quizzes) {
      const existingQuiz = await Quiz.findById(quizData._id);
      
      if (!existingQuiz) {
        const quiz = new Quiz(quizData);
        await quiz.save();
        console.log(`Created quiz: ${quizData.title} with ID: ${quizData._id}`);
      } else {
        console.log(`Quiz ${quizData.title} already exists with ID: ${quizData._id}`);
      }
    }
    
    console.log('Quizzes seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    return { success: false, error };
  }
}

// New function to restore soft-deleted core quizzes
export async function restoreDeletedQuizzes(): Promise<number> {
  try {
    // Find core quizzes (1-6) that are soft-deleted but not permanently deleted
    const softDeletedCoreQuizzes = await Quiz.find({
      _id: { $in: ['1', '2', '3', '4', '5', '6'] },
      deletedAt: { $exists: true, $ne: null },
      permanentlyDeleted: { $ne: true }
    });
    
    console.log(`Found ${softDeletedCoreQuizzes.length} soft-deleted core quizzes to restore`);
    
    let restoredCount = 0;
    
    for (const quiz of softDeletedCoreQuizzes) {
      // Restore the quiz by clearing the deletedAt field
      // but preserve all other properties/changes
      quiz.deletedAt = undefined;
      
      await quiz.save();
      console.log(`Restored soft-deleted core quiz ${quiz._id} with all previous modifications`);
      restoredCount++;
    }
    
    return restoredCount;
  } catch (error) {
    console.error("Error restoring soft-deleted core quizzes:", error);
    return 0;
  }
}

// Add a function to debug quiz access issues
export async function debugQuizAccess(quizId: string) {
  try {
    console.log(`Debugging quiz access for ID: ${quizId}`);
    const quiz = await Quiz.findById(quizId);
    
    if (quiz) {
      console.log(`Quiz found: ${quiz.title} (ID: ${quiz._id})`);
      console.log(`Quiz has ${quiz.questions?.length || 0} questions`);
      return true;
    } else {
      console.log(`Quiz with ID ${quizId} not found`);
      
      // Try to find by string ID if MongoDB ObjectId fails
      const quizByString = await Quiz.findOne({ _id: quizId });
      if (quizByString) {
        console.log(`Quiz found by string ID: ${quizByString.title}`);
        return true;
      }
      
      console.log(`Checking all quizzes in database...`);
      const allQuizzes = await Quiz.find();
      console.log(`Total quizzes in database: ${allQuizzes.length}`);
      allQuizzes.forEach(q => {
        console.log(`- Quiz: ${q.title} (ID: ${q._id})`);
      });
      
      return false;
    }
  } catch (error) {
    console.error(`Error debugging quiz access:`, error);
    return false;
  }
}
