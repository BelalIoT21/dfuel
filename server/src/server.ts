
import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorMiddleware';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import bookingRoutes from './routes/bookingRoutes';
import machineRoutes from './routes/machineRoutes';
import courseRoutes from './routes/courseRoutes';
import quizRoutes from './routes/quizRoutes';
import certificationRoutes from './routes/certificationRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';

// Connect to MongoDB
connectDB();

const app = express();

// Enable middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// Serve static files from the server/src/public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/machine', machineRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/cert', certificationRoutes);
app.use('/api/admin', adminRoutes);

// Handle 404s for API routes
app.use('/api/*', (req, res) => {
  console.log(`API 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'API endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
