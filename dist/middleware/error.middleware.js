"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("@/utils/logger");
const enums_1 = require("@/types/enums");
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
    else if (error.name === 'ValidationError') {
        statusCode = enums_1.HttpStatus.BAD_REQUEST;
        message = 'Validation Error';
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
    if (process.env.NODE_ENV === 'development') {
        response.error = error.message;
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