"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("@/config/env");
const logger_1 = require("@/utils/logger");
const error_middleware_1 = require("@/middleware/error.middleware");
const enums_1 = require("@/types/enums");
const database_1 = __importDefault(require("@/config/database"));
const routes_1 = __importDefault(require("@/routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.com']
        : true,
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    const start = Date.now();
    logger_1.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.method !== 'GET' ? req.body : undefined
    });
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;
        logger_1.logger.request(req.method, req.path, res.statusCode, duration);
        return originalEnd.call(this, chunk, encoding);
    };
    next();
});
app.get('/health', async (req, res) => {
    try {
        const dbHealthy = await database_1.default.healthCheck();
        const response = {
            success: true,
            data: {
                status: 'OK',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
                environment: env_1.env.NODE_ENV,
                database: dbHealthy ? 'connected' : 'disconnected'
            }
        };
        res.status(enums_1.HttpStatus.OK).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Service unavailable'
        };
        res.status(enums_1.HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
});
app.get('/', (req, res) => {
    const response = {
        success: true,
        data: {
            name: 'SIGESDA Backend API',
            description: 'Sistema de Gestión de Asociación Musical',
            version: '1.0.0',
            documentation: '/api/docs',
            endpoints: {
                health: '/health',
                api: '/api'
            }
        }
    };
    res.status(enums_1.HttpStatus.OK).json(response);
});
app.use('/api', routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map