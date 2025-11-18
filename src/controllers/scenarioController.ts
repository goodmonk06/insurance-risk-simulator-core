/**
 * Scenario controller
 */

import { Request, Response, NextFunction } from 'express';
import { scenarioService } from '../services/scenarioService';
import { successResponse } from '../utils/apiResponse';
import { PaginationInput } from '../validation/schemas';

export class ScenarioController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const scenario = await scenarioService.create(req.body);
      return successResponse(res, scenario, 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = req.query as unknown as PaginationInput;
      const result = await scenarioService.findAll(pagination);
      return successResponse(res, result.scenarios, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const scenario = await scenarioService.findById(req.params.id);
      return successResponse(res, scenario);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const scenario = await scenarioService.update(req.params.id, req.body);
      return successResponse(res, scenario);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await scenarioService.delete(req.params.id);
      return successResponse(res, { message: 'Scenario deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const scenarioController = new ScenarioController();
