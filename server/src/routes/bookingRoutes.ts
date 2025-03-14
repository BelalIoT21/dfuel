
import express from 'express';
import { 
  createBooking, 
  getUserBookings, 
  getBookingById, 
  updateBookingStatus, 
  cancelBooking,
  getAllBookings
} from '../controllers/bookingController';
import { protect, admin } from '../middleware/authMiddleware';
import { body } from 'express-validator';

const router = express.Router();

// Create booking
router.post(
  '/',
  protect,
  [
    body('machineId').notEmpty().withMessage('Machine ID is required'),
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
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
  [
    body('status').isIn(['Pending', 'Approved', 'Completed', 'Canceled']).withMessage('Valid status is required')
  ],
  updateBookingStatus
);

// Cancel booking
router.put('/:id/cancel', protect, cancelBooking);

export default router;
