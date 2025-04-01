
import express from 'express';
import { getQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz, restoreQuiz, backupQuiz } from '../controllers/quizController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Configure middleware for handling large uploads (50MB limit)
const jsonParser = express.json({ limit: '50mb' });

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

// New endpoint to restore a deleted quiz
router.post('/:id/restore', protect, admin, jsonParser, restoreQuiz);

// New endpoint to backup a quiz
router.post('/:id/backup', protect, admin, jsonParser, [
  express.json({ limit: '50mb' })
], backupQuiz);

export default router;
