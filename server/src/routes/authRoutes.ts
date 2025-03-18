
import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  resetPassword,
  verifyResetToken,
  updatePassword
} from '../controllers/auth/authController';
import { getUserProfile, getUserBookings, deleteUserBooking } from '../controllers/auth/profileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// User registration and authentication
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Password reset
router.post('/reset-password', resetPassword);
router.post('/verify-reset-token', verifyResetToken);
router.post('/update-password', updatePassword);

// Profile and bookings routes
router.get('/profile', protect, getUserProfile);
router.get('/bookings', protect, getUserBookings);
router.delete('/bookings/:id', protect, deleteUserBooking);

export default router;
