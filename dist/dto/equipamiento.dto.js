"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipamientosAulaQuerySchema = exports.actualizarCantidadEquipamientoSchema = exports.asignarEquipamientoAulaSchema = exports.equipamientoQuerySchema = exports.updateEquipamientoSchema = exports.createEquipamientoSchema = void 0;
const zod_1 = require("zod");
const equipamientoBaseSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'Nombre es requerido').max(200),
    categoriaEquipamientoId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? val : parsed;
    }, zod_1.z.number().int().positive('ID de categoría inválido')),
    estadoEquipamientoId: zod_1.z.preprocess((val) => {
        if (val === null || val === undefined)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? val : parsed;
    }, zod_1.z.number().int().positive('ID de estado de equipamiento inválido').optional()),
    cantidad: zod_1.z.preprocess((val) => {
        if (val === null || val === undefined)
            return 1;
        const parsed = parseInt(val);
        return isNaN(parsed) ? val : parsed;
    }, zod_1.z.number().int().positive('La cantidad debe ser al menos 1').default(1)),
    descripcion: zod_1.z.string().max(1000).optional(),
    observaciones: zod_1.z.string().max(1000).optional(),
    activo: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(true))
});
exports.createEquipamientoSchema = zod_1.z.object({
    ...equipamientoBaseSchema.shape,
    codigo: zod_1.z.string()
        .max(50, 'El código no puede exceder 50 caracteres')
        .regex(/^[A-Z0-9-_]+$/, 'El código debe contener solo mayúsculas, números, guiones y guiones bajos')
        .optional()
});
exports.updateEquipamientoSchema = zod_1.z.object({
    ...equipamientoBaseSchema.partial().shape
}).refine((data) => !('codigo' in data), {
    message: 'El código no se puede modificar',
    path: ['codigo']
});
exports.equipamientoQuerySchema = zod_1.z.object({
    activo: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    estadoEquipamientoId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    conStock: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    search: zod_1.z.string().optional(),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10))
});
exports.asignarEquipamientoAulaSchema = zod_1.z.object({
    equipamientoId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? val : parsed;
    }, zod_1.z.number().int().positive('ID de equipamiento inválido')),
    cantidad: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive('La cantidad debe ser positiva').default(1)),
    observaciones: zod_1.z.string().max(500).optional()
});
exports.actualizarCantidadEquipamientoSchema = zod_1.z.object({
    cantidad: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? val : parsed;
    }, zod_1.z.number().int().positive('La cantidad debe ser positiva')),
    observaciones: zod_1.z.string().max(500).optional()
});
exports.equipamientosAulaQuerySchema = zod_1.z.object({
    incluirInactivos: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(false))
});
//# sourceMappingURL=equipamiento.dto.js.map