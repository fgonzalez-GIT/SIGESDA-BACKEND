"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarSolapamientoParticipaciones = exports.calcularDuracionParticipacion = exports.determinarEstado = exports.EstadoParticipacion = exports.transferirParticipacionSchema = exports.verificarCuposSchema = exports.reporteInasistenciasSchema = exports.estadisticasParticipacionSchema = exports.desincripcionSchema = exports.inscripcionMultiplePersonasSchema = exports.inscripcionMasivaSchema = exports.participacionQuerySchema = exports.updateParticipacionSchema = exports.createParticipacionSchema = void 0;
const zod_1 = require("zod");
const participacionBaseSchema = zod_1.z.object({
    personaId: zod_1.z.number().int('El ID de persona debe ser un número entero').positive('El ID de persona debe ser positivo'),
    actividadId: zod_1.z.number().int('El ID de actividad debe ser un número entero').positive('El ID de actividad debe ser positivo'),
    fechaInicio: zod_1.z.coerce.date({
        required_error: 'Fecha de inicio es requerida',
        invalid_type_error: 'Fecha de inicio debe ser una fecha válida'
    }),
    fechaFin: zod_1.z.coerce.date().optional().nullable(),
    precioEspecial: zod_1.z.preprocess((val) => {
        if (val === null || val === undefined || val === '')
            return null;
        const num = parseFloat(val);
        return isNaN(num) ? val : num;
    }, zod_1.z.number().min(0, 'El precio especial debe ser mayor o igual a 0').nullable().optional()),
    activa: zod_1.z.boolean().optional().default(true),
    observaciones: zod_1.z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional()
});
const validarFechas = (data) => {
    if (data.fechaFin && data.fechaInicio) {
        if (new Date(data.fechaFin) <= new Date(data.fechaInicio)) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
    }
    return true;
};
const validarFechaInicio = (data) => {
    const ahora = new Date();
    const fechaInicio = new Date(data.fechaInicio);
    const hace30Dias = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));
    if (fechaInicio < hace30Dias) {
        throw new Error('La fecha de inicio no puede ser anterior a 30 días atrás');
    }
    return true;
};
exports.createParticipacionSchema = participacionBaseSchema
    .refine(validarFechas, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin']
})
    .refine(validarFechaInicio, {
    message: 'La fecha de inicio no puede ser muy antigua',
    path: ['fechaInicio']
});
exports.updateParticipacionSchema = zod_1.z.object({
    fechaInicio: zod_1.z.coerce.date().optional(),
    fechaFin: zod_1.z.coerce.date().optional().nullable(),
    precioEspecial: zod_1.z.preprocess((val) => {
        if (val === null || val === undefined || val === '')
            return null;
        const num = parseFloat(val);
        return isNaN(num) ? val : num;
    }, zod_1.z.number().min(0, 'El precio especial debe ser mayor o igual a 0').nullable().optional()),
    activa: zod_1.z.boolean().optional(),
    observaciones: zod_1.z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional()
}).refine((data) => {
    if (data.fechaFin && data.fechaInicio) {
        return validarFechas(data);
    }
    return true;
}, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin']
});
exports.participacionQuerySchema = zod_1.z.object({
    personaId: zod_1.z.preprocess((val) => {
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
    activa: zod_1.z.preprocess((val) => {
        if (val === 'true')
            return true;
        if (val === 'false')
            return false;
        return undefined;
    }, zod_1.z.boolean().optional()),
    fechaDesde: zod_1.z.coerce.date().optional(),
    fechaHasta: zod_1.z.coerce.date().optional(),
    conPrecioEspecial: zod_1.z.preprocess((val) => {
        if (val === 'true')
            return true;
        if (val === 'false')
            return false;
        return undefined;
    }, zod_1.z.boolean().optional()),
    search: zod_1.z.string().optional(),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10)),
    sortBy: zod_1.z.enum(['fechaInicio', 'fechaFin', 'persona', 'actividad', 'createdAt']).default('fechaInicio'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
exports.inscripcionMasivaSchema = zod_1.z.object({
    personaId: zod_1.z.number().int().positive('El ID de persona debe ser positivo'),
    actividades: zod_1.z.array(zod_1.z.object({
        actividadId: zod_1.z.number().int().positive('El ID de actividad debe ser positivo'),
        fechaInicio: zod_1.z.coerce.date(),
        fechaFin: zod_1.z.coerce.date().optional().nullable(),
        precioEspecial: zod_1.z.number().min(0).optional().nullable(),
        observaciones: zod_1.z.string().max(1000).optional()
    })).min(1, 'Debe seleccionar al menos una actividad'),
    aplicarDescuentoFamiliar: zod_1.z.boolean().default(false)
});
exports.inscripcionMultiplePersonasSchema = zod_1.z.object({
    actividadId: zod_1.z.number().int().positive('El ID de actividad debe ser positivo'),
    personas: zod_1.z.array(zod_1.z.object({
        personaId: zod_1.z.number().int().positive('El ID de persona debe ser positivo'),
        fechaInicio: zod_1.z.coerce.date(),
        precioEspecial: zod_1.z.number().min(0).optional().nullable(),
        observaciones: zod_1.z.string().max(1000).optional()
    })).min(1, 'Debe seleccionar al menos una persona'),
    fechaInicioComun: zod_1.z.coerce.date().optional(),
    precioEspecialComun: zod_1.z.number().min(0).optional().nullable(),
    observacionesComunes: zod_1.z.string().max(1000).optional()
});
exports.desincripcionSchema = zod_1.z.object({
    fechaFin: zod_1.z.coerce.date().optional(),
    motivoDesincripcion: zod_1.z.string().max(500, 'El motivo no puede exceder 500 caracteres').optional()
});
exports.estadisticasParticipacionSchema = zod_1.z.object({
    fechaDesde: zod_1.z.coerce.date().optional(),
    fechaHasta: zod_1.z.coerce.date().optional(),
    agruparPor: zod_1.z.enum(['mes', 'actividad', 'persona', 'tipo_actividad']).default('mes'),
    soloActivas: zod_1.z.boolean().default(true)
});
exports.reporteInasistenciasSchema = zod_1.z.object({
    actividadId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    personaId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    fechaDesde: zod_1.z.coerce.date(),
    fechaHasta: zod_1.z.coerce.date(),
    umbralInasistencias: zod_1.z.number().int().min(1).default(3)
});
exports.verificarCuposSchema = zod_1.z.object({
    actividadId: zod_1.z.number().int().positive('El ID de actividad debe ser positivo'),
    fechaConsulta: zod_1.z.coerce.date().default(() => new Date())
});
exports.transferirParticipacionSchema = zod_1.z.object({
    nuevaActividadId: zod_1.z.number().int().positive('El ID de nueva actividad debe ser positivo'),
    fechaTransferencia: zod_1.z.coerce.date().default(() => new Date()),
    conservarFechaInicio: zod_1.z.boolean().default(false),
    observaciones: zod_1.z.string().max(500).optional()
});
var EstadoParticipacion;
(function (EstadoParticipacion) {
    EstadoParticipacion["ACTIVA"] = "ACTIVA";
    EstadoParticipacion["FINALIZADA"] = "FINALIZADA";
    EstadoParticipacion["SUSPENDIDA"] = "SUSPENDIDA";
})(EstadoParticipacion || (exports.EstadoParticipacion = EstadoParticipacion = {}));
const determinarEstado = (participacion) => {
    if (!participacion.activa) {
        return EstadoParticipacion.SUSPENDIDA;
    }
    if (participacion.fechaFin && participacion.fechaFin <= new Date()) {
        return EstadoParticipacion.FINALIZADA;
    }
    return EstadoParticipacion.ACTIVA;
};
exports.determinarEstado = determinarEstado;
const calcularDuracionParticipacion = (fechaInicio, fechaFin = null) => {
    const fin = fechaFin || new Date();
    const diffTime = Math.abs(fin.getTime() - fechaInicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
exports.calcularDuracionParticipacion = calcularDuracionParticipacion;
const validarSolapamientoParticipaciones = (nuevaParticipacion, participacionesExistentes) => {
    const conflictos = [];
    const participacionesActivas = participacionesExistentes.filter(p => p.activa && p.personaId === nuevaParticipacion.personaId);
    for (const participacion of participacionesActivas) {
        const inicioExistente = participacion.fechaInicio;
        const finExistente = participacion.fechaFin || new Date('2099-12-31');
        const inicioNueva = nuevaParticipacion.fechaInicio;
        const finNueva = nuevaParticipacion.fechaFin || new Date('2099-12-31');
        const haySolapamiento = inicioNueva < finExistente && finNueva > inicioExistente;
        if (haySolapamiento) {
            conflictos.push(`Conflicto con participación existente en actividad ${participacion.actividadId} (${inicioExistente.toISOString().split('T')[0]} - ${participacion.fechaFin ? participacion.fechaFin.toISOString().split('T')[0] : 'indefinida'})`);
        }
    }
    return {
        valido: conflictos.length === 0,
        conflictos
    };
};
exports.validarSolapamientoParticipaciones = validarSolapamientoParticipaciones;
//# sourceMappingURL=participacion.dto.js.map