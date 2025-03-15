
import express from 'express';
import { registerUser, getUserProfile } from '../controllers/authController';
import { loginUser } from '../controllers/auth/loginController';
import { protect } from '../middleware/authMiddleware';
import { body } from 'express-validator';

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

// Get user profile
router.get('/me', protect, getUserProfile);

export default router;
