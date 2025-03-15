
import express from 'express';
import { healthCheck } from '../controllers/healthController';

const router = express.Router();

// Full health check endpoint
router.get('/', healthCheck);

// Simple ping endpoint for quick connection checks
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

export default router;
