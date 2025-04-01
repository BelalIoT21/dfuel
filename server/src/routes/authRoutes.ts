
import express from 'express';
import {
  registerUser,
  loginUser,
} from '../controllers/authController';
import { changePassword } from '../controllers/auth/passwordController';
import { protect } from '../middleware/authMiddleware';
import { getUserProfile, getUserBookings, deleteUserBooking } from '../controllers/auth/profileController';

const router = express.Router();

// User registration and authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile); // Changed from getMe to getUserProfile

// Password management - only change password functionality
router.post('/change-password', protect, changePassword);

// Profile and bookings routes
router.get('/profile', protect, getUserProfile);
router.get('/bookings', protect, getUserBookings);
router.delete('/bookings/:id', protect, deleteUserBooking);

export default router;
