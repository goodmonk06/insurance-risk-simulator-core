/**
 * Assessment controller
 */

import { Request, Response, NextFunction } from 'express';
import { assessmentService } from '../services/assessmentService';
import { successResponse } from '../utils/apiResponse';

export class AssessmentController {
  async assessScenario(req: Request, res: Response, next: NextFunction) {
    try {
      const { scenarioId } = req.params;
      const { ruleSetPath } = req.body || {};

      const assessment = await assessmentService.assessScenario(scenarioId, ruleSetPath);
      return successResponse(res, assessment, 201);
    } catch (error) {
      next(error);
    }
  }

  async findByScenarioId(req: Request, res: Response, next: NextFunction) {
    try {
      const { scenarioId } = req.params;
      const assessments = await assessmentService.findByScenarioId(scenarioId);
      return successResponse(res, assessments);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const assessment = await assessmentService.findById(req.params.id);
      return successResponse(res, assessment);
    } catch (error) {
      next(error);
    }
  }
}

export const assessmentController = new AssessmentController();
