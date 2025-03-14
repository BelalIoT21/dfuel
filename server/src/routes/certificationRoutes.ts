
import express from 'express';
import { 
  addCertification, 
  removeCertification, 
  getUserCertifications,
  checkCertification
} from '../controllers/certificationController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Add certification - allow both regular users and admins
router.post('/', protect, addCertification);

// Add safety course completion - allow both regular users and admins
router.post('/safety-course', protect, addCertification);

// Remove certification (admin only)
router.delete('/', protect, admin, removeCertification);

// Get user certifications (admin only)
router.get('/user/:userId', protect, admin, getUserCertifications);

// Check if user has certification
router.get('/check', protect, checkCertification);

export default router;
