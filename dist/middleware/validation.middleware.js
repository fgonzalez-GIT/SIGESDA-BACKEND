"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.validateParams = exports.validateQuery = exports.validate = void 0;
const zod_1 = require("zod");
const error_middleware_1 = require("./error.middleware");
const enums_1 = require("@/types/enums");
const logger_1 = require("@/utils/logger");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                logger_1.logger.warn('Validation failed', {
                    path: req.path,
                    errors: error.errors
                });
                throw new error_middleware_1.AppError(`Validation failed: ${errorMessages}`, enums_1.HttpStatus.BAD_REQUEST);
            }
            next(error);
        }
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                throw new error_middleware_1.AppError(`Query validation failed: ${errorMessages}`, enums_1.HttpStatus.BAD_REQUEST);
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new error_middleware_1.AppError('Invalid URL parameters', enums_1.HttpStatus.BAD_REQUEST);
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
exports.commonSchemas = {
    id: zod_1.z.object({
        id: zod_1.z.string().cuid('Invalid ID format')
    }),
    pagination: zod_1.z.object({
        page: zod_1.z.string().optional().default('1').transform(Number),
        limit: zod_1.z.string().optional().default('20').transform(Number),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('asc')
    }),
    dateRange: zod_1.z.object({
        fechaDesde: zod_1.z.string().datetime().optional(),
        fechaHasta: zod_1.z.string().datetime().optional()
    }).refine(data => {
        if (data.fechaDesde && data.fechaHasta) {
            return new Date(data.fechaDesde) <= new Date(data.fechaHasta);
        }
        return true;
    }, {
        message: "fechaDesde must be before fechaHasta"
    })
};
//# sourceMappingURL=validation.middleware.js.map