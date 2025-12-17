"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryExencionCuotaSchema = exports.revocarExencionSchema = exports.rechazarExencionSchema = exports.aprobarExencionSchema = exports.updateExencionCuotaSchema = exports.createExencionCuotaSchema = exports.EstadoExencionEnum = exports.MotivoExencionEnum = exports.TipoExencionEnum = void 0;
const zod_1 = require("zod");
exports.TipoExencionEnum = zod_1.z.enum(['TOTAL', 'PARCIAL']);
exports.MotivoExencionEnum = zod_1.z.enum([
    'BECA',
    'SOCIO_FUNDADOR',
    'SOCIO_HONORARIO',
    'SITUACION_ECONOMICA',
    'SITUACION_SALUD',
    'INTERCAMBIO_SERVICIOS',
    'PROMOCION',
    'FAMILIAR_DOCENTE',
    'OTRO'
]);
exports.EstadoExencionEnum = zod_1.z.enum([
    'PENDIENTE_APROBACION',
    'APROBADA',
    'RECHAZADA',
    'VIGENTE',
    'VENCIDA',
    'REVOCADA'
]);
exports.createExencionCuotaSchema = zod_1.z.object({
    personaId: zod_1.z.number().int().positive('El ID de persona debe ser un número positivo'),
    tipoExencion: exports.TipoExencionEnum,
    motivoExencion: exports.MotivoExencionEnum,
    porcentajeExencion: zod_1.z.number().min(0).max(100).optional().default(100),
    fechaInicio: zod_1.z.coerce.date(),
    fechaFin: zod_1.z.coerce.date().optional().nullable(),
    descripcion: zod_1.z.string().min(1, 'La descripción es obligatoria').max(500),
    justificacion: zod_1.z.string().optional().nullable(),
    documentacionAdjunta: zod_1.z.string().max(255).optional().nullable(),
    solicitadoPor: zod_1.z.string().max(100).optional().nullable(),
    observaciones: zod_1.z.string().optional().nullable()
}).refine(data => {
    if (data.fechaFin && data.fechaInicio) {
        return data.fechaFin >= data.fechaInicio;
    }
    return true;
}, {
    message: 'fechaFin debe ser posterior a fechaInicio',
    path: ['fechaFin']
}).refine(data => {
    if (data.tipoExencion === 'TOTAL') {
        return data.porcentajeExencion === 100;
    }
    return true;
}, {
    message: 'Exención TOTAL debe tener porcentaje 100%',
    path: ['porcentajeExencion']
});
exports.updateExencionCuotaSchema = zod_1.z.object({
    tipoExencion: exports.TipoExencionEnum.optional(),
    motivoExencion: exports.MotivoExencionEnum.optional(),
    porcentajeExencion: zod_1.z.number().min(0).max(100).optional(),
    fechaInicio: zod_1.z.coerce.date().optional(),
    fechaFin: zod_1.z.coerce.date().optional().nullable(),
    descripcion: zod_1.z.string().min(1).max(500).optional(),
    justificacion: zod_1.z.string().optional().nullable(),
    documentacionAdjunta: zod_1.z.string().max(255).optional().nullable(),
    observaciones: zod_1.z.string().optional().nullable()
});
exports.aprobarExencionSchema = zod_1.z.object({
    aprobadoPor: zod_1.z.string().min(1, 'El nombre del aprobador es obligatorio').max(100),
    observaciones: zod_1.z.string().optional().nullable()
});
exports.rechazarExencionSchema = zod_1.z.object({
    motivoRechazo: zod_1.z.string().min(1, 'El motivo de rechazo es obligatorio')
});
exports.revocarExencionSchema = zod_1.z.object({
    motivoRevocacion: zod_1.z.string().min(1, 'El motivo de revocación es obligatorio')
});
exports.queryExencionCuotaSchema = zod_1.z.object({
    personaId: zod_1.z.coerce.number().int().positive().optional(),
    tipoExencion: exports.TipoExencionEnum.optional(),
    motivoExencion: exports.MotivoExencionEnum.optional(),
    estado: exports.EstadoExencionEnum.optional(),
    activa: zod_1.z.coerce.boolean().optional(),
    fechaDesde: zod_1.z.coerce.date().optional(),
    fechaHasta: zod_1.z.coerce.date().optional()
});
//# sourceMappingURL=exencion-cuota.dto.js.map