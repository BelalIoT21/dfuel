
import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz';
import mongoose from 'mongoose';

// Get all quizzes
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find();
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
      quiz = await Quiz.findById(id);
    } else {
      quiz = await Quiz.findOne({ _id: id });
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
    const { title, description, category, imageUrl, questions, passingScore, relatedMachineIds, relatedCourseId, difficulty } = req.body;

    // Generate a new ID based on the count of quizzes + 100 (to avoid conflicts with default IDs)
    const count = await Quiz.countDocuments();
    const newId = String(count + 100);

    const quiz = new Quiz({
      _id: newId,
      title,
      description,
      category,
      imageUrl,
      questions,
      passingScore,
      relatedMachineIds,
      relatedCourseId,
      difficulty
    });

    const savedQuiz = await quiz.save();
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

    // Update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        imageUrl,
        questions,
        passingScore,
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
