"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewCuotasSocioSchema = exports.previewCuotaSchema = exports.validarRollbackSchema = exports.rollbackCuotaSchema = exports.rollbackGeneracionSchema = exports.validarAjusteMasivoSchema = exports.descuentoGlobalSchema = exports.modificarItemsMasivoSchema = exports.ajusteMasivoSchema = exports.simularImpactoMasivoSchema = exports.compararEscenariosSchema = exports.simularReglaDescuentoSchema = exports.simularGeneracionSchema = exports.compararCuotaSchema = exports.previewRecalculoSchema = exports.regenerarCuotasSchema = exports.recalcularCuotaSchema = exports.reporteCuotasSchema = exports.recalcularCuotasSchema = exports.deleteBulkCuotasSchema = exports.cuotaStatsSchema = exports.cuotaSearchSchema = exports.calcularCuotaSchema = exports.cuotaQuerySchema = exports.generarCuotasSchema = exports.updateCuotaSchema = exports.createCuotaSchema = void 0;
const zod_1 = require("zod");
exports.createCuotaSchema = zod_1.z.object({
    reciboId: zod_1.z.number().int().positive('ID de recibo inválido'),
    categoriaId: zod_1.z.number().int().positive('ID de categoría inválido'),
    mes: zod_1.z.number()
        .int('El mes debe ser un número entero')
        .min(1, 'El mes debe ser entre 1 y 12')
        .max(12, 'El mes debe ser entre 1 y 12'),
    anio: zod_1.z.number()
        .int('El año debe ser un número entero')
        .min(2020, 'El año debe ser 2020 o posterior')
        .max(2030, 'El año no puede ser mayor a 2030'),
    montoBase: zod_1.z.number()
        .positive('El monto base debe ser mayor a 0')
        .max(100000, 'El monto base no puede exceder $100,000'),
    montoActividades: zod_1.z.number()
        .min(0, 'El monto de actividades no puede ser negativo')
        .max(50000, 'El monto de actividades no puede exceder $50,000')
        .default(0),
    montoTotal: zod_1.z.number()
        .positive('El monto total debe ser mayor a 0')
        .max(150000, 'El monto total no puede exceder $150,000')
}).refine((data) => {
    const calculatedTotal = data.montoBase + data.montoActividades;
    return Math.abs(data.montoTotal - calculatedTotal) < 0.01;
}, {
    message: 'El monto total debe ser igual a la suma de monto base + monto actividades',
    path: ['montoTotal']
}).refine((data) => {
    const currentDate = new Date();
    const cuotaDate = new Date(data.anio, data.mes - 1, 1);
    const maxAllowedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1);
    return cuotaDate <= maxAllowedDate;
}, {
    message: 'No se pueden crear cuotas con más de 2 meses de anticipación',
    path: ['mes']
});
exports.updateCuotaSchema = zod_1.z.object({
    categoriaId: zod_1.z.number().int().positive('ID de categoría inválido').optional(),
    mes: zod_1.z.number()
        .int('El mes debe ser un número entero')
        .min(1, 'El mes debe ser entre 1 y 12')
        .max(12, 'El mes debe ser entre 1 y 12')
        .optional(),
    anio: zod_1.z.number()
        .int('El año debe ser un número entero')
        .min(2020, 'El año debe ser 2020 o posterior')
        .max(2030, 'El año no puede ser mayor a 2030')
        .optional(),
    montoBase: zod_1.z.number()
        .positive('El monto base debe ser mayor a 0')
        .max(100000, 'El monto base no puede exceder $100,000')
        .optional(),
    montoActividades: zod_1.z.number()
        .min(0, 'El monto de actividades no puede ser negativo')
        .max(50000, 'El monto de actividades no puede exceder $50,000')
        .optional(),
    montoTotal: zod_1.z.number()
        .positive('El monto total debe ser mayor a 0')
        .max(150000, 'El monto total no puede exceder $150,000')
        .optional()
});
exports.generarCuotasSchema = zod_1.z.object({
    mes: zod_1.z.number()
        .int('El mes debe ser un número entero')
        .min(1, 'El mes debe ser entre 1 y 12')
        .max(12, 'El mes debe ser entre 1 y 12'),
    anio: zod_1.z.number()
        .int('El año debe ser un número entero')
        .min(2020, 'El año debe ser 2020 o posterior')
        .max(2030, 'El año no puede ser mayor a 2030'),
    categoriaIds: zod_1.z.array(zod_1.z.number().int().positive('ID de categoría inválido'))
        .min(1, 'Debe especificar al menos un ID de categoría')
        .optional(),
    incluirInactivos: zod_1.z.boolean()
        .default(false),
    aplicarDescuentos: zod_1.z.boolean()
        .default(true),
    observaciones: zod_1.z.string()
        .max(200, 'Las observaciones no pueden exceder 200 caracteres')
        .optional()
}).refine((data) => {
    const currentDate = new Date();
    const cuotaDate = new Date(data.anio, data.mes - 1, 1);
    const minAllowedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
    return cuotaDate >= minAllowedDate;
}, {
    message: 'No se pueden generar cuotas de más de 6 meses en el pasado',
    path: ['mes']
});
exports.cuotaQuerySchema = zod_1.z.object({
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10)),
    categoriaId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    mes: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().min(1).max(12).optional()),
    anio: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().min(2020).max(2030).optional()),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional(),
    reciboId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    soloImpagas: zod_1.z.string()
        .transform(val => val === 'true')
        .optional(),
    soloVencidas: zod_1.z.string()
        .transform(val => val === 'true')
        .optional(),
    ordenarPor: zod_1.z.enum(['fecha', 'monto', 'categoria', 'vencimiento'])
        .default('fecha'),
    orden: zod_1.z.enum(['asc', 'desc']).default('desc')
});
exports.calcularCuotaSchema = zod_1.z.object({
    categoriaId: zod_1.z.number().int().positive('ID de categoría inválido'),
    mes: zod_1.z.number().int().min(1).max(12).optional(),
    anio: zod_1.z.number().int().min(2020).max(2030).optional(),
    socioId: zod_1.z.number().int().positive('ID de socio inválido').optional(),
    incluirActividades: zod_1.z.boolean().default(true),
    aplicarDescuentos: zod_1.z.boolean().default(true)
});
exports.cuotaSearchSchema = zod_1.z.object({
    search: zod_1.z.string()
        .min(1, 'El término de búsqueda es requerido')
        .max(50, 'El término de búsqueda no puede exceder 50 caracteres'),
    searchBy: zod_1.z.enum(['socio', 'numero_recibo', 'all'])
        .default('all'),
    categoriaId: zod_1.z.number().int().positive().optional(),
    mes: zod_1.z.number().int().min(1).max(12).optional(),
    anio: zod_1.z.number().int().min(2020).max(2030).optional(),
    estado: zod_1.z.enum(['PENDIENTE', 'PAGADO', 'VENCIDO', 'CANCELADO']).optional()
});
exports.cuotaStatsSchema = zod_1.z.object({
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional(),
    agruparPor: zod_1.z.enum(['categoria', 'mes', 'estado', 'general'])
        .default('general')
}).refine((data) => {
    if (data.fechaDesde && data.fechaHasta) {
        const desde = new Date(data.fechaDesde);
        const hasta = new Date(data.fechaHasta);
        return desde < hasta;
    }
    return true;
}, {
    message: 'La fecha desde debe ser anterior a la fecha hasta',
    path: ['fechaHasta']
});
exports.deleteBulkCuotasSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.number().int().positive())
        .min(1, 'Debe proporcionar al menos un ID')
        .max(100, 'No se pueden eliminar más de 100 cuotas a la vez'),
    confirmarEliminacion: zod_1.z.boolean()
        .refine(val => val === true, {
        message: 'Debe confirmar la eliminación'
    })
});
exports.recalcularCuotasSchema = zod_1.z.object({
    mes: zod_1.z.number().int().min(1).max(12),
    anio: zod_1.z.number().int().min(2020).max(2030),
    categoriaId: zod_1.z.number().int().positive().optional(),
    aplicarDescuentos: zod_1.z.boolean().default(true),
    actualizarRecibos: zod_1.z.boolean().default(false)
});
exports.reporteCuotasSchema = zod_1.z.object({
    mes: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().min(1).max(12)),
    anio: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().min(2020).max(2030)),
    categoriaId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    formato: zod_1.z.enum(['json', 'excel', 'pdf']).default('json'),
    incluirDetalle: zod_1.z.string()
        .transform(val => val === 'true')
        .optional()
        .default('true'),
    incluirEstadisticas: zod_1.z.string()
        .transform(val => val === 'true')
        .optional()
        .default('true')
});
exports.recalcularCuotaSchema = zod_1.z.object({
    cuotaId: zod_1.z.number().int().positive('El ID de cuota debe ser un número positivo'),
    aplicarAjustes: zod_1.z.boolean().default(true),
    aplicarExenciones: zod_1.z.boolean().default(true),
    aplicarDescuentos: zod_1.z.boolean().default(true),
    usuario: zod_1.z.string().max(100).optional()
});
exports.regenerarCuotasSchema = zod_1.z.object({
    mes: zod_1.z.number().int().min(1, 'El mes debe ser entre 1 y 12').max(12, 'El mes debe ser entre 1 y 12'),
    anio: zod_1.z.number().int().min(2020, 'El año debe ser 2020 o posterior').max(2030, 'El año no puede ser mayor a 2030'),
    categoriaId: zod_1.z.number().int().positive().optional(),
    personaId: zod_1.z.number().int().positive().optional(),
    aplicarAjustes: zod_1.z.boolean().default(true),
    aplicarExenciones: zod_1.z.boolean().default(true),
    aplicarDescuentos: zod_1.z.boolean().default(true),
    confirmarRegeneracion: zod_1.z.boolean().refine(val => val === true, {
        message: 'Debe confirmar la regeneración de cuotas'
    })
});
exports.previewRecalculoSchema = zod_1.z.object({
    cuotaId: zod_1.z.number().int().positive().optional(),
    mes: zod_1.z.number().int().min(1).max(12).optional(),
    anio: zod_1.z.number().int().min(2020).max(2030).optional(),
    categoriaId: zod_1.z.number().int().positive().optional(),
    personaId: zod_1.z.number().int().positive().optional(),
    aplicarAjustes: zod_1.z.boolean().default(true),
    aplicarExenciones: zod_1.z.boolean().default(true),
    aplicarDescuentos: zod_1.z.boolean().default(true)
}).refine(data => data.cuotaId || (data.mes && data.anio), {
    message: 'Debe proporcionar cuotaId o (mes + anio)',
    path: ['cuotaId']
});
exports.compararCuotaSchema = zod_1.z.object({
    cuotaId: zod_1.z.number().int().positive('El ID de cuota debe ser un número positivo'),
    cambiosPropuestos: zod_1.z.object({
        nuevoDescuento: zod_1.z.number().min(0).max(100).optional(),
        nuevosAjustes: zod_1.z.array(zod_1.z.object({
            tipoItemCuotaId: zod_1.z.number().int().positive(),
            monto: zod_1.z.number(),
            motivo: zod_1.z.string().min(10).max(200)
        })).optional(),
        nuevasExenciones: zod_1.z.array(zod_1.z.object({
            tipoItemCuotaId: zod_1.z.number().int().positive(),
            porcentaje: zod_1.z.number().min(0).max(100),
            motivo: zod_1.z.string().min(10).max(200)
        })).optional()
    }).optional()
});
exports.simularGeneracionSchema = zod_1.z.object({
    mes: zod_1.z.number().int().min(1, 'El mes debe ser entre 1 y 12').max(12, 'El mes debe ser entre 1 y 12'),
    anio: zod_1.z.number().int().min(2020, 'El año debe ser 2020 o posterior').max(2030, 'El año no puede ser mayor a 2030'),
    categoriaIds: zod_1.z.array(zod_1.z.number().int().positive('ID de categoría inválido')).optional(),
    socioIds: zod_1.z.array(zod_1.z.number().int().positive('ID de socio inválido')).optional(),
    aplicarDescuentos: zod_1.z.boolean().default(true),
    aplicarAjustes: zod_1.z.boolean().default(true),
    aplicarExenciones: zod_1.z.boolean().default(true),
    incluirInactivos: zod_1.z.boolean().default(false)
}).refine(data => !data.categoriaIds || data.categoriaIds.length > 0, {
    message: 'Si proporciona categorías, debe incluir al menos una',
    path: ['categoriaIds']
}).refine(data => !data.socioIds || data.socioIds.length > 0, {
    message: 'Si proporciona socios, debe incluir al menos uno',
    path: ['socioIds']
});
exports.simularReglaDescuentoSchema = zod_1.z.object({
    mes: zod_1.z.number().int().min(1).max(12),
    anio: zod_1.z.number().int().min(2020).max(2030),
    reglasModificadas: zod_1.z.array(zod_1.z.object({
        reglaId: zod_1.z.number().int().positive().optional(),
        tipo: zod_1.z.enum(['ANTIGUEDAD', 'FAMILIAR', 'CATEGORIA', 'COMBINADA']),
        porcentaje: zod_1.z.number().min(0, 'El porcentaje debe ser entre 0 y 100').max(100, 'El porcentaje debe ser entre 0 y 100'),
        condiciones: zod_1.z.record(zod_1.z.any()),
        activa: zod_1.z.boolean().default(true)
    })),
    reglasNuevas: zod_1.z.array(zod_1.z.object({
        codigo: zod_1.z.string().min(3, 'El código debe tener al menos 3 caracteres'),
        nombre: zod_1.z.string().min(5, 'El nombre debe tener al menos 5 caracteres'),
        tipo: zod_1.z.enum(['ANTIGUEDAD', 'FAMILIAR', 'CATEGORIA', 'COMBINADA']),
        porcentaje: zod_1.z.number().min(0).max(100),
        condiciones: zod_1.z.record(zod_1.z.any()),
        activa: zod_1.z.boolean().default(true)
    })).optional(),
    socioIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    categoriaIds: zod_1.z.array(zod_1.z.number().int().positive()).optional()
});
exports.compararEscenariosSchema = zod_1.z.object({
    mes: zod_1.z.number().int().min(1).max(12),
    anio: zod_1.z.number().int().min(2020).max(2030),
    escenarios: zod_1.z.array(zod_1.z.object({
        nombre: zod_1.z.string().min(3, 'El nombre del escenario debe tener al menos 3 caracteres'),
        descripcion: zod_1.z.string().max(200, 'La descripción no puede exceder 200 caracteres').optional(),
        aplicarDescuentos: zod_1.z.boolean().default(true),
        aplicarAjustes: zod_1.z.boolean().default(true),
        aplicarExenciones: zod_1.z.boolean().default(true),
        porcentajeDescuentoGlobal: zod_1.z.number().min(0).max(100).optional(),
        montoFijoDescuento: zod_1.z.number().min(0).optional()
    })).min(2, 'Debe proporcionar al menos 2 escenarios para comparar').max(5, 'No se pueden comparar más de 5 escenarios'),
    socioIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    categoriaIds: zod_1.z.array(zod_1.z.number().int().positive()).optional()
});
exports.simularImpactoMasivoSchema = zod_1.z.object({
    mes: zod_1.z.number().int().min(1).max(12),
    anio: zod_1.z.number().int().min(2020).max(2030),
    cambios: zod_1.z.object({
        nuevosMontosPorCategoria: zod_1.z.record(zod_1.z.string(), zod_1.z.number().positive()).optional(),
        nuevasPorcentajesDescuento: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0).max(100)).optional(),
        ajusteGlobalPorcentaje: zod_1.z.number().min(-50).max(50).optional(),
        ajusteGlobalMonto: zod_1.z.number().optional()
    }),
    incluirProyeccion: zod_1.z.boolean().default(false),
    mesesProyeccion: zod_1.z.number().int().min(1).max(12).optional()
});
exports.ajusteMasivoSchema = zod_1.z.object({
    filtros: zod_1.z.object({
        mes: zod_1.z.number().int().min(1).max(12).optional(),
        anio: zod_1.z.number().int().min(2020).max(2030).optional(),
        categoriaIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
        socioIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
        estadoCuota: zod_1.z.enum(['PENDIENTE', 'PAGADO', 'VENCIDO', 'ANULADO']).optional()
    }),
    tipoAjuste: zod_1.z.enum(['DESCUENTO_PORCENTAJE', 'DESCUENTO_FIJO', 'RECARGO_PORCENTAJE', 'RECARGO_FIJO', 'MONTO_FIJO_TOTAL']),
    valor: zod_1.z.number().min(0, 'El valor debe ser mayor o igual a 0'),
    motivo: zod_1.z.string().min(10, 'El motivo debe tener al menos 10 caracteres').max(200, 'El motivo no puede exceder 200 caracteres'),
    condiciones: zod_1.z.object({
        montoMinimo: zod_1.z.number().min(0).optional(),
        montoMaximo: zod_1.z.number().min(0).optional(),
        soloConDescuentos: zod_1.z.boolean().optional(),
        soloSinExenciones: zod_1.z.boolean().optional()
    }).optional(),
    modo: zod_1.z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
    confirmarAplicacion: zod_1.z.boolean().optional()
}).refine(data => data.tipoAjuste !== 'DESCUENTO_PORCENTAJE' || data.valor <= 100, {
    message: 'El porcentaje de descuento no puede exceder 100%',
    path: ['valor']
}).refine(data => data.tipoAjuste !== 'RECARGO_PORCENTAJE' || data.valor <= 100, {
    message: 'El porcentaje de recargo no puede exceder 100%',
    path: ['valor']
}).refine(data => data.modo !== 'APLICAR' || data.confirmarAplicacion === true, {
    message: 'Debe confirmar la aplicación del ajuste masivo',
    path: ['confirmarAplicacion']
});
exports.modificarItemsMasivoSchema = zod_1.z.object({
    filtros: zod_1.z.object({
        mes: zod_1.z.number().int().min(1).max(12).optional(),
        anio: zod_1.z.number().int().min(2020).max(2030).optional(),
        categoriaItemId: zod_1.z.number().int().positive().optional(),
        tipoItemId: zod_1.z.number().int().positive().optional(),
        conceptoContiene: zod_1.z.string().min(3).optional()
    }),
    modificaciones: zod_1.z.object({
        nuevoConcepto: zod_1.z.string().min(3).max(100).optional(),
        nuevoMonto: zod_1.z.number().min(0).optional(),
        nuevoPorcentaje: zod_1.z.number().min(0).max(100).optional(),
        multiplicarMonto: zod_1.z.number().min(0.1).max(10).optional()
    }),
    motivo: zod_1.z.string().min(10).max(200),
    modo: zod_1.z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
    confirmarModificacion: zod_1.z.boolean().optional()
}).refine(data => Object.keys(data.modificaciones).length > 0, {
    message: 'Debe especificar al menos una modificación',
    path: ['modificaciones']
}).refine(data => data.modo !== 'APLICAR' || data.confirmarModificacion === true, {
    message: 'Debe confirmar la modificación masiva',
    path: ['confirmarModificacion']
});
exports.descuentoGlobalSchema = zod_1.z.object({
    mes: zod_1.z.number().int().min(1).max(12),
    anio: zod_1.z.number().int().min(2020).max(2030),
    tipoDescuento: zod_1.z.enum(['PORCENTAJE', 'MONTO_FIJO']),
    valor: zod_1.z.number().min(0),
    motivo: zod_1.z.string().min(10).max(200),
    filtros: zod_1.z.object({
        categoriaIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
        socioIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
        montoMinimo: zod_1.z.number().min(0).optional()
    }).optional(),
    modo: zod_1.z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
    confirmarDescuento: zod_1.z.boolean().optional()
}).refine(data => data.tipoDescuento !== 'PORCENTAJE' || data.valor <= 100, {
    message: 'El porcentaje de descuento no puede exceder 100%',
    path: ['valor']
}).refine(data => data.modo !== 'APLICAR' || data.confirmarDescuento === true, {
    message: 'Debe confirmar el descuento global',
    path: ['confirmarDescuento']
});
exports.validarAjusteMasivoSchema = zod_1.z.object({
    cuotasAfectadas: zod_1.z.number().int().min(0),
    montoTotalOriginal: zod_1.z.number().min(0),
    montoTotalNuevo: zod_1.z.number().min(0),
    impactoEconomico: zod_1.z.number(),
    advertencias: zod_1.z.array(zod_1.z.string()),
    errores: zod_1.z.array(zod_1.z.string())
});
exports.rollbackGeneracionSchema = zod_1.z.object({
    mes: zod_1.z.number().int().min(1).max(12),
    anio: zod_1.z.number().int().min(2020).max(2030),
    categoriaIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    socioIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    modo: zod_1.z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
    opciones: zod_1.z.object({
        eliminarCuotasPendientes: zod_1.z.boolean().default(true),
        eliminarCuotasPagadas: zod_1.z.boolean().default(false),
        restaurarRecibos: zod_1.z.boolean().default(true),
        crearBackup: zod_1.z.boolean().default(true)
    }).optional(),
    confirmarRollback: zod_1.z.boolean().optional(),
    motivo: zod_1.z.string().min(10, 'El motivo debe tener al menos 10 caracteres').max(200).optional()
}).refine(data => data.modo !== 'APLICAR' || data.confirmarRollback === true, {
    message: 'Debe confirmar el rollback para aplicar',
    path: ['confirmarRollback']
}).refine(data => data.modo !== 'APLICAR' || data.motivo, {
    message: 'Debe proporcionar un motivo para el rollback',
    path: ['motivo']
});
exports.rollbackCuotaSchema = zod_1.z.object({
    cuotaId: zod_1.z.number().int().positive('El ID de cuota debe ser un número positivo'),
    eliminarItemsAsociados: zod_1.z.boolean().default(true),
    eliminarRecibo: zod_1.z.boolean().default(true),
    modo: zod_1.z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
    confirmarRollback: zod_1.z.boolean().optional(),
    motivo: zod_1.z.string().min(10).max(200).optional()
}).refine(data => data.modo !== 'APLICAR' || data.confirmarRollback === true, {
    message: 'Debe confirmar el rollback',
    path: ['confirmarRollback']
});
exports.validarRollbackSchema = zod_1.z.object({
    mes: zod_1.z.number().int().min(1).max(12),
    anio: zod_1.z.number().int().min(2020).max(2030),
    categoriaIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    socioIds: zod_1.z.array(zod_1.z.number().int().positive()).optional()
});
exports.previewCuotaSchema = zod_1.z.object({
    cuotaId: zod_1.z.number().int().positive().optional(),
    socioId: zod_1.z.number().int().positive().optional(),
    mes: zod_1.z.number().int().min(1).max(12).optional(),
    anio: zod_1.z.number().int().min(2020).max(2030).optional(),
    categoriaId: zod_1.z.number().int().positive().optional(),
    incluirDetalleItems: zod_1.z.boolean().default(true),
    incluirExplicacionDescuentos: zod_1.z.boolean().default(true),
    incluirHistorialCambios: zod_1.z.boolean().default(false),
    formato: zod_1.z.enum(['COMPLETO', 'RESUMIDO', 'SIMPLE']).default('COMPLETO')
}).refine(data => data.cuotaId !== undefined || (data.socioId !== undefined && data.mes !== undefined && data.anio !== undefined), {
    message: 'Debe proporcionar cuotaId O (socioId + mes + anio)',
    path: ['cuotaId']
});
exports.previewCuotasSocioSchema = zod_1.z.object({
    socioId: zod_1.z.number().int().positive('ID de socio debe ser positivo'),
    mesDesde: zod_1.z.number().int().min(1).max(12),
    anioDesde: zod_1.z.number().int().min(2020).max(2030),
    mesHasta: zod_1.z.number().int().min(1).max(12).optional(),
    anioHasta: zod_1.z.number().int().min(2020).max(2030).optional(),
    incluirPagadas: zod_1.z.boolean().default(false),
    incluirAnuladas: zod_1.z.boolean().default(false),
    formato: zod_1.z.enum(['COMPLETO', 'RESUMIDO', 'SIMPLE']).default('RESUMIDO')
});
//# sourceMappingURL=cuota.dto.js.map