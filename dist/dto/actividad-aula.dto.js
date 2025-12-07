"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarDisponibilidadSchema = exports.desasignarAulaSchema = exports.queryActividadesAulasSchema = exports.cambiarAulaSchema = exports.asignarMultiplesAulasSchema = exports.updateActividadAulaSchema = exports.createActividadAulaSchema = void 0;
const zod_1 = require("zod");
exports.createActividadAulaSchema = zod_1.z.object({
    actividadId: zod_1.z.number()
        .int('El ID de actividad debe ser un número entero')
        .positive('El ID de actividad debe ser positivo'),
    aulaId: zod_1.z.number()
        .int('El ID de aula debe ser un número entero')
        .positive('El ID de aula debe ser positivo'),
    fechaAsignacion: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional(),
    fechaDesasignacion: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional()
        .nullable(),
    activa: zod_1.z.boolean().default(true),
    prioridad: zod_1.z.number()
        .int('La prioridad debe ser un número entero')
        .positive('La prioridad debe ser positiva')
        .default(1)
        .optional(),
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
exports.updateActividadAulaSchema = zod_1.z.object({
    prioridad: zod_1.z.number()
        .int('La prioridad debe ser un número entero')
        .positive('La prioridad debe ser positiva')
        .optional(),
    fechaDesasignacion: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional()
        .nullable(),
    activa: zod_1.z.boolean().optional(),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});
exports.asignarMultiplesAulasSchema = zod_1.z.object({
    actividadId: zod_1.z.number().int().positive(),
    aulas: zod_1.z.array(zod_1.z.object({
        aulaId: zod_1.z.number().int().positive(),
        prioridad: zod_1.z.number().int().positive().default(1).optional(),
        observaciones: zod_1.z.string().max(500).optional().nullable()
    })).min(1, 'Debe proporcionar al menos un aula')
});
exports.cambiarAulaSchema = zod_1.z.object({
    nuevaAulaId: zod_1.z.number()
        .int('El ID de aula debe ser un número entero')
        .positive('El ID de aula debe ser positivo'),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});
exports.queryActividadesAulasSchema = zod_1.z.object({
    actividadId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    aulaId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    activa: zod_1.z.preprocess((val) => {
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
exports.desasignarAulaSchema = zod_1.z.object({
    fechaDesasignacion: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional(),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});
exports.verificarDisponibilidadSchema = zod_1.z.object({
    actividadId: zod_1.z.number()
        .int('El ID de actividad debe ser un número entero')
        .positive('El ID de actividad debe ser positivo'),
    aulaId: zod_1.z.number()
        .int('El ID de aula debe ser un número entero')
        .positive('El ID de aula debe ser positivo'),
    excluirAsignacionId: zod_1.z.number()
        .int()
        .positive()
        .optional()
});
//# sourceMappingURL=actividad-aula.dto.js.map