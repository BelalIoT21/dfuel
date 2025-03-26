
import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz';
import mongoose from 'mongoose';

// Get all quizzes
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    console.log('Getting all quizzes');
    const quizzes = await Quiz.find();
    console.log(`Found ${quizzes.length} quizzes`);
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
    console.log(`Getting quiz by ID: ${id}`);

    // Try different approaches to find the quiz
    let quiz = null;
    
    // First try by MongoDB ObjectId if valid
    if (mongoose.Types.ObjectId.isValid(id)) {
      quiz = await Quiz.findById(id);
      console.log(`Quiz lookup by ObjectId: ${quiz ? 'Found' : 'Not found'}`);
    } 
    
    // If not found, try by string ID
    if (!quiz) {
      quiz = await Quiz.findOne({ _id: id });
      console.log(`Quiz lookup by string ID: ${quiz ? 'Found' : 'Not found'}`);
    }
    
    // If still not found and id is numeric, try other approaches
    if (!quiz && /^\d+$/.test(id)) {
      // Try without leading zeros
      const numericId = String(parseInt(id, 10));
      if (numericId !== id) {
        quiz = await Quiz.findOne({ _id: numericId });
        console.log(`Quiz lookup by numeric ID without leading zeros: ${quiz ? 'Found' : 'Not found'}`);
      }
    }

    // If no quiz found, return 404
    if (!quiz) {
      console.log(`Quiz with ID ${id} not found after all lookup attempts`);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log(`Found quiz: ${quiz.title} (ID: ${quiz._id})`);
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error in getQuizById:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Create new quiz
export const createQuiz = async (req: Request, res: Response) => {
  try {
    console.log('Creating new quiz:', req.body.title);
    const { title, description, category, imageUrl, questions, passingScore, relatedMachineIds, relatedCourseId, difficulty } = req.body;

    // Basic validation
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Validate questions if provided
    if (questions && questions.length > 0) {
      for (const question of questions) {
        if (!question.question || !question.question.trim()) {
          return res.status(400).json({ message: 'All questions must have content' });
        }
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ message: 'Each question must have at least 2 options' });
        }
        if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({ message: 'Each question must have a valid correct answer' });
        }
      }
    }

    // Get existing quiz IDs and find the highest numeric ID
    const existingQuizzes = await Quiz.find({}, '_id');
    const numericIds = existingQuizzes
      .map(quiz => quiz._id)
      .filter(id => /^\d+$/.test(id))
      .map(id => parseInt(id));
    
    // Find the highest numeric ID, default to 4 if none found
    const highestId = numericIds.length > 0 ? Math.max(...numericIds) : 4;
    
    // New ID should be the highest + 1, but never less than 7 (since 5 and 6 are reserved)
    const newId = String(Math.max(highestId + 1, 7));
    
    console.log(`Creating new quiz with ID: ${newId} (after safety quizzes 5 and 6)`);

    const quiz = new Quiz({
      _id: newId,
      title,
      description,
      category,
      imageUrl,
      questions: questions || [],
      passingScore: passingScore || 70,
      relatedMachineIds: relatedMachineIds || [],
      relatedCourseId,
      difficulty: difficulty || 'Beginner'
    });

    const savedQuiz = await quiz.save();
    console.log('Quiz created successfully:', savedQuiz._id);
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
    const { title, description, category, imageUrl, questions, passingScore, relatedMachineIds, relatedCourseId, difficulty } = req.body;

    // Basic validation
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Validate questions if provided
    if (questions && questions.length > 0) {
      for (const question of questions) {
        if (!question.question || !question.question.trim()) {
          return res.status(400).json({ message: 'All questions must have content' });
        }
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ message: 'Each question must have at least 2 options' });
        }
        if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({ message: 'Each question must have a valid correct answer' });
        }
      }
    }

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

    // Handle image URL deletion (if null or empty string is explicitly provided)
    const updateData: any = {
      title,
      description,
      category,
      questions: questions || [],
      passingScore: passingScore || 70,
      relatedMachineIds: relatedMachineIds || [],
      relatedCourseId,
      difficulty: difficulty || 'Beginner'
    };
    
    // Only set imageUrl if it's not null or empty string
    if (imageUrl === null || imageUrl === "") {
      // Remove imageUrl field by using $unset in a separate operation
      await Quiz.updateOne(
        { _id: id },
        { $unset: { imageUrl: 1 } }
      );
    } else if (imageUrl) {
      // Only add the imageUrl field if it has a value
      updateData.imageUrl = imageUrl;
    }

    // Update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Quiz updated successfully:', updatedQuiz);
    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error('Error in updateQuiz:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Delete quiz
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

    // Delete the quiz
    await quiz.deleteOne();

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
