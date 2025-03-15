
import express from 'express';
import { healthCheck, ping } from '../controllers/healthController';

const router = express.Router();

// Health check endpoints
router.get('/', healthCheck);
router.get('/ping', ping);

export default router;
