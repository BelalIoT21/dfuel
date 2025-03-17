
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { SeedService } from './utils/seed';
import { createAdminUser } from './controllers/adminController'; // Ensure this import is correct

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

// Connect to MongoDB
connectDB().then(async () => {
  // Ensure admin user exists
  console.log('Ensuring admin user exists...');
  try {
    await createAdminUser();
    console.log('Admin user seeding completed.');
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }

  // Seed the database after connection (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Checking if database needs seeding...');
    try {
      await SeedService.seedDatabase();
      console.log('Database seeding completed (if needed)');
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  }
});

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS configuration with specific allowed origins
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins - add your frontend URL here
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:3000',
      'https://localhost:8080',
      'https://localhost:3000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:3000'
    ];
    
    // Check if the request origin is in the allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`Allowing CORS for origin: ${origin}`);
    }
    
    // Always allow all origins in development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(morgan('dev'));
app.use(cookieParser());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from ${req.ip}`);
  if (req.method !== 'GET') {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// CORS preflight response for all routes
app.options('*', cors());

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
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export default app;
