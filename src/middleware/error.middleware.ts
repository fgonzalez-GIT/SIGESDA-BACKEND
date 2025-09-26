import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { HttpStatus } from '@/types/enums';
import { ApiResponse } from '@/types/interfaces';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid ID format';
  } else if (error.message.includes('unique constraint')) {
    statusCode = HttpStatus.CONFLICT;
    message = 'Resource already exists';
  }

  // Log the error
  logger.error(`${req.method} ${req.path} - ${statusCode}`, {
    message: error.message,
    stack: error.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Prepare response
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error = error.message;
    (response as any).stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const message = `Route ${req.method} ${req.path} not found`;
  logger.warn(message);

  const response: ApiResponse = {
    success: false,
    error: message
  };

  res.status(HttpStatus.NOT_FOUND).json(response);
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};