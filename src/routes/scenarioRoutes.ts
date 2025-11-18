/**
 * Scenario routes
 */

import { Router } from 'express';
import { scenarioController } from '../controllers/scenarioController';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createScenarioSchema,
  updateScenarioSchema,
  paginationSchema
} from '../validation/schemas';

const router = Router();

router.post(
  '/',
  validateBody(createScenarioSchema),
  scenarioController.create.bind(scenarioController)
);

router.get(
  '/',
  validateQuery(paginationSchema),
  scenarioController.findAll.bind(scenarioController)
);

router.get(
  '/:id',
  scenarioController.findById.bind(scenarioController)
);

router.patch(
  '/:id',
  validateBody(updateScenarioSchema),
  scenarioController.update.bind(scenarioController)
);

router.delete(
  '/:id',
  scenarioController.delete.bind(scenarioController)
);

export default router;
