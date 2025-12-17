"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aplicarAjusteACuotaSchema = exports.queryHistorialAjusteCuotaSchema = exports.queryAjusteCuotaSchema = exports.updateAjusteCuotaSchema = exports.createHistorialAjusteCuotaSchema = exports.createAjusteCuotaSchema = exports.AccionHistorialCuotaEnum = exports.ScopeAjusteCuotaEnum = exports.TipoAjusteCuotaEnum = void 0;
const zod_1 = require("zod");
exports.TipoAjusteCuotaEnum = zod_1.z.enum([
    'DESCUENTO_FIJO',
    'DESCUENTO_PORCENTAJE',
    'RECARGO_FIJO',
    'RECARGO_PORCENTAJE',
    'MONTO_FIJO_TOTAL'
]);
exports.ScopeAjusteCuotaEnum = zod_1.z.enum([
    'TODOS_ITEMS',
    'SOLO_BASE',
    'SOLO_ACTIVIDADES',
    'ITEMS_ESPECIFICOS'
]);
exports.AccionHistorialCuotaEnum = zod_1.z.enum([
    'CREAR_AJUSTE',
    'MODIFICAR_AJUSTE',
    'ELIMINAR_AJUSTE',
    'APLICAR_AJUSTE_MANUAL',
    'RECALCULAR_CUOTA',
    'REGENERAR_CUOTA'
]);
exports.createAjusteCuotaSchema = zod_1.z.object({
    personaId: zod_1.z.number().int().positive('El ID de persona debe ser un número positivo'),
    tipoAjuste: exports.TipoAjusteCuotaEnum,
    valor: zod_1.z.number().positive('El valor debe ser un número positivo'),
    concepto: zod_1.z.string().min(1, 'El concepto es obligatorio').max(200, 'El concepto no puede exceder 200 caracteres'),
    fechaInicio: zod_1.z.coerce.date(),
    fechaFin: zod_1.z.coerce.date().optional().nullable(),
    activo: zod_1.z.boolean().optional().default(true),
    motivo: zod_1.z.string().optional().nullable(),
    observaciones: zod_1.z.string().optional().nullable(),
    aplicaA: exports.ScopeAjusteCuotaEnum.optional().default('TODOS_ITEMS'),
    itemsAfectados: zod_1.z.array(zod_1.z.number().int().positive()).optional().nullable(),
    aprobadoPor: zod_1.z.string().max(100).optional().nullable()
}).refine(data => {
    if (data.aplicaA === 'ITEMS_ESPECIFICOS') {
        return data.itemsAfectados && data.itemsAfectados.length > 0;
    }
    return true;
}, {
    message: 'itemsAfectados debe contener al menos un item cuando aplicaA es ITEMS_ESPECIFICOS',
    path: ['itemsAfectados']
}).refine(data => {
    if (data.fechaFin && data.fechaInicio) {
        return data.fechaFin >= data.fechaInicio;
    }
    return true;
}, {
    message: 'fechaFin debe ser posterior a fechaInicio',
    path: ['fechaFin']
}).refine(data => {
    if (data.tipoAjuste === 'DESCUENTO_PORCENTAJE' || data.tipoAjuste === 'RECARGO_PORCENTAJE') {
        return data.valor <= 100;
    }
    return true;
}, {
    message: 'El porcentaje no puede exceder 100%',
    path: ['valor']
});
exports.createHistorialAjusteCuotaSchema = zod_1.z.object({
    ajusteId: zod_1.z.number().int().positive().optional().nullable(),
    cuotaId: zod_1.z.number().int().positive().optional().nullable(),
    personaId: zod_1.z.number().int().positive('El ID de persona debe ser un número positivo'),
    accion: exports.AccionHistorialCuotaEnum,
    datosPrevios: zod_1.z.any().optional().nullable(),
    datosNuevos: zod_1.z.any(),
    usuario: zod_1.z.string().max(100).optional().nullable(),
    motivoCambio: zod_1.z.string().optional().nullable()
}).refine(data => {
    return data.ajusteId || data.cuotaId;
}, {
    message: 'Al menos uno de ajusteId o cuotaId debe ser proporcionado',
    path: ['ajusteId']
});
exports.updateAjusteCuotaSchema = zod_1.z.object({
    tipoAjuste: exports.TipoAjusteCuotaEnum.optional(),
    valor: zod_1.z.number().positive('El valor debe ser un número positivo').optional(),
    concepto: zod_1.z.string().min(1).max(200).optional(),
    fechaInicio: zod_1.z.coerce.date().optional(),
    fechaFin: zod_1.z.coerce.date().optional().nullable(),
    activo: zod_1.z.boolean().optional(),
    motivo: zod_1.z.string().optional().nullable(),
    observaciones: zod_1.z.string().optional().nullable(),
    aplicaA: exports.ScopeAjusteCuotaEnum.optional(),
    itemsAfectados: zod_1.z.array(zod_1.z.number().int().positive()).optional().nullable(),
    aprobadoPor: zod_1.z.string().max(100).optional().nullable()
}).refine(data => {
    if (data.tipoAjuste && data.valor) {
        if (data.tipoAjuste === 'DESCUENTO_PORCENTAJE' || data.tipoAjuste === 'RECARGO_PORCENTAJE') {
            return data.valor <= 100;
        }
    }
    return true;
}, {
    message: 'El porcentaje no puede exceder 100%',
    path: ['valor']
});
exports.queryAjusteCuotaSchema = zod_1.z.object({
    personaId: zod_1.z.coerce.number().int().positive().optional(),
    tipoAjuste: exports.TipoAjusteCuotaEnum.optional(),
    activo: zod_1.z.coerce.boolean().optional(),
    aplicaA: exports.ScopeAjusteCuotaEnum.optional(),
    fechaDesde: zod_1.z.coerce.date().optional(),
    fechaHasta: zod_1.z.coerce.date().optional()
});
exports.queryHistorialAjusteCuotaSchema = zod_1.z.object({
    accion: exports.AccionHistorialCuotaEnum.optional(),
    personaId: zod_1.z.coerce.number().int().positive().optional(),
    cuotaId: zod_1.z.coerce.number().int().positive().optional(),
    ajusteId: zod_1.z.coerce.number().int().positive().optional(),
    fechaDesde: zod_1.z.coerce.date().optional(),
    fechaHasta: zod_1.z.coerce.date().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(50),
    offset: zod_1.z.coerce.number().int().nonnegative().optional().default(0)
});
exports.aplicarAjusteACuotaSchema = zod_1.z.object({
    cuotaId: zod_1.z.number().int().positive('El ID de cuota debe ser un número positivo'),
    ajusteId: zod_1.z.number().int().positive('El ID de ajuste debe ser un número positivo'),
    usuario: zod_1.z.string().max(100).optional().nullable(),
    motivoCambio: zod_1.z.string().optional().nullable()
});
//# sourceMappingURL=ajuste-cuota.dto.js.map