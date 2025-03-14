
import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword, getUserProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { body } from 'express-validator';

const router = express.Router();

// Register user
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    // No password validation when registering with Google
    body('password')
      .if(body('googleId').not().exists())
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  registerUser
);

// Google register/sign-in
router.post(
  '/google',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('googleId').notEmpty().withMessage('Google ID is required')
  ],
  registerUser
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    // Skip password validation if googleToken is provided
    body('password')
      .if(body('googleToken').not().exists())
      .notEmpty().withMessage('Password is required')
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

export default router;
