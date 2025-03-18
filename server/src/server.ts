
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import machineRoutes from './routes/machineRoutes';
import bookingRoutes from './routes/bookingRoutes';
import certificationRoutes from './routes/certificationRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';

// Import error middleware
import { errorHandler, notFound } from './middleware/errorMiddleware';

// Import database connection
import { connectDB } from './config/db';

// Import machine check function
import { checkAndSeedMachines } from './controllers/machineController';

// Connect to MongoDB database
connectDB();

// Initialize Express app
const app = express();

// Set up global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply rate limiter to all requests
app.use(limiter);

// Set up middleware
app.use(morgan('dev')); // Logging middleware
app.use(express.json()); // Body parsing middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Log the request origin
    console.log('Request origin:', origin);
    
    // Allow all origins
    return callback(null, true);
  },
  credentials: true
})); // CORS middleware
app.use(helmet({ contentSecurityPolicy: false })); // Security headers middleware

// Set up API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  // Any route that is not an API route should be handled by React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
} else {
  // In development, return a simple message for the root route
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Set up error handling middleware
app.use(notFound);
app.use(errorHandler);

// Define port
const PORT = process.env.PORT || 4000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  
  // Check and seed machines if needed
  checkAndSeedMachines()
    .then(() => console.log('Machine check completed'))
    .catch(err => console.error('Error during machine check:', err));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
