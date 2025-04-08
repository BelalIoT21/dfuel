
import express from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, restoreCourse, backupCourse } from '../controllers/courseController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Configure middleware for handling large uploads (250MB limit - reduced from 500MB to prevent timeouts)
const jsonParser = express.json({ limit: '250mb' });

// Get all courses
router.get('/', getCourses);

// Get course by ID
router.get('/:id', getCourseById);

// Create new course (admin only)
router.post('/', protect, admin, jsonParser, createCourse);

// Update course (admin only)
router.put('/:id', protect, admin, jsonParser, updateCourse);

// Delete course (admin only)
router.delete('/:id', protect, admin, deleteCourse);

// New endpoint to restore a deleted course
router.post('/:id/restore', protect, admin, jsonParser, restoreCourse);

// New endpoint to backup a course
router.post('/:id/backup', protect, admin, jsonParser, backupCourse);

export default router;
