"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.desasignarDocenteSchema = exports.queryDocentesActividadesSchema = exports.cambiarRolDocenteSchema = exports.asignarMultiplesDocentesSchema = exports.updateDocenteActividadSchema = exports.createDocenteActividadSchema = void 0;
const zod_1 = require("zod");
exports.createDocenteActividadSchema = zod_1.z.object({
    actividadId: zod_1.z.number()
        .int('El ID de actividad debe ser un número entero')
        .positive('El ID de actividad debe ser positivo'),
    docenteId: zod_1.z.string()
        .cuid('ID de docente inválido'),
    rolDocenteId: zod_1.z.number()
        .int('El ID de rol docente debe ser un número entero')
        .positive('El ID de rol docente debe ser positivo'),
    fechaAsignacion: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional(),
    fechaDesasignacion: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional()
        .nullable(),
    activo: zod_1.z.boolean().default(true),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
}).refine((data) => {
    if (!data.fechaAsignacion || !data.fechaDesasignacion)
        return true;
    const asignacion = typeof data.fechaAsignacion === 'string'
        ? new Date(data.fechaAsignacion)
        : data.fechaAsignacion;
    const desasignacion = typeof data.fechaDesasignacion === 'string'
        ? new Date(data.fechaDesasignacion)
        : data.fechaDesasignacion;
    return desasignacion >= asignacion;
}, {
    message: 'La fecha de desasignación debe ser posterior o igual a la fecha de asignación'
});
exports.updateDocenteActividadSchema = zod_1.z.object({
    rolDocenteId: zod_1.z.number()
        .int('El ID de rol docente debe ser un número entero')
        .positive('El ID de rol docente debe ser positivo')
        .optional(),
    fechaDesasignacion: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional()
        .nullable(),
    activo: zod_1.z.boolean().optional(),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});
exports.asignarMultiplesDocentesSchema = zod_1.z.object({
    actividadId: zod_1.z.number().int().positive(),
    docentes: zod_1.z.array(zod_1.z.object({
        docenteId: zod_1.z.string().cuid(),
        rolDocenteId: zod_1.z.number().int().positive(),
        observaciones: zod_1.z.string().max(500).optional().nullable()
    })).min(1, 'Debe proporcionar al menos un docente')
});
exports.cambiarRolDocenteSchema = zod_1.z.object({
    nuevoRolDocenteId: zod_1.z.number()
        .int('El ID de rol docente debe ser un número entero')
        .positive('El ID de rol docente debe ser positivo'),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});
exports.queryDocentesActividadesSchema = zod_1.z.object({
    actividadId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    docenteId: zod_1.z.string().cuid().optional(),
    rolDocenteId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    activo: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    incluirRelaciones: zod_1.z.preprocess((val) => {
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
        return isNaN(parsed) ? 50 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(50))
});
exports.desasignarDocenteSchema = zod_1.z.object({
    fechaDesasignacion: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional(),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});
//# sourceMappingURL=docente-actividad.dto.js.map