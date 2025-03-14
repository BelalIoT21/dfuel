
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
router.get('/', getMachines);

// Get machine by ID
router.get('/:id', getMachineById);

// Create machine (admin only)
router.post(
  '/',
  protect,
  admin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Valid difficulty level is required')
  ],
  createMachine
);

// Update machine (admin only)
router.put('/:id', protect, admin, updateMachine);

// Update machine status (admin only)
router.put(
  '/:id/status',
  protect,
  admin,
  [
    body('status').isIn(['Available', 'Maintenance', 'In Use']).withMessage('Valid status is required')
  ],
  updateMachineStatus
);

// Delete machine (admin only)
router.delete('/:id', protect, admin, deleteMachine);

export default router;
