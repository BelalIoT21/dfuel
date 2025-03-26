
import { Quiz } from '../../models/Quiz';
import mongoose from 'mongoose';

// Function to seed quizzes for machines 5 and 6
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
