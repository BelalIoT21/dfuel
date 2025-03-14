
import express from 'express';
import { getDashboardData, updateAdminCredentials, seedAdminUser } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get dashboard data
router.get('/dashboard', protect, admin, getDashboardData);

// Update admin credentials
router.put('/credentials', protect, admin, updateAdminCredentials);

// Seed admin user (only available during setup)
router.post('/seed', seedAdminUser);

export default router;
