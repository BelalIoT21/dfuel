
import express from 'express';
import { body } from 'express-validator';
import { 
  getMachines, 
  getMachineById, 
  updateMachine, 
  deleteMachine, 
  updateMachineStatus 
} from '../controllers/machineController';
import { protect, admin } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for sensitive endpoints
const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { 
    message: 'Too many machine status updates. Please wait 15 minutes before trying again.',
    error: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Get all machines
router.get('/', getMachines);

// Get machine by ID
router.get('/:id', getMachineById);

// Update machine (admin only)
router.put(
  '/:id',
  protect,
  admin,
  updateLimiter, // Apply rate limiting
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('status').isIn(['Available', 'Maintenance', 'Out of Order']).withMessage('Valid status is required'),
  ],
  updateMachine
);

// Update machine status (admin only)
router.put(
  '/:id/status',
  protect,
  admin,
  updateLimiter, // Apply rate limiting
  [
    body('status').isString().withMessage('Status must be a string'),
    body('maintenanceNote').optional().isString().withMessage('Note must be a string'),
  ],
  updateMachineStatus
);

// Delete machine (admin only)
router.delete('/:id', protect, admin, updateLimiter, deleteMachine);

export default router;
