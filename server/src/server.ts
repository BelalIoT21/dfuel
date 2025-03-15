
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { connectDB } from './config/db';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import certificationRoutes from './routes/certificationRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';
import machineRoutes from './routes/machineRoutes';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/machines', machineRoutes); // Add machines API routes

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
