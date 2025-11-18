/**
 * Standardized API response utilities
 */

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function successResponse<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: any
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };

  return res.status(statusCode).json(response);
}

export function handleApiError(err: any, res: Response): Response {
  if (err instanceof ApiError) {
    return errorResponse(res, err.statusCode, err.message, err.code, err.details);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return errorResponse(res, 400, 'Validation error', 'VALIDATION_ERROR', err.errors);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return errorResponse(res, 409, 'Resource already exists', 'DUPLICATE_ERROR');
  }

  if (err.code === 'P2025') {
    return errorResponse(res, 404, 'Resource not found', 'NOT_FOUND');
  }

  // Default error
  console.error('Unhandled error:', err);
  return errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
}
