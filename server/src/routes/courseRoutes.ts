
import express from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } from '../controllers/courseController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

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

export default router;
