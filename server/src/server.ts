import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import machineRoutes from './routes/machineRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';
import bookingRoutes from './routes/bookingRoutes';
import certificationRoutes from './routes/certificationRoutes';
import courseRoutes from './routes/courseRoutes';
import quizRoutes from './routes/quizRoutes';
import { SeedService } from './utils/seed';
import { createAdminUser } from './controllers/admin/adminController';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Serve the images folder for machine images
// First, make the utils/images directory available publicly
const imagesPath = path.join(__dirname, './utils/images');
app.use('/utils/images', express.static(imagesPath));

// Also serve it at an alternative URL for better client compatibility
app.use('/api/utils/images', express.static(imagesPath));

// Set up higher limits for request payload size
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS setup
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow any origin for development
    callback(null, true);
  },
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Create admin user independently to ensure it's done regardless of seed process
console.log('Ensuring admin user exists...');
createAdminUser()
  .then(() => {
    // Seed the database
    return SeedService.seedDatabase();
  })
  .then(() => {
    console.log('Database seeding complete');
  })
  .catch((error) => {
    console.error('Error in startup process:', error);
  });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
