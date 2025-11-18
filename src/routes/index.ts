/**
 * API routes
 */

import { Router } from 'express';
import scenarioRoutes from './scenarioRoutes';
import assessmentRoutes from './assessmentRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use('/scenarios', scenarioRoutes);
router.use('/assessments', assessmentRoutes);

export default router;
