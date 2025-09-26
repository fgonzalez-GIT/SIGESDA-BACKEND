import app from './app';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import DatabaseService from '@/config/database';

async function startServer() {
  try {
    // Connect to database
    await DatabaseService.connect();
    logger.info('Database connection established');

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`📖 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 Health check: http://localhost:${env.PORT}/health`);
      logger.info(`📊 API info: http://localhost:${env.PORT}/`);

      if (env.NODE_ENV === 'development') {
        logger.info(`🔍 Database Studio: Run 'npm run db:studio' to open Prisma Studio`);
      }
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('🔌 HTTP server closed');

        try {
          await DatabaseService.disconnect();
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close server after 10 seconds
      setTimeout(() => {
        logger.error('⏰ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('🚨 Unhandled Rejection at:', { promise, reason });
      process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('🚨 Uncaught Exception thrown:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();