
import express from 'express';
import {
  registerUser,
  loginUser,
  logout,
  updateProfile
} from '../controllers/auth/authController';
import { changePassword } from '../controllers/auth/passwordController';
import { getUserProfile, getUserBookings, deleteUserBooking } from '../controllers/auth/profileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// User registration and authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

// Password management - only change password functionality
router.post('/change-password', protect, changePassword);

// Profile and bookings routes
router.get('/profile', protect, getUserProfile);
router.get('/bookings', protect, getUserBookings);
router.delete('/bookings/:id', protect, deleteUserBooking);

export default router;
