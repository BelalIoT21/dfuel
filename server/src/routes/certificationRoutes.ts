
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

// Configure middleware for handling large uploads
const jsonParser = express.json({ limit: '50mb' });

// Add certification
router.post('/', protect, jsonParser, addCertification);

// Remove certification
router.delete('/:userId/:machineId', protect, removeCertification);

// Clear all certifications for a user
router.delete('/user/:userId/clear', protect, clearUserCertifications);

// Get user certifications - remove protect middleware to allow public access
router.get('/user/:userId', getUserCertifications);

// Check certification
router.get('/check/:userId/:machineId', protect, checkCertification);

export default router;
