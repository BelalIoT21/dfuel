
import express from 'express';
import { getUsers, getUserById, updateUserProfile, updateUser, changePassword, deleteUser, getCurrentUser } from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';
import { body } from 'express-validator';

const router = express.Router();

// Get current user profile
router.get('/me', protect, getCurrentUser);

// Get all users (admin only)
router.get('/', protect, admin, getUsers);

// Get user by ID (admin only)
router.get('/:id', protect, admin, getUserById);

// Update user profile
router.put(
  '/profile', 
  protect,
  [
    body('name').optional(),
    body('email').optional().isEmail().withMessage('Please provide a valid email')
  ],
  updateUserProfile
);

// Update user (admin only)
router.put(
  '/:id',
  protect,
  admin,
  [
    body('name').optional(),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('isAdmin').optional().isBoolean()
  ],
  updateUser
);

// Change password
router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  changePassword
);

// Delete user (admin only)
router.delete('/:id', protect, admin, deleteUser);

export default router;
