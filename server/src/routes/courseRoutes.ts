
import express from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, restoreCourse, backupCourse } from '../controllers/courseController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Configure middleware for handling large uploads (50MB limit)
const jsonParser = express.json({ limit: '50mb' });

// Get all courses
router.get('/', getCourses);

// Get course by ID
router.get('/:id', getCourseById);

// Create new course (admin only)
router.post('/', protect, admin, createCourse);

// Update course (admin only)
router.put('/:id', protect, admin, updateCourse);

// Delete course (admin only)
router.delete('/:id', protect, admin, deleteCourse);

// New endpoint to restore a deleted course
router.post('/:id/restore', protect, admin, jsonParser, restoreCourse);

// New endpoint to backup a course
router.post('/:id/backup', protect, admin, jsonParser, [
  express.json({ limit: '50mb' })
], backupCourse);

export default router;
