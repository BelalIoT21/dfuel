
import express from 'express';
import { registerUser, forgotPassword, resetPassword, getUserProfile } from '../controllers/authController';
import { loginUser } from '../controllers/auth/loginController';
import { protect } from '../middleware/authMiddleware';
import { body } from 'express-validator';
import { User } from '../models/User';

const router = express.Router();

// Debug endpoint to test the auth routes
router.get('/debug', (req, res) => {
  console.log('Auth routes are working');
  res.json({ message: 'Auth routes are working' });
});

// Register user
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  registerUser
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  loginUser
);

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('resetCode').notEmpty().withMessage('Reset code is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  resetPassword
);

// Get user profile
router.get('/me', protect, getUserProfile);

// Get user count - public endpoint for the login screen
router.get('/user-count', async (req, res) => {
  try {
    const count = await User.countDocuments({});
    res.json({ count });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
