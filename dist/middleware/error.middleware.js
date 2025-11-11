"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("@/utils/logger");
const enums_1 = require("@/types/enums");
const errors_1 = require("@/utils/errors");
const zod_1 = require("zod");
class AppError extends Error {
    constructor(message, statusCode = enums_1.HttpStatus.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (error, req, res, next) => {
    let statusCode = enums_1.HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof errors_1.NotFoundError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof errors_1.ValidationError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof errors_1.ConflictError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof zod_1.ZodError) {
        statusCode = enums_1.HttpStatus.BAD_REQUEST;
        const validationErrors = error.errors.map((err) => {
            const field = err.path.join('.');
            return `${field}: ${err.message}`;
        });
        message = validationErrors.join(', ');
    }
    else if (error.name === 'ZodError') {
        statusCode = enums_1.HttpStatus.BAD_REQUEST;
        message = error.message;
    }
    else if (error.name === 'CastError') {
        statusCode = enums_1.HttpStatus.BAD_REQUEST;
        message = 'Invalid ID format';
    }
    else if (error.message.includes('unique constraint')) {
        statusCode = enums_1.HttpStatus.CONFLICT;
        message = 'Resource already exists';
    }
    logger_1.logger.error(`${req.method} ${req.path} - ${statusCode}`, {
        message: error.message,
        stack: error.stack,
        body: req.body,
        params: req.params,
        query: req.query
    });
    const response = {
        success: false,
        error: message,
    };
    if (process.env.NODE_ENV === 'development' &&
        !(error instanceof zod_1.ZodError) &&
        !(error instanceof errors_1.ValidationError) &&
        !(error instanceof errors_1.ConflictError) &&
        !(error instanceof errors_1.NotFoundError)) {
        response.stack = error.stack;
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const message = `Route ${req.method} ${req.path} not found`;
    logger_1.logger.warn(message);
    const response = {
        success: false,
        error: message
    };
    res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map