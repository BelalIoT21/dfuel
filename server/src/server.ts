import express, { Request } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { seedDatabase } from './utils/seed';
import { ensureAdminUser } from './controllers/auth/adminController';

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
  await ensureAdminUser();
  
  // Seed the database after connection
  if (process.env.NODE_ENV !== 'production') {
    console.log('Seeding database with initial data...');
    seedDatabase()
      .then(() => console.log('Database seeded successfully!'))
      .catch(err => console.error('Error seeding database:', err));
  }
});

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allowed origins for CORS - ensure all possible origins are included
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://learnit-client.vercel.app', 
  'https://lovableproject.com',
  // Allow any subdomain of lovableproject.com
  /^https:\/\/[\w-]+\.lovableproject\.com$/
];

// Extend the Request interface to include requestId and timestamp
declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
    timestamp?: string;
  }
}

// Custom request logger middleware
app.use((req: Request, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(2, 10);
  
  // Add request ID and timestamp to the request object for later use
  req.requestId = requestId;
  req.timestamp = timestamp;
  
  // Log the incoming request
  console.log(`[${timestamp}] 📥 ${requestId} ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || 'unknown'} - IP: ${req.ip}`);
  
  // Log request headers if in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${timestamp}] 📝 ${requestId} Headers:`, req.headers);
  }
  
  // Log request body for POST/PUT/PATCH requests, excluding sensitive routes
  const sensitiveRoutes = ['/api/auth/login', '/api/auth/register', '/api/users/password'];
  const isSensitiveRoute = sensitiveRoutes.some(route => req.originalUrl.includes(route));
  
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !isSensitiveRoute && req.body && process.env.NODE_ENV === 'development') {
    console.log(`[${timestamp}] 📦 ${requestId} Request Body:`, JSON.stringify(req.body, null, 2));
  }
  
  // Log response when completed
  res.on('finish', () => {
    const duration = Date.now() - new Date(timestamp).getTime();
    const statusCode = res.statusCode;
    const statusSymbol = statusCode >= 200 && statusCode < 300 ? '✅' : '❌';
    
    console.log(`[${new Date().toISOString()}] 📤 ${requestId} ${req.method} ${req.originalUrl} - ${statusSymbol} ${statusCode} - ${duration}ms`);
  });
  
  next();
});

// CORS configuration with more permissive settings for development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      console.log('Request with no origin allowed');
      return callback(null, true);
    }
    
    console.log('Request origin:', origin);
    
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      console.log(`Origin ${origin} is allowed by CORS policy`);
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      // In development, allow all origins
      console.log(`Origin ${origin} allowed in development mode`);
      callback(null, true);
    } else {
      console.log(`Origin ${origin} blocked by CORS policy`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add CORS preflight response
app.options('*', cors());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));

// HTTP request logger
app.use(morgan((tokens, req, res) => {
  // Only use morgan for non-API routes to avoid duplication
  if (!req.originalUrl.startsWith('/api/')) {
    return [
      `[${new Date().toISOString()}]`,
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens['response-time'](req, res), 'ms'
    ].join(' ');
  }
  return null;
}));

app.use(cookieParser());

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
  console.log(`Available at http://localhost:${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});

export default app;
