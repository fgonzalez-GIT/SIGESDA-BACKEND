"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriaSocioQuerySchema = exports.updateCategoriaSocioSchema = exports.createCategoriaSocioSchema = void 0;
const zod_1 = require("zod");
exports.createCategoriaSocioSchema = zod_1.z.object({
    codigo: zod_1.z.string()
        .min(2, 'El código debe tener al menos 2 caracteres')
        .max(30, 'El código no puede exceder 30 caracteres')
        .regex(/^[A-Z_]+$/, 'El código solo puede contener mayúsculas y guiones bajos')
        .transform(val => val.toUpperCase()),
    nombre: zod_1.z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    descripcion: zod_1.z.string()
        .max(200, 'La descripción no puede exceder 200 caracteres')
        .optional(),
    montoCuota: zod_1.z.number()
        .min(0, 'El monto debe ser mayor o igual a 0')
        .max(1000000, 'El monto no puede exceder $1,000,000'),
    descuento: zod_1.z.number()
        .min(0, 'El descuento no puede ser negativo')
        .max(100, 'El descuento no puede exceder 100%')
        .default(0),
    activa: zod_1.z.boolean().default(true),
    orden: zod_1.z.number().int().min(0).default(0)
});
exports.updateCategoriaSocioSchema = zod_1.z.object({
    codigo: zod_1.z.string()
        .min(2, 'El código debe tener al menos 2 caracteres')
        .max(30, 'El código no puede exceder 30 caracteres')
        .regex(/^[A-Z_]+$/, 'El código solo puede contener mayúsculas y guiones bajos')
        .transform(val => val.toUpperCase())
        .optional(),
    nombre: zod_1.z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .optional(),
    descripcion: zod_1.z.string()
        .max(200, 'La descripción no puede exceder 200 caracteres')
        .optional(),
    montoCuota: zod_1.z.number()
        .min(0, 'El monto debe ser mayor o igual a 0')
        .max(1000000, 'El monto no puede exceder $1,000,000')
        .optional(),
    descuento: zod_1.z.number()
        .min(0, 'El descuento no puede ser negativo')
        .max(100, 'El descuento no puede exceder 100%')
        .optional(),
    activa: zod_1.z.boolean().optional(),
    orden: zod_1.z.number().int().min(0).optional()
});
exports.categoriaSocioQuerySchema = zod_1.z.object({
    includeInactive: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    search: zod_1.z.string().optional()
});
//# sourceMappingURL=categoria-socio.dto.js.map