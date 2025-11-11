"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservaStatsSchema = exports.reservaSearchSchema = exports.createRecurringReservaSchema = exports.deleteBulkReservasSchema = exports.createBulkReservasSchema = exports.conflictDetectionSchema = exports.reservaAulaQuerySchema = exports.updateReservaAulaSchema = exports.createReservaAulaSchema = void 0;
const zod_1 = require("zod");
exports.createReservaAulaSchema = zod_1.z.object({
    aulaId: zod_1.z.string().cuid('ID de aula inválido'),
    actividadId: zod_1.z.string().cuid('ID de actividad inválido').optional(),
    docenteId: zod_1.z.string().cuid('ID de docente inválido'),
    fechaInicio: zod_1.z.string().datetime('Fecha de inicio inválida'),
    fechaFin: zod_1.z.string().datetime('Fecha de fin inválida'),
    observaciones: zod_1.z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional()
}).refine((data) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    return inicio < fin;
}, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['fechaFin']
}).refine((data) => {
    const inicio = new Date(data.fechaInicio);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return inicio >= oneHourAgo;
}, {
    message: 'No se pueden crear reservas en el pasado',
    path: ['fechaInicio']
}).refine((data) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    const diffHours = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    return diffHours >= 0.5 && diffHours <= 12;
}, {
    message: 'La duración de la reserva debe estar entre 30 minutos y 12 horas',
    path: ['fechaFin']
});
exports.updateReservaAulaSchema = zod_1.z.object({
    aulaId: zod_1.z.string().cuid('ID de aula inválido').optional(),
    actividadId: zod_1.z.string().cuid('ID de actividad inválido').optional().nullable(),
    docenteId: zod_1.z.string().cuid('ID de docente inválido').optional(),
    fechaInicio: zod_1.z.string().datetime('Fecha de inicio inválida').optional(),
    fechaFin: zod_1.z.string().datetime('Fecha de fin inválida').optional(),
    observaciones: zod_1.z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional().nullable()
}).refine((data) => {
    if (data.fechaInicio && data.fechaFin) {
        const inicio = new Date(data.fechaInicio);
        const fin = new Date(data.fechaFin);
        return inicio < fin;
    }
    return true;
}, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['fechaFin']
});
exports.reservaAulaQuerySchema = zod_1.z.object({
    aulaId: zod_1.z.string().cuid().optional(),
    actividadId: zod_1.z.string().cuid().optional(),
    docenteId: zod_1.z.string().cuid().optional(),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional(),
    soloActivas: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(true)),
    incluirPasadas: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(false)),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10))
});
exports.conflictDetectionSchema = zod_1.z.object({
    aulaId: zod_1.z.string().cuid('ID de aula inválido'),
    fechaInicio: zod_1.z.string().datetime('Fecha de inicio inválida'),
    fechaFin: zod_1.z.string().datetime('Fecha de fin inválida'),
    excludeReservaId: zod_1.z.string().cuid().optional()
}).refine((data) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    return inicio < fin;
}, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['fechaFin']
});
exports.createBulkReservasSchema = zod_1.z.object({
    reservas: zod_1.z.array(exports.createReservaAulaSchema).min(1, 'Debe proporcionar al menos una reserva')
});
exports.deleteBulkReservasSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string().cuid()).min(1, 'Debe proporcionar al menos un ID')
});
exports.createRecurringReservaSchema = zod_1.z.object({
    aulaId: zod_1.z.string().cuid('ID de aula inválido'),
    actividadId: zod_1.z.string().cuid('ID de actividad inválido').optional(),
    docenteId: zod_1.z.string().cuid('ID de docente inválido'),
    fechaInicio: zod_1.z.string().datetime('Fecha de inicio inválida'),
    fechaFin: zod_1.z.string().datetime('Fecha de fin inválida'),
    observaciones: zod_1.z.string().max(500).optional(),
    recurrencia: zod_1.z.object({
        tipo: zod_1.z.enum(['DIARIO', 'SEMANAL', 'MENSUAL']),
        intervalo: zod_1.z.number().int().positive().max(12),
        diasSemana: zod_1.z.array(zod_1.z.number().int().min(0).max(6)).optional(),
        fechaHasta: zod_1.z.string().datetime('Fecha límite inválida'),
        maxOcurrencias: zod_1.z.number().int().positive().max(100).optional()
    })
}).refine((data) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    const hasta = new Date(data.recurrencia.fechaHasta);
    return inicio < fin && fin <= hasta;
}, {
    message: 'Las fechas de recurrencia deben ser coherentes',
    path: ['recurrencia', 'fechaHasta']
});
exports.reservaSearchSchema = zod_1.z.object({
    search: zod_1.z.string().min(1, 'Término de búsqueda requerido'),
    searchBy: zod_1.z.enum(['aula', 'docente', 'actividad', 'observaciones', 'all']).default('all'),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional(),
    incluirPasadas: zod_1.z.boolean().default(false)
});
exports.reservaStatsSchema = zod_1.z.object({
    fechaDesde: zod_1.z.string().datetime(),
    fechaHasta: zod_1.z.string().datetime(),
    agruparPor: zod_1.z.enum(['aula', 'docente', 'actividad', 'dia', 'mes']).default('aula')
}).refine((data) => {
    const desde = new Date(data.fechaDesde);
    const hasta = new Date(data.fechaHasta);
    return desde <= hasta;
}, {
    message: 'La fecha desde debe ser anterior o igual a la fecha hasta',
    path: ['fechaHasta']
});
//# sourceMappingURL=reserva-aula.dto.js.map