
import express from 'express';
import { getHealth } from '../controllers/healthController';

const router = express.Router();

// Set CORS headers specifically for health check
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Get system health status - used for connectivity checks
router.get('/', getHealth);

export default router;
