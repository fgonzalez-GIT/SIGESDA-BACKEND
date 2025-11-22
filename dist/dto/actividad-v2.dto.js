"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reporteOcupacionSchema = exports.estadisticasActividadSchema = exports.cambiarEstadoActividadSchema = exports.duplicarActividadSchema = exports.queryActividadesSchema = exports.updateActividadSchema = exports.createActividadSchema = void 0;
const zod_1 = require("zod");
const actividadBaseSchema = zod_1.z.object({
    codigoActividad: zod_1.z.string()
        .max(50, 'El código no puede exceder 50 caracteres')
        .regex(/^[A-Z0-9\-]+$/, 'El código debe estar en mayúsculas, números y guiones')
        .optional(),
    nombre: zod_1.z.string()
        .min(1, 'El nombre es requerido')
        .max(200, 'El nombre no puede exceder 200 caracteres'),
    tipoActividadId: zod_1.z.number()
        .int('El ID de tipo de actividad debe ser un número entero')
        .positive('El ID de tipo de actividad debe ser positivo'),
    categoriaId: zod_1.z.number()
        .int('El ID de categoría debe ser un número entero')
        .positive('El ID de categoría debe ser positivo'),
    estadoId: zod_1.z.number()
        .int('El ID de estado debe ser un número entero')
        .positive('El ID de estado debe ser positivo')
        .default(1),
    descripcion: zod_1.z.string()
        .max(1000, 'La descripción no puede exceder 1000 caracteres')
        .optional()
        .nullable(),
    fechaDesde: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date()),
    fechaHasta: zod_1.z.string()
        .datetime()
        .or(zod_1.z.date())
        .optional()
        .nullable(),
    cupoMaximo: zod_1.z.number()
        .int('El cupo máximo debe ser un número entero')
        .positive('El cupo máximo debe ser positivo')
        .optional()
        .nullable(),
    costo: zod_1.z.number()
        .nonnegative('El costo no puede ser negativo')
        .default(0),
    observaciones: zod_1.z.string()
        .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
        .optional()
        .nullable()
});
const horarioInlineSchema = zod_1.z.object({
    diaSemanaId: zod_1.z.number().int().positive(),
    horaInicio: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    horaFin: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    activo: zod_1.z.boolean().default(true)
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
const docenteInlineSchema = zod_1.z.object({
    docenteId: zod_1.z.number().int().positive('ID de docente inválido'),
    rolDocenteId: zod_1.z.number().int().positive(),
    observaciones: zod_1.z.string().max(500).optional().nullable()
});
const reservaAulaInlineSchema = zod_1.z.object({
    diaSemanaId: zod_1.z.number().int().positive(),
    horaInicio: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    horaFin: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    aulaId: zod_1.z.string().cuid('ID de aula inválido'),
    fechaVigenciaDesde: zod_1.z.string().datetime().or(zod_1.z.date()),
    fechaVigenciaHasta: zod_1.z.string().datetime().or(zod_1.z.date()).optional().nullable()
});
exports.createActividadSchema = actividadBaseSchema.extend({
    horarios: zod_1.z.array(horarioInlineSchema)
        .optional()
        .default([]),
    docentes: zod_1.z.array(docenteInlineSchema)
        .optional()
        .default([]),
    reservasAulas: zod_1.z.array(reservaAulaInlineSchema)
        .optional()
        .default([])
}).refine((data) => {
    if (!data.fechaHasta)
        return true;
    const desde = typeof data.fechaDesde === 'string'
        ? new Date(data.fechaDesde)
        : data.fechaDesde;
    const hasta = typeof data.fechaHasta === 'string'
        ? new Date(data.fechaHasta)
        : data.fechaHasta;
    return hasta >= desde;
}, {
    message: 'La fecha hasta debe ser posterior o igual a la fecha desde'
});
exports.updateActividadSchema = actividadBaseSchema.partial().refine((data) => {
    if (!data.fechaDesde || !data.fechaHasta)
        return true;
    const desde = typeof data.fechaDesde === 'string'
        ? new Date(data.fechaDesde)
        : data.fechaDesde;
    const hasta = typeof data.fechaHasta === 'string'
        ? new Date(data.fechaHasta)
        : data.fechaHasta;
    return hasta >= desde;
}, {
    message: 'La fecha hasta debe ser posterior o igual a la fecha desde'
});
exports.queryActividadesSchema = zod_1.z.object({
    tipoActividadId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    categoriaId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    estadoId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    diaSemanaId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().min(1).max(7).optional()),
    docenteId: zod_1.z.string().cuid().optional(),
    aulaId: zod_1.z.string().cuid().optional(),
    conCupo: zod_1.z.preprocess((val) => {
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
    costoDesde: zod_1.z.preprocess((val) => {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().nonnegative().optional()),
    costoHasta: zod_1.z.preprocess((val) => {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().nonnegative().optional()),
    search: zod_1.z.string()
        .max(100, 'El término de búsqueda no puede exceder 100 caracteres')
        .optional(),
    vigentes: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10)),
    orderBy: zod_1.z.enum([
        'nombre',
        'codigo',
        'fechaDesde',
        'costo',
        'cupoMaximo',
        'created_at'
    ]).default('nombre'),
    orderDir: zod_1.z.enum(['asc', 'desc']).default('asc')
});
exports.duplicarActividadSchema = zod_1.z.object({
    nuevoCodigoActividad: zod_1.z.string()
        .min(1, 'El código de actividad es requerido')
        .max(50, 'El código no puede exceder 50 caracteres')
        .regex(/^[A-Z0-9\-]+$/, 'El código debe estar en mayúsculas, números y guiones'),
    nuevoNombre: zod_1.z.string()
        .min(1, 'El nombre es requerido')
        .max(200, 'El nombre no puede exceder 200 caracteres'),
    nuevaFechaDesde: zod_1.z.string().datetime().or(zod_1.z.date()),
    nuevaFechaHasta: zod_1.z.string().datetime().or(zod_1.z.date()).optional().nullable(),
    copiarHorarios: zod_1.z.boolean().default(true),
    copiarDocentes: zod_1.z.boolean().default(false),
    copiarReservasAulas: zod_1.z.boolean().default(false)
}).refine((data) => {
    if (!data.nuevaFechaHasta)
        return true;
    const desde = typeof data.nuevaFechaDesde === 'string'
        ? new Date(data.nuevaFechaDesde)
        : data.nuevaFechaDesde;
    const hasta = typeof data.nuevaFechaHasta === 'string'
        ? new Date(data.nuevaFechaHasta)
        : data.nuevaFechaHasta;
    return hasta >= desde;
}, {
    message: 'La fecha hasta debe ser posterior o igual a la fecha desde'
});
exports.cambiarEstadoActividadSchema = zod_1.z.object({
    nuevoEstadoId: zod_1.z.number()
        .int('El ID de estado debe ser un número entero')
        .positive('El ID de estado debe ser positivo'),
    observaciones: zod_1.z.string()
        .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
        .optional()
        .nullable()
});
exports.estadisticasActividadSchema = zod_1.z.object({
    incluirParticipaciones: zod_1.z.boolean().default(true),
    incluirDocentes: zod_1.z.boolean().default(true),
    incluirHorarios: zod_1.z.boolean().default(true),
    incluirReservasAulas: zod_1.z.boolean().default(false),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional()
});
exports.reporteOcupacionSchema = zod_1.z.object({
    diaSemanaId: zod_1.z.number().int().positive().optional(),
    aulaId: zod_1.z.string().cuid().optional(),
    docenteId: zod_1.z.string().cuid().optional(),
    fechaReferencia: zod_1.z.string().datetime().optional()
});
//# sourceMappingURL=actividad-v2.dto.js.map