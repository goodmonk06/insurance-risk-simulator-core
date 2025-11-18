/**
 * Error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { handleApiError } from '../utils/apiResponse';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  handleApiError(err, res);
}
