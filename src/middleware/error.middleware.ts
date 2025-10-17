import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { HttpStatus } from '@/types/enums';
import { ApiResponse } from '@/types/interfaces';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { ZodError } from 'zod';

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
  } else if (error instanceof NotFoundError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ValidationError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = HttpStatus.BAD_REQUEST;
    // Format Zod validation errors into user-friendly messages
    const validationErrors = error.errors.map((err) => {
      const field = err.path.join('.');
      return `${field}: ${err.message}`;
    });
    message = validationErrors.join(', ');
  } else if (error.name === 'ZodError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = error.message;
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

  // Add stack trace in development (but not for validation/business logic errors)
  if (process.env.NODE_ENV === 'development' &&
      !(error instanceof ZodError) &&
      !(error instanceof ValidationError) &&
      !(error instanceof ConflictError) &&
      !(error instanceof NotFoundError)) {
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