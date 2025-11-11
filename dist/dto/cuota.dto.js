"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reporteCuotasSchema = exports.recalcularCuotasSchema = exports.deleteBulkCuotasSchema = exports.cuotaStatsSchema = exports.cuotaSearchSchema = exports.calcularCuotaSchema = exports.cuotaQuerySchema = exports.generarCuotasSchema = exports.updateCuotaSchema = exports.createCuotaSchema = void 0;
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
//# sourceMappingURL=cuota.dto.js.map