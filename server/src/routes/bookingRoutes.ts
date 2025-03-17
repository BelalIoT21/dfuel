
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

// Create booking
router.post(
  '/',
  protect,
  [
    body('machineId').notEmpty().withMessage('Machine ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('userName').optional(),
    body('machineName').optional()
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
    param('id').notEmpty().withMessage('Booking ID is required'),
    body('status').isIn(['Pending', 'Approved', 'Completed', 'Canceled', 'Rejected']).withMessage('Valid status is required')
  ],
  updateBookingStatus
);

// Cancel booking
router.put('/:id/cancel', protect, cancelBooking);

// Delete booking (admin only)
router.delete('/:id', protect, deleteBooking);

export default router;
