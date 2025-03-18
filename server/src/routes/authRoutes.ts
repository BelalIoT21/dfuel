
import express from 'express';
import {
  registerUser,
  loginUser,
  logout,
  getMe,
  updateProfile,
  getUserProfile,
  getUserBookings,
  deleteUserBooking
} from '../controllers/auth/authController';
import { changePassword } from '../controllers/auth/passwordController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// User registration and authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Password management
router.post('/change-password', protect, changePassword);

// Profile and bookings routes
router.get('/profile', protect, getUserProfile);
router.get('/bookings', protect, getUserBookings);
router.delete('/bookings/:id', protect, deleteUserBooking);

export default router;
