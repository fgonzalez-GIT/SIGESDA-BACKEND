"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.familiarSearchSchema = exports.deleteBulkFamiliaresSchema = exports.createBulkFamiliaresSchema = exports.familiarQuerySchema = exports.updateFamiliarSchema = exports.createFamiliarSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createFamiliarSchema = zod_1.z.object({
    socioId: zod_1.z.number().int().positive('ID de socio inválido'),
    familiarId: zod_1.z.number().int().positive('ID de familiar inválido'),
    parentesco: zod_1.z.nativeEnum(client_1.TipoParentesco, {
        errorMap: () => ({ message: 'Tipo de parentesco inválido' })
    }),
    descripcion: zod_1.z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
    permisoResponsableFinanciero: zod_1.z.boolean().default(false),
    permisoContactoEmergencia: zod_1.z.boolean().default(false),
    permisoAutorizadoRetiro: zod_1.z.boolean().default(false),
    descuento: zod_1.z.number()
        .min(0, 'El descuento no puede ser negativo')
        .max(100, 'El descuento no puede exceder 100%')
        .default(0),
    activo: zod_1.z.boolean().default(true),
    grupoFamiliarId: zod_1.z.number().int().positive().optional().nullable()
}).refine((data) => data.socioId !== data.familiarId, {
    message: 'Una persona no puede ser familiar de sí misma',
    path: ['familiarId']
});
exports.updateFamiliarSchema = zod_1.z.object({
    parentesco: zod_1.z.nativeEnum(client_1.TipoParentesco, {
        errorMap: () => ({ message: 'Tipo de parentesco inválido' })
    }).optional(),
    descripcion: zod_1.z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().nullable(),
    permisoResponsableFinanciero: zod_1.z.boolean().optional(),
    permisoContactoEmergencia: zod_1.z.boolean().optional(),
    permisoAutorizadoRetiro: zod_1.z.boolean().optional(),
    descuento: zod_1.z.number()
        .min(0, 'El descuento no puede ser negativo')
        .max(100, 'El descuento no puede exceder 100%')
        .optional(),
    activo: zod_1.z.boolean().optional(),
    grupoFamiliarId: zod_1.z.number().int().positive().optional().nullable()
});
exports.familiarQuerySchema = zod_1.z.object({
    socioId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    familiarId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    parentesco: zod_1.z.nativeEnum(client_1.TipoParentesco).optional(),
    grupoFamiliarId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    includeInactivos: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(false)),
    soloActivos: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(true)),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10))
});
exports.createBulkFamiliaresSchema = zod_1.z.object({
    familiares: zod_1.z.array(exports.createFamiliarSchema).min(1, 'Debe proporcionar al menos una relación familiar')
});
exports.deleteBulkFamiliaresSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.number().int().positive()).min(1, 'Debe proporcionar al menos un ID')
});
exports.familiarSearchSchema = zod_1.z.object({
    search: zod_1.z.string().min(1, 'Término de búsqueda requerido'),
    searchBy: zod_1.z.enum(['nombre', 'dni', 'email', 'all']).default('all'),
    parentesco: zod_1.z.nativeEnum(client_1.TipoParentesco).optional(),
    includeInactivos: zod_1.z.boolean().default(false)
});
//# sourceMappingURL=familiar.dto.js.map