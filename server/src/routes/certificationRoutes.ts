
import express from 'express';
import { 
  addCertification, 
  removeCertification, 
  getUserCertifications,
  checkCertification,
  completeSafetyCourse,
  checkSafetyCourse
} from '../controllers/certificationController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Add certification - allow both regular users and admins
router.post('/', protect, addCertification);

// Complete safety course
router.post('/safety-course', protect, completeSafetyCourse);

// Remove certification (admin only)
router.delete('/', protect, admin, removeCertification);

// Get user certifications (admin only)
router.get('/user/:userId', protect, admin, getUserCertifications);

// Check if user has certification
router.get('/check', protect, checkCertification);

// Check if user has completed safety course
router.get('/safety-course/check', protect, checkSafetyCourse);

export default router;
