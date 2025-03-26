
import express from 'express';
import { body } from 'express-validator';
import { 
  getMachines, 
  getMachineById, 
  createMachine,
  updateMachine, 
  deleteMachine, 
  updateMachineStatus,
  getMachineStatus 
} from '../controllers/machineController';
import { protect, admin } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Configure middleware for handling large uploads (50MB limit)
const jsonParser = express.json({ limit: '50mb' });
const urlencodedParser = express.urlencoded({ limit: '50mb', extended: true });

// Rate limiting for sensitive endpoints
const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased from 5 to 50 requests per windowMs
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

// Create new machine (admin only)
router.post(
  '/',
  protect,
  admin,
  jsonParser, // Apply larger payload limit
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  createMachine
);

// Get machine by ID
router.get('/:id', getMachineById);

// Get machine status
router.get('/:id/status', getMachineStatus);

// Update machine (admin only) - Removed rate limiter
router.put(
  '/:id',
  protect,
  admin,
  jsonParser, // Apply larger payload limit
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('status').isIn(['Available', 'Maintenance', 'Out of Order', 'In Use']).withMessage('Valid status is required'),
  ],
  updateMachine
);

// Update machine status (admin only) - Reduced rate limiting
router.put(
  '/:id/status',
  protect,
  admin,
  jsonParser, // Apply larger payload limit
  [
    body('status').isString().withMessage('Status must be a string'),
    body('maintenanceNote').optional().isString().withMessage('Note must be a string'),
  ],
  updateMachineStatus
);

// Delete machine (admin only)
router.delete('/:id', protect, admin, deleteMachine);

export default router;
