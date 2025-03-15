
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { seedDatabase } from './utils/seed';  // Import the seed utility
import { ensureAdminUser } from './controllers/auth/adminController'; // Import admin seeder
import { 
  requestLogger, 
  apiLogger, 
  fileLogger, 
  setupGlobalErrorLogging 
} from './utils/logger'; // Import our enhanced logger

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import machineRoutes from './routes/machineRoutes';
import bookingRoutes from './routes/bookingRoutes';
import certificationRoutes from './routes/certificationRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';

// Load environment variables
dotenv.config();

// Setup global error logging
setupGlobalErrorLogging();

// Connect to MongoDB
connectDB().then(async () => {
  console.log('MongoDB connected successfully');
  
  // Ensure admin user exists
  await ensureAdminUser();
  
  // Seed the database after connection
  if (process.env.NODE_ENV !== 'production') {
    console.log('Seeding database with initial data...');
    seedDatabase()
      .then(() => console.log('Database seeded successfully!'))
      .catch(err => console.error('Error seeding database:', err));
  }
})
.catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(requestLogger); // Console request logging
app.use(fileLogger); // File request logging
app.use(cookieParser());
app.use(apiLogger); // Add detailed API logging

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);

// Health check endpoint (root level)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Log all API routes for debugging
console.log('Registered API routes:');
// Define explicit types for middleware and handler
app._router.stack.forEach((middleware: {
  route?: { path: string },
  name?: string,
  handle?: { 
    stack: Array<{
      route?: { 
        path: string, 
        stack: Array<{ method: string }>
      }
    }>
  },
  regexp?: { toString: () => string }
}) => {
  if (middleware.route) {
    console.log(`Route: ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle?.stack.forEach((handler: {
      route?: { 
        path: string, 
        stack: Array<{ method: string }>
      }
    }) => {
      if (handler.route) {
        console.log(`${handler.route.stack[0].method.toUpperCase()} /api${middleware.regexp?.toString().split('/')[1].replace('\\', '')}${handler.route.path}`);
      }
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
  console.log(`Logs are being saved to ./logs directory`);
});

export default app;

