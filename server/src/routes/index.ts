import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import machineRoutes from './machineRoutes';
import quizRoutes from './quizRoutes';
import bookingRoutes from './bookingRoutes';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/machines', machineRoutes);
router.use('/quizzes', quizRoutes);
router.use('/bookings', bookingRoutes);

export default router; 