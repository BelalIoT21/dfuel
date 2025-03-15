
import express from 'express';
import { healthCheck } from '../controllers/healthController';

const router = express.Router();

// Full health check endpoint
router.get('/', healthCheck);

export default router;
