
import express from 'express';
import {
  registerUser,
  loginUser,
  logout,
  updateProfile,
  getUserProfile,
  getUserBookings,
  deleteUserBooking,
  changePassword
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// User registration and authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);

// User profile
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

// Password management
router.post('/change-password', protect, changePassword);

// Bookings management
router.get('/bookings', protect, getUserBookings);
router.delete('/bookings/:id', protect, deleteUserBooking);

export default router;
