
import express from 'express';
import { body } from 'express-validator';
import { 
  getMachines, 
  getMachineById, 
  createMachine,
  updateMachine, 
  deleteMachine, 
  updateMachineStatus,
  getMachineStatus,
  restoreMachine,
  backupMachine 
} from '../controllers/machineController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Configure middleware for handling large uploads (50MB limit)
const jsonParser = express.json({ limit: '50mb' });
const urlencodedParser = express.urlencoded({ limit: '50mb', extended: true });

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

// Update machine status (admin only) - Removed rate limiting
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

// Delete machine (admin only) - Support permanent deletion via query parameter
// Now also supports hardDelete for complete removal from database
router.delete('/:id', protect, admin, deleteMachine);

// New endpoint to restore a deleted machine
router.post('/:id/restore', protect, admin, jsonParser, restoreMachine);

// New endpoint to backup a machine
router.post('/:id/backup', protect, admin, jsonParser, [
  body('backupData').notEmpty().withMessage('Backup data is required')
], backupMachine);

export default router;
