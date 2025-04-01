
import { Quiz } from '../../models/Quiz';
import { predefinedQuizzes, ORIGINAL_QUIZ_TEMPLATES } from './quizTemplates';

// Function to seed safety quizzes (safety and machine safety quizzes only)
export async function seedSafetyQuizzes() {
  try {
    // Check if quizzes already exist
    const quiz5 = await Quiz.findById('5');
    const quiz6 = await Quiz.findById('6');
    
    const safetyQuizzes = predefinedQuizzes.filter(quiz => 
      (quiz._id === '5' || quiz._id === '6') && quiz.category === 'Safety'
    );
    
    // Create Safety Cabinet quiz if it doesn't exist
    if (!quiz5 && safetyQuizzes.find(q => q._id === '5')) {
      const safetyCabinetQuiz = new Quiz(safetyQuizzes.find(q => q._id === '5'));
      await safetyCabinetQuiz.save();
      console.log('Created Safety Cabinet quiz with ID: 5');
    } else {
      console.log('Safety Cabinet quiz already exists');
    }
    
    // Create Machine Safety quiz if it doesn't exist
    if (!quiz6 && safetyQuizzes.find(q => q._id === '6')) {
      const machineSafetyQuiz = new Quiz(safetyQuizzes.find(q => q._id === '6'));
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

// Function to seed all core quizzes
export async function seedAllQuizzes() {
  try {
    for (const quizData of predefinedQuizzes) {
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

// Function to restore soft-deleted core quizzes
export async function restoreDeletedQuizzes(): Promise<number> {
  try {
    // Find ONLY core quizzes (1-6) that are soft-deleted but not permanently deleted
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
    
    // Do NOT restore quizzes with ID > 6 (user created quizzes)
    console.log(`Only core quizzes (1-6) were considered for restoration`);
    
    return restoredCount;
  } catch (error) {
    console.error("Error restoring soft-deleted core quizzes:", error);
    return 0;
  }
}

// Create a backup of all core quizzes
export async function backupQuizzes(): Promise<number> {
  try {
    // Get all core quizzes (1-6)
    const coreQuizzes = await Quiz.find({
      _id: { $in: Object.keys(ORIGINAL_QUIZ_TEMPLATES) }
    });
    
    let backupCount = 0;
    
    for (const quiz of coreQuizzes) {
      // Only backup if no backup exists
      if (!quiz.backupData) {
        // Create backup of current quiz state
        quiz.backupData = JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          questions: quiz.questions,
          passingScore: quiz.passingScore,
          imageUrl: quiz.imageUrl,
          relatedMachineIds: quiz.relatedMachineIds,
          relatedCourseId: quiz.relatedCourseId,
          difficulty: quiz.difficulty
        });
        
        await quiz.save();
        console.log(`Created backup for core quiz ${quiz._id}`);
        backupCount++;
      }
    }
    
    console.log(`Backed up ${backupCount} core quizzes`);
    return backupCount;
  } catch (error) {
    console.error("Error backing up core quizzes:", error);
    return 0;
  }
}
