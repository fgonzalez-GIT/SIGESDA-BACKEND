import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from './error.middleware';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');

        logger.warn('Validation failed', {
          path: req.path,
          errors: error.errors
        });

        throw new AppError(
          `Validation failed: ${errorMessages}`,
          HttpStatus.BAD_REQUEST
        );
      }
      next(error);
    }
  };
};

// Query parameters validation
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');

        throw new AppError(
          `Query validation failed: ${errorMessages}`,
          HttpStatus.BAD_REQUEST
        );
      }
      next(error);
    }
  };
};

// Params validation
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(
          'Invalid URL parameters',
          HttpStatus.BAD_REQUEST
        );
      }
      next(error);
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  // ID parameter validation
  id: z.object({
    id: z.string().cuid('Invalid ID format')
  }),

  // Pagination query validation
  pagination: z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('20').transform(Number),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
  }),

  // Date range validation
  dateRange: z.object({
    fechaDesde: z.string().datetime().optional(),
    fechaHasta: z.string().datetime().optional()
  }).refine(data => {
    if (data.fechaDesde && data.fechaHasta) {
      return new Date(data.fechaDesde) <= new Date(data.fechaHasta);
    }
    return true;
  }, {
    message: "fechaDesde must be before fechaHasta"
  })
};