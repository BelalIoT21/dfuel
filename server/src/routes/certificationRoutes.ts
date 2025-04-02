
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
router.delete('/clear/:userId', protect, clearUserCertifications);

// Get user certifications
router.get('/user/:userId', getUserCertifications);

// Check certification
router.get('/check/:userId/:machineId', checkCertification);

export default router;
