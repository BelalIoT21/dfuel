import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz';
import mongoose from 'mongoose';

// Get all quizzes
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    // Only return quizzes that haven't been soft-deleted
    const quizzes = await Quiz.find({ deletedAt: { $exists: false } });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error in getQuizzes:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get quiz by ID
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle string IDs properly
    let quiz;
    if (mongoose.Types.ObjectId.isValid(id)) {
      quiz = await Quiz.findOne({ _id: id, deletedAt: { $exists: false } });
    } else {
      quiz = await Quiz.findOne({ _id: id, deletedAt: { $exists: false } });
    }

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error in getQuizById:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Create new quiz
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { title, description, category, questions, passingScore, imageUrl, relatedMachineIds, relatedCourseId, difficulty, startingId } = req.body;

    // Generate a new ID starting at the specified startingId or 5 as default
    const minStartId = startingId || 5;
    
    // Get all existing quiz IDs and filter out numeric ones
    const existingQuizzes = await Quiz.find({}, { _id: 1 });
    const numericIds = existingQuizzes
      .map(q => q._id)
      .filter(id => /^\d+$/.test(id.toString()))
      .map(id => parseInt(id.toString()));
    
    // Find max ID or use minStartId - 1
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : (minStartId - 1);
    
    // New ID is max + 1, but at least minStartId
    const newId = String(Math.max(maxId + 1, minStartId));
    
    console.log(`Creating new quiz with ID: ${newId} (min starting ID: ${minStartId})`);
    
    // Validate required fields
    if (!title || !description || !category || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Missing required quiz fields' });
    }

    const quiz = new Quiz({
      _id: newId,
      title,
      description,
      category,
      questions,
      passingScore: passingScore || 70,
      imageUrl,
      relatedMachineIds,
      relatedCourseId,
      difficulty
    });

    const savedQuiz = await quiz.save();
    
    // Create an initial backup of the new quiz
    await backupQuizData(savedQuiz._id);
    
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Error in createQuiz:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update quiz
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category, questions, passingScore, imageUrl, relatedMachineIds, relatedCourseId, difficulty } = req.body;

    // Find the quiz
    let quiz;
    if (mongoose.Types.ObjectId.isValid(id)) {
      quiz = await Quiz.findById(id);
    } else {
      quiz = await Quiz.findOne({ _id: id });
    }

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Backup the quiz before updating
    await backupQuizData(id);

    // Update the quiz fields
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        questions,
        passingScore,
        imageUrl,
        relatedMachineIds,
        relatedCourseId,
        difficulty
      },
      { new: true }
    );

    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error('Error in updateQuiz:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Delete quiz (soft delete)
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query; // Add support for permanent deletion query parameter

    // Find the quiz
    let quiz;
    if (mongoose.Types.ObjectId.isValid(id)) {
      quiz = await Quiz.findById(id);
    } else {
      quiz = await Quiz.findOne({ _id: id });
    }

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Backup the quiz before deletion
    await backupQuizData(id);
    
    // Check if we should permanently delete
    if (permanent === 'true' || permanent === '1') {
      // For core quizzes (1-6), just mark them as permanently deleted
      const isCoreQuiz = Number(id) >= 1 && Number(id) <= 6;
      
      if (isCoreQuiz) {
        await Quiz.findByIdAndUpdate(id, { 
          deletedAt: new Date(),
          permanentlyDeleted: true
        });
        
        console.log(`Core quiz ${id} marked as permanently deleted`);
        return res.status(200).json({ 
          message: 'Core quiz marked as permanently deleted',
          softDeleted: true
        });
      } else {
        // For user-created quizzes, we can actually delete them
        await Quiz.findByIdAndDelete(id);
        console.log(`User-created quiz ${id} permanently deleted from database`);
        return res.status(200).json({ message: 'Quiz permanently deleted' });
      }
    } else {
      // Soft delete by setting deletedAt timestamp
      await Quiz.findByIdAndUpdate(id, { deletedAt: new Date() });
      return res.status(200).json({ message: 'Quiz deleted successfully (soft delete)' });
    }
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Helper function to backup quiz data
const backupQuizData = async (quizId: string) => {
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      console.error(`Cannot backup quiz ${quizId}: not found`);
      return false;
    }
    
    // Create backup data with timestamp
    const backupData = {
      ...quiz.toObject(),
      _backupTime: new Date().toISOString()
    };
    
    // Store backup as JSON string
    await Quiz.findByIdAndUpdate(quizId, {
      backupData: JSON.stringify(backupData)
    });
    
    console.log(`Successfully backed up quiz ${quizId}`);
    return true;
  } catch (error) {
    console.error(`Error backing up quiz ${quizId}:`, error);
    return false;
  }
};

// Backup quiz endpoint
export const backupQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { backupData } = req.body;
    
    // Find the quiz to ensure it exists
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Update with provided backup data or generate new backup
    if (backupData) {
      await Quiz.findByIdAndUpdate(id, { backupData });
    } else {
      const success = await backupQuizData(id);
      if (!success) {
        return res.status(500).json({ message: 'Failed to backup quiz' });
      }
    }
    
    res.status(200).json({ success: true, message: 'Quiz backed up successfully' });
  } catch (error) {
    console.error(`Error in backupQuiz:`, error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Restore quiz endpoint
export const restoreQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find the quiz to check if it exists
    let existingQuiz = await Quiz.findById(id);
    
    // If quiz doesn't exist or is soft-deleted, attempt to restore from backup
    const restoreFromBackup = !existingQuiz || existingQuiz.deletedAt;
    
    if (restoreFromBackup) {
      // Try to find the quiz even if it's soft-deleted
      existingQuiz = await Quiz.findOne({ _id: id });
      
      if (!existingQuiz) {
        return res.status(404).json({ message: 'Quiz not found and no backup available' });
      }
      
      // Don't restore permanently deleted quizzes
      if (existingQuiz.permanentlyDeleted) {
        return res.status(400).json({
          message: 'Cannot restore permanently deleted quiz',
          permanentlyDeleted: true
        });
      }
      
      // Check if backup data exists
      if (!existingQuiz.backupData) {
        return res.status(404).json({ message: 'No backup data available for this quiz' });
      }
      
      // Parse backup data
      const backupData = JSON.parse(existingQuiz.backupData);
      
      // Update quiz with backup data
      Object.keys(backupData).forEach(key => {
        // Skip special fields that shouldn't be restored
        if (!['_id', '__v', 'createdAt', 'updatedAt', '_backupTime'].includes(key)) {
          // Fix: Type assertion to allow string indexing on the mongoose document
          (existingQuiz as any)[key] = backupData[key];
        }
      });
      
      // Clear deletedAt to undelete
      existingQuiz.deletedAt = undefined;
      
      // Save the restored quiz
      await existingQuiz.save();
      
      res.status(200).json({ 
        success: true, 
        message: 'Quiz restored successfully from backup',
        quiz: existingQuiz
      });
    } else {
      // Quiz exists and isn't deleted, just return it
      res.status(200).json({ 
        success: true, 
        message: 'Quiz already exists and is active',
        quiz: existingQuiz
      });
    }
  } catch (error) {
    console.error(`Error in restoreQuiz:`, error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
