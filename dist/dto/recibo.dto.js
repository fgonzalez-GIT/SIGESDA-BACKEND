"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportSchema = exports.processPaymentSchema = exports.reciboStatsSchema = exports.reciboSearchSchema = exports.updateBulkEstadosSchema = exports.deleteBulkRecibosSchema = exports.createBulkRecibosSchema = exports.reciboQuerySchema = exports.changeEstadoReciboSchema = exports.updateReciboSchema = exports.createReciboSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createReciboSchema = zod_1.z.object({
    tipo: zod_1.z.nativeEnum(client_1.TipoRecibo, {
        errorMap: () => ({ message: 'Tipo de recibo inválido' })
    }),
    importe: zod_1.z.number().positive('El importe debe ser mayor a 0'),
    fecha: zod_1.z.string().datetime('Fecha inválida').optional(),
    fechaVencimiento: zod_1.z.string().datetime('Fecha de vencimiento inválida').optional(),
    concepto: zod_1.z.string().min(1, 'Concepto es requerido').max(200, 'Concepto no puede exceder 200 caracteres'),
    observaciones: zod_1.z.string().max(500, 'Observaciones no pueden exceder 500 caracteres').optional(),
    emisorId: zod_1.z.string().cuid('ID de emisor inválido').optional(),
    receptorId: zod_1.z.string().cuid('ID de receptor inválido').optional()
}).refine((data) => {
    if (data.fechaVencimiento && data.fecha) {
        const fecha = new Date(data.fecha);
        const vencimiento = new Date(data.fechaVencimiento);
        return vencimiento >= fecha;
    }
    return true;
}, {
    message: 'La fecha de vencimiento debe ser posterior o igual a la fecha del recibo',
    path: ['fechaVencimiento']
}).refine((data) => {
    if (data.tipo === client_1.TipoRecibo.CUOTA || data.tipo === client_1.TipoRecibo.PAGO_ACTIVIDAD) {
        return data.receptorId;
    }
    if (data.tipo === client_1.TipoRecibo.SUELDO) {
        return data.receptorId;
    }
    return true;
}, {
    message: 'Este tipo de recibo requiere especificar el receptor',
    path: ['receptorId']
});
exports.updateReciboSchema = zod_1.z.object({
    tipo: zod_1.z.nativeEnum(client_1.TipoRecibo).optional(),
    importe: zod_1.z.number().positive('El importe debe ser mayor a 0').optional(),
    fecha: zod_1.z.string().datetime('Fecha inválida').optional(),
    fechaVencimiento: zod_1.z.string().datetime('Fecha de vencimiento inválida').optional().nullable(),
    estado: zod_1.z.nativeEnum(client_1.EstadoRecibo).optional(),
    concepto: zod_1.z.string().min(1, 'Concepto es requerido').max(200).optional(),
    observaciones: zod_1.z.string().max(500).optional().nullable(),
    emisorId: zod_1.z.string().cuid('ID de emisor inválido').optional().nullable(),
    receptorId: zod_1.z.string().cuid('ID de receptor inválido').optional().nullable()
}).refine((data) => {
    if (data.fechaVencimiento && data.fecha) {
        const fecha = new Date(data.fecha);
        const vencimiento = new Date(data.fechaVencimiento);
        return vencimiento >= fecha;
    }
    return true;
}, {
    message: 'La fecha de vencimiento debe ser posterior o igual a la fecha del recibo',
    path: ['fechaVencimiento']
});
exports.changeEstadoReciboSchema = zod_1.z.object({
    nuevoEstado: zod_1.z.nativeEnum(client_1.EstadoRecibo, {
        errorMap: () => ({ message: 'Estado de recibo inválido' })
    }),
    observaciones: zod_1.z.string().max(500, 'Observaciones no pueden exceder 500 caracteres').optional()
});
exports.reciboQuerySchema = zod_1.z.object({
    tipo: zod_1.z.nativeEnum(client_1.TipoRecibo).optional(),
    estado: zod_1.z.nativeEnum(client_1.EstadoRecibo).optional(),
    emisorId: zod_1.z.string().cuid().optional(),
    receptorId: zod_1.z.string().cuid().optional(),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional(),
    vencidosOnly: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(false)),
    pendientesOnly: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(false)),
    importeMinimo: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? undefined : parsed;
        }
        return val;
    }, zod_1.z.number().positive().optional()),
    importeMaximo: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? undefined : parsed;
        }
        return val;
    }, zod_1.z.number().positive().optional()),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10))
});
exports.createBulkRecibosSchema = zod_1.z.object({
    recibos: zod_1.z.array(exports.createReciboSchema).min(1, 'Debe proporcionar al menos un recibo')
});
exports.deleteBulkRecibosSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string().cuid()).min(1, 'Debe proporcionar al menos un ID')
});
exports.updateBulkEstadosSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string().cuid()).min(1, 'Debe proporcionar al menos un ID'),
    nuevoEstado: zod_1.z.nativeEnum(client_1.EstadoRecibo),
    observaciones: zod_1.z.string().max(500).optional()
});
exports.reciboSearchSchema = zod_1.z.object({
    search: zod_1.z.string().min(1, 'Término de búsqueda requerido'),
    searchBy: zod_1.z.enum(['numero', 'concepto', 'emisor', 'receptor', 'all']).default('all'),
    tipo: zod_1.z.nativeEnum(client_1.TipoRecibo).optional(),
    estado: zod_1.z.nativeEnum(client_1.EstadoRecibo).optional(),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional()
});
exports.reciboStatsSchema = zod_1.z.object({
    fechaDesde: zod_1.z.string().datetime(),
    fechaHasta: zod_1.z.string().datetime(),
    agruparPor: zod_1.z.enum(['tipo', 'estado', 'mes', 'persona']).default('tipo')
}).refine((data) => {
    const desde = new Date(data.fechaDesde);
    const hasta = new Date(data.fechaHasta);
    return desde <= hasta;
}, {
    message: 'La fecha desde debe ser anterior o igual a la fecha hasta',
    path: ['fechaHasta']
});
exports.processPaymentSchema = zod_1.z.object({
    reciboId: zod_1.z.string().cuid('ID de recibo inválido'),
    mediosPago: zod_1.z.array(zod_1.z.object({
        tipo: zod_1.z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE']),
        importe: zod_1.z.number().positive('El importe del medio de pago debe ser mayor a 0'),
        numero: zod_1.z.string().max(50).optional(),
        fecha: zod_1.z.string().datetime().optional(),
        banco: zod_1.z.string().max(100).optional(),
        observaciones: zod_1.z.string().max(200).optional()
    })).min(1, 'Debe especificar al menos un medio de pago')
}).refine((data) => {
    return data.mediosPago.every(medio => {
        if (medio.tipo === 'CHEQUE' && !medio.numero) {
            return false;
        }
        if ((medio.tipo === 'TRANSFERENCIA' || medio.tipo === 'TARJETA_DEBITO' || medio.tipo === 'TARJETA_CREDITO') && !medio.banco) {
            return false;
        }
        return true;
    });
}, {
    message: 'Algunos medios de pago requieren información adicional (número para cheques, banco para transferencias/tarjetas)',
    path: ['mediosPago']
});
exports.generateReportSchema = zod_1.z.object({
    tipo: zod_1.z.enum(['resumen', 'detallado', 'vencimientos', 'cobranzas']),
    fechaDesde: zod_1.z.string().datetime(),
    fechaHasta: zod_1.z.string().datetime(),
    filtros: zod_1.z.object({
        tipos: zod_1.z.array(zod_1.z.nativeEnum(client_1.TipoRecibo)).optional(),
        estados: zod_1.z.array(zod_1.z.nativeEnum(client_1.EstadoRecibo)).optional(),
        personas: zod_1.z.array(zod_1.z.string().cuid()).optional()
    }).optional()
});
//# sourceMappingURL=recibo.dto.js.map