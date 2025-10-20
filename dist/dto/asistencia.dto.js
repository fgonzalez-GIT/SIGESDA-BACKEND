"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertasInasistenciasSchema = exports.tasaAsistenciaSchema = exports.reporteAsistenciasSchema = exports.asistenciaQuerySchema = exports.updateAsistenciaSchema = exports.registroAsistenciaMasivaSchema = exports.createAsistenciaSchema = void 0;
const zod_1 = require("zod");
exports.createAsistenciaSchema = zod_1.z.object({
    participacionId: zod_1.z.number().int('El ID de participación debe ser un número entero').positive('El ID de participación debe ser positivo'),
    fechaSesion: zod_1.z.string().datetime('Fecha de sesión inválida'),
    asistio: zod_1.z.boolean(),
    justificada: zod_1.z.boolean().optional().default(false),
    observaciones: zod_1.z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional()
});
exports.registroAsistenciaMasivaSchema = zod_1.z.object({
    actividadId: zod_1.z.number().int().positive('El ID de actividad debe ser positivo'),
    fechaSesion: zod_1.z.string().datetime('Fecha de sesión inválida'),
    asistencias: zod_1.z.array(zod_1.z.object({
        participacionId: zod_1.z.number().int().positive(),
        asistio: zod_1.z.boolean(),
        justificada: zod_1.z.boolean().optional().default(false),
        observaciones: zod_1.z.string().max(500).optional()
    })).min(1, 'Debe registrar al menos una asistencia')
});
exports.updateAsistenciaSchema = zod_1.z.object({
    asistio: zod_1.z.boolean().optional(),
    justificada: zod_1.z.boolean().optional(),
    observaciones: zod_1.z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional()
});
exports.asistenciaQuerySchema = zod_1.z.object({
    participacionId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    actividadId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    personaId: zod_1.z.string().optional(),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional(),
    soloInasistencias: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return val === 'true';
        return val;
    }, zod_1.z.boolean().optional()),
    soloJustificadas: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return val === 'true';
        return val;
    }, zod_1.z.boolean().optional()),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 20 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(20))
});
exports.reporteAsistenciasSchema = zod_1.z.object({
    actividadId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    personaId: zod_1.z.string().optional(),
    fechaDesde: zod_1.z.string().datetime('Fecha desde inválida'),
    fechaHasta: zod_1.z.string().datetime('Fecha hasta inválida'),
    agruparPor: zod_1.z.enum(['persona', 'actividad', 'mes', 'dia']).default('persona')
}).refine((data) => {
    const desde = new Date(data.fechaDesde);
    const hasta = new Date(data.fechaHasta);
    return desde < hasta;
}, {
    message: 'La fecha desde debe ser anterior a la fecha hasta',
    path: ['fechaHasta']
});
exports.tasaAsistenciaSchema = zod_1.z.object({
    participacionId: zod_1.z.number().int().positive(),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional()
});
exports.alertasInasistenciasSchema = zod_1.z.object({
    umbral: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 3 : parsed;
    }, zod_1.z.number().int().min(1).max(10).default(3)),
    actividadId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    soloActivas: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return val === 'true';
        return val;
    }, zod_1.z.boolean().default(true))
});
//# sourceMappingURL=asistencia.dto.js.map