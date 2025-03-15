
import express from 'express';
import { 
  getMachines, 
  getMachineById, 
  createMachine, 
  updateMachine, 
  deleteMachine, 
  updateMachineStatus 
} from '../controllers/machineController';
import { protect, admin } from '../middleware/authMiddleware';
import { body } from 'express-validator';

const router = express.Router();

// Get all machines
router.route('/').get(getMachines);

// Get machine by ID
router.route('/:id').get(getMachineById);

// Create machine (admin only)
router.route('/').post(
  protect,
  admin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  createMachine
);

// Update machine (admin only)
router.route('/:id').put(protect, admin, updateMachine);

// Update machine status (admin only)
router.route('/:id/status').put(
  protect,
  admin,
  [
    body('status').isIn(['Available', 'Maintenance', 'Out of Order']).withMessage('Valid status is required')
  ],
  updateMachineStatus
);

// Delete machine (admin only)
router.route('/:id').delete(protect, admin, deleteMachine);

export default router;
