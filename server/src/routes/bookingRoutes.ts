
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
import { body, param } from 'express-validator';

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

// Update booking status (admin only) - original endpoint
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

// Alternative update booking status endpoint for client-generated IDs
router.put(
  '/update-status',
  protect,
  admin,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('status').isIn(['Pending', 'Approved', 'Completed', 'Canceled', 'Rejected']).withMessage('Valid status is required')
  ],
  updateBookingStatus
);

// Cancel booking
router.put('/:id/cancel', protect, cancelBooking);

export default router;
