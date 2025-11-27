"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderEstadosReservasSchema = exports.queryEstadosReservasSchema = exports.updateEstadoReservaSchema = exports.createEstadoReservaSchema = void 0;
const zod_1 = require("zod");
exports.createEstadoReservaSchema = zod_1.z.object({
    codigo: zod_1.z.string()
        .min(1, 'El código es requerido')
        .max(50, 'El código no puede exceder 50 caracteres')
        .regex(/^[A-Z_]+$/, 'El código debe estar en mayúsculas y usar guiones bajos'),
    nombre: zod_1.z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: zod_1.z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional()
        .nullable(),
    activo: zod_1.z.boolean().default(true),
    orden: zod_1.z.number().int().nonnegative().default(0)
});
exports.updateEstadoReservaSchema = exports.createEstadoReservaSchema.partial();
exports.queryEstadosReservasSchema = zod_1.z.object({
    activo: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    search: zod_1.z.string().max(100).optional(),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 50 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(50)),
    includeInactive: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(false)),
    orderBy: zod_1.z.enum(['codigo', 'nombre', 'orden', 'created_at']).default('orden'),
    orderDir: zod_1.z.enum(['asc', 'desc']).default('asc')
});
exports.reorderEstadosReservasSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.number().int().positive()).min(1, 'Debe proporcionar al menos un ID')
});
//# sourceMappingURL=estados-reserva.dto.js.map