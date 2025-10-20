"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizarReservaAulaSchema = exports.verificarDisponibilidadAulaSchema = exports.queryReservasAulasActividadesSchema = exports.cambiarAulaHorarioSchema = exports.reservarAulaParaActividadSchema = exports.updateReservaAulaActividadSchema = exports.createReservaAulaActividadSchema = void 0;
const zod_1 = require("zod");
exports.createReservaAulaActividadSchema = zod_1.z.object({
    horarioId: zod_1.z.number()
        .int('El ID de horario debe ser un número entero')
        .positive('El ID de horario debe ser positivo'),
    aulaId: zod_1.z.string()
        .cuid('ID de aula inválido'),
    fechaVigenciaDesde: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date()),
    fechaVigenciaHasta: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional()
        .nullable(),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
}).refine((data) => {
    if (!data.fechaVigenciaHasta)
        return true;
    const desde = typeof data.fechaVigenciaDesde === 'string'
        ? new Date(data.fechaVigenciaDesde)
        : data.fechaVigenciaDesde;
    const hasta = typeof data.fechaVigenciaHasta === 'string'
        ? new Date(data.fechaVigenciaHasta)
        : data.fechaVigenciaHasta;
    return hasta >= desde;
}, {
    message: 'La fecha de vigencia hasta debe ser posterior o igual a la fecha de vigencia desde'
});
exports.updateReservaAulaActividadSchema = zod_1.z.object({
    fechaVigenciaHasta: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional()
        .nullable(),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});
exports.reservarAulaParaActividadSchema = zod_1.z.object({
    actividadId: zod_1.z.number().int().positive(),
    aulaId: zod_1.z.string().cuid('ID de aula inválido'),
    fechaVigenciaDesde: zod_1.z.string().datetime().or(zod_1.z.date()),
    fechaVigenciaHasta: zod_1.z.string().datetime().or(zod_1.z.date()).optional().nullable(),
    observaciones: zod_1.z.string().max(500).optional().nullable()
}).refine((data) => {
    if (!data.fechaVigenciaHasta)
        return true;
    const desde = typeof data.fechaVigenciaDesde === 'string'
        ? new Date(data.fechaVigenciaDesde)
        : data.fechaVigenciaDesde;
    const hasta = typeof data.fechaVigenciaHasta === 'string'
        ? new Date(data.fechaVigenciaHasta)
        : data.fechaVigenciaHasta;
    return hasta >= desde;
}, {
    message: 'La fecha de vigencia hasta debe ser posterior o igual a la fecha de vigencia desde'
});
exports.cambiarAulaHorarioSchema = zod_1.z.object({
    nuevaAulaId: zod_1.z.string().cuid('ID de aula inválido'),
    fechaVigenciaDesde: zod_1.z.string().datetime().or(zod_1.z.date()),
    fechaVigenciaHasta: zod_1.z.string().datetime().or(zod_1.z.date()).optional().nullable(),
    observaciones: zod_1.z.string().max(500).optional().nullable()
}).refine((data) => {
    if (!data.fechaVigenciaHasta)
        return true;
    const desde = typeof data.fechaVigenciaDesde === 'string'
        ? new Date(data.fechaVigenciaDesde)
        : data.fechaVigenciaDesde;
    const hasta = typeof data.fechaVigenciaHasta === 'string'
        ? new Date(data.fechaVigenciaHasta)
        : data.fechaVigenciaHasta;
    return hasta >= desde;
}, {
    message: 'La fecha de vigencia hasta debe ser posterior o igual a la fecha de vigencia desde'
});
exports.queryReservasAulasActividadesSchema = zod_1.z.object({
    horarioId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    aulaId: zod_1.z.string().cuid().optional(),
    actividadId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    diaSemanaId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().min(1).max(7).optional()),
    vigentes: zod_1.z.preprocess((val) => {
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
    fechaReferencia: zod_1.z.string().datetime().optional(),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 50 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(50))
});
exports.verificarDisponibilidadAulaSchema = zod_1.z.object({
    aulaId: zod_1.z.string().cuid('ID de aula inválido'),
    diaSemanaId: zod_1.z.number().int().positive().min(1).max(7),
    horaInicio: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    horaFin: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    fechaVigenciaDesde: zod_1.z.string().datetime().or(zod_1.z.date()),
    fechaVigenciaHasta: zod_1.z.string().datetime().or(zod_1.z.date()).optional().nullable(),
    horarioExcluidoId: zod_1.z.number().int().positive().optional()
}).refine((data) => {
    const horaInicio = data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio;
    const horaFin = data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin;
    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [finHora, finMin] = horaFin.split(':').map(Number);
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const finMinutos = finHora * 60 + finMin;
    return finMinutos > inicioMinutos;
}, {
    message: 'La hora de fin debe ser posterior a la hora de inicio'
});
exports.finalizarReservaAulaSchema = zod_1.z.object({
    fechaVigenciaHasta: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional(),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});
//# sourceMappingURL=reserva-aula-actividad.dto.js.map