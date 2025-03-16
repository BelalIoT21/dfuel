
import express from 'express';
import { registerUser, forgotPassword, resetPassword } from '../controllers/authController';
import { loginUser } from '../controllers/auth/loginController';
import { getUserProfile, getUserBookings } from '../controllers/auth/profileController';
import { protect } from '../middleware/authMiddleware';
import { body } from 'express-validator';
import { User } from '../models/User';
import { ensureAdminUser, getAdminInfo } from '../controllers/auth/adminController';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Debug endpoint to test the auth routes
router.get('/debug', (req, res) => {
  console.log('Auth routes are working');
  res.json({ message: 'Auth routes are working' });
});

// Debug endpoint to check admin credentials
router.get('/debug/admin', async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    // Get environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log(`Debug admin credentials - Email: ${adminEmail}, Password: ${adminPassword}`);
    
    // Ensure admin exists
    await ensureAdminUser();
    
    // Get admin info
    const adminInfo = await getAdminInfo();
    
    // Get the admin from database again
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    
    // Test password matching
    const passwordMatch = await adminUser.matchPassword(adminPassword);
    const directBcryptMatch = await bcrypt.compare(adminPassword, adminUser.password);
    
    res.json({
      adminInfo,
      adminExists: !!adminUser,
      passwordTest: {
        storedHash: adminUser.password.substring(0, 20) + '...',
        envPassword: adminPassword,
        modelMethodMatch: passwordMatch,
        directBcryptMatch: directBcryptMatch
      },
      message: 'Admin debug info retrieved'
    });
  } catch (error) {
    console.error('Error in debug admin:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Debug endpoint to check users
router.get('/debug/users', async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    // Ensure admin exists before checking users
    await ensureAdminUser();
    
    // Get all users
    const users = await User.find({}).select('-password');
    const adminUser = await User.findOne({ isAdmin: true }).select('-password');
    
    res.json({ 
      users: users.map(u => ({ 
        _id: u._id, 
        name: u.name, 
        email: u.email, 
        isAdmin: u.isAdmin 
      })), 
      adminUser,
      userCount: users.length
    });
  } catch (error) {
    console.error('Error in debug users:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
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

// Get user bookings
router.get('/bookings', protect, getUserBookings);

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
