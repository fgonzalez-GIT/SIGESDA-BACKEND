"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ValidationError = exports.NotFoundError = void 0;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
        this.isOperational = true;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.isOperational = true;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
        this.isOperational = true;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=errors.js.map