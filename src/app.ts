import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import DatabaseService from '@/config/database';
import { setupSwagger } from '@/config/swagger';

// Import routes
import routes from '@/routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com'] // Update with actual frontend URLs
    : true, // Allow all origins in development
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): any {
    const duration = Date.now() - start;
    logger.request(req.method, req.path, res.statusCode, duration);
    return originalEnd.call(this, chunk, encoding);
  };

  next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await DatabaseService.healthCheck();

    const response: ApiResponse = {
      success: true,
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: env.NODE_ENV,
        database: dbHealthy ? 'connected' : 'disconnected'
      }
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Service unavailable'
    };

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }
});

// API info endpoint
app.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      name: 'SIGESDA Backend API',
      description: 'Sistema de Gestión de Asociación Musical',
      version: '2.0.0',
      documentation: '/api-docs',
      endpoints: {
        health: '/health',
        api: '/api',
        docs: '/api-docs',
        docsJson: '/api-docs.json'
      }
    }
  };

  res.status(HttpStatus.OK).json(response);
});

// Setup Swagger documentation
setupSwagger(app);

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;