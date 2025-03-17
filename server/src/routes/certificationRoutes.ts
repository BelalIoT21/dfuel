
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { 
  addCertification,
  removeCertification,
  getUserCertifications,
  checkCertification,
  clearUserCertifications
} from '../controllers/certificationController';

const router = express.Router();

// Add certification
router.post('/', protect, addCertification);

// Remove certification (DELETE with params in URL)
router.delete('/:userId/:machineId', protect, removeCertification);

// Clear all certifications for a user
router.delete('/clear/:userId', protect, clearUserCertifications);

// Get user certifications
router.get('/user/:userId', protect, getUserCertifications);

// Check certification
router.get('/check/:userId/:machineId', protect, checkCertification);

export default router;
