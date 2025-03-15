
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB, checkDbConnection } from './config/db';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { ensureAdminUser } from './controllers/auth/adminController'; // Import admin seeder

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

// Initialize app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(morgan('dev'));
app.use(cookieParser());

// Root health check endpoint (quick response, no DB check)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running'
  });
});

// Health check endpoint (root level)
app.get('/health', (req, res) => {
  const dbStatus = checkDbConnection();
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    database: dbStatus
  });
});

// Connect to MongoDB
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Check connection after connecting
    const dbStatus = checkDbConnection();
    if (!dbStatus.connected) {
      console.error(`Failed to connect to MongoDB. Current state: ${dbStatus.state}`);
    } else {
      // Ensure admin user exists
      await ensureAdminUser();
    }
    
    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/machines', machineRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/certifications', certificationRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/health', healthRoutes);

    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`MongoDB connection status: ${dbStatus.state}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
