"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("@/config/env");
const logger_1 = require("@/utils/logger");
const database_1 = __importDefault(require("@/config/database"));
async function startServer() {
    try {
        await database_1.default.connect();
        logger_1.logger.info('Database connection established');
        const server = app_1.default.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${env_1.env.PORT}`);
            logger_1.logger.info(`📖 Environment: ${env_1.env.NODE_ENV}`);
            logger_1.logger.info(`🌐 Health check: http://localhost:${env_1.env.PORT}/health`);
            logger_1.logger.info(`📊 API info: http://localhost:${env_1.env.PORT}/`);
            if (env_1.env.NODE_ENV === 'development') {
                logger_1.logger.info(`🔍 Database Studio: Run 'npm run db:studio' to open Prisma Studio`);
            }
        });
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);
            server.close(async () => {
                logger_1.logger.info('🔌 HTTP server closed');
                try {
                    await database_1.default.disconnect();
                    logger_1.logger.info('✅ Graceful shutdown completed');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.logger.error('❌ Error during shutdown:', error);
                    process.exit(1);
                }
            });
            setTimeout(() => {
                logger_1.logger.error('⏰ Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error('🚨 Unhandled Rejection at:', { promise, reason });
            process.exit(1);
        });
        process.on('uncaughtException', (error) => {
            logger_1.logger.error('🚨 Uncaught Exception thrown:', error);
            process.exit(1);
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map