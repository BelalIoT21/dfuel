
import express from 'express';
import { 
  getMachines, 
  getMachineById, 
  updateMachineStatus 
} from '../controllers/machineController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all machines
router.route('/').get(getMachines);

// Get machine by ID
router.route('/:id').get(getMachineById);

// Update machine status (admin only)
router.route('/:id/status').put(protect, admin, updateMachineStatus);

export default router;
