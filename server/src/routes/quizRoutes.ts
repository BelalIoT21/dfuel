
import express from 'express';
import { getQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz } from '../controllers/quizController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all quizzes
router.get('/', getQuizzes);

// Get quiz by ID
router.get('/:id', getQuizById);

// Create new quiz (admin only)
router.post('/', protect, admin, createQuiz);

// Update quiz (admin only)
router.put('/:id', protect, admin, updateQuiz);

// Delete quiz (admin only)
router.delete('/:id', protect, admin, deleteQuiz);

export default router;
