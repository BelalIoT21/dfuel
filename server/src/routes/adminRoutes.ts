
import express from 'express';
import { getDashboardData, updateAdminCredentials, seedAdminUser, updateMachineCourseLinks } from '../controllers/admin/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get dashboard data
router.get('/dashboard', protect, admin, getDashboardData);

// Update admin credentials
router.put('/credentials', protect, admin, updateAdminCredentials);

// Seed admin user (only available during setup)
router.post('/seed', seedAdminUser);

// Update all machine course/quiz links
router.post('/update-machine-links', protect, admin, updateMachineCourseLinks);

export default router;
