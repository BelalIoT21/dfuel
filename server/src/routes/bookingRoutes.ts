
import express from 'express';
import { 
  createBooking, 
  getUserBookings, 
  getBookingById, 
  updateBookingStatus, 
  cancelBooking,
  getAllBookings,
  deleteBooking
} from '../controllers/bookingController';
import { protect, admin } from '../middleware/authMiddleware';
import { body, param } from 'express-validator';

const router = express.Router();

// Configure middleware for handling large requests
const jsonParser = express.json({ limit: '10mb' });

// Create booking
router.post(
  '/',
  protect,
  jsonParser,
  [
    body('machineId').notEmpty().withMessage('Machine ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required')
  ],
  createBooking
);

// Get user bookings
router.get('/', protect, getUserBookings);

// Get all bookings (admin only)
router.get('/all', protect, admin, getAllBookings);

// Get booking by ID
router.get('/:id', protect, getBookingById);

// Update booking status (admin only)
router.put(
  '/:id/status',
  protect,
  admin,
  jsonParser,
  [
    param('id').notEmpty().withMessage('Booking ID is required'),
    body('status').isIn(['Pending', 'Approved', 'Completed', 'Canceled', 'Rejected']).withMessage('Valid status is required')
  ],
  updateBookingStatus
);

// Cancel booking
router.put('/:id/cancel', protect, jsonParser, cancelBooking);

// Delete booking (admin only)
router.delete('/:id', protect, admin, deleteBooking);

export default router;
