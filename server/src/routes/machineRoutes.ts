
import express from 'express';
import { 
  getMachines, 
  getMachineById, 
  updateMachine, 
  deleteMachine, 
  updateMachineStatus 
} from '../controllers/machineController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all machines
router.route('/').get(getMachines);

// Get machine by ID
router.route('/:id').get(getMachineById);

// Update machine (admin only)
router.route('/:id').put(protect, admin, updateMachine);

// Update machine status (admin only)
router.route('/:id/status').put(
  protect,
  admin,
  updateMachineStatus
);

// Delete machine (admin only)
router.route('/:id').delete(protect, admin, deleteMachine);

export default router;
