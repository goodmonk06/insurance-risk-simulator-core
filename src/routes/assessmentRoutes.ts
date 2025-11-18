/**
 * Assessment routes
 */

import { Router } from 'express';
import { assessmentController } from '../controllers/assessmentController';

const router = Router();

router.post(
  '/scenarios/:scenarioId/assess',
  assessmentController.assessScenario.bind(assessmentController)
);

router.get(
  '/scenarios/:scenarioId',
  assessmentController.findByScenarioId.bind(assessmentController)
);

router.get(
  '/:id',
  assessmentController.findById.bind(assessmentController)
);

export default router;
