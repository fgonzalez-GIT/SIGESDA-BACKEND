"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportarReporteSchema = exports.estadisticasRecaudacionSchema = exports.reporteComparativoSchema = exports.reporteExencionesSchema = exports.analisisDescuentosSchema = exports.reportePorCategoriaSchema = exports.dashboardCuotasSchema = void 0;
const zod_1 = require("zod");
exports.dashboardCuotasSchema = zod_1.z.object({
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
    }, zod_1.z.number().int().min(2020).max(2030).optional())
});
exports.reportePorCategoriaSchema = zod_1.z.object({
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
    incluirDetalle: zod_1.z.string()
        .transform(val => val === 'true')
        .optional()
        .default('false')
});
exports.analisisDescuentosSchema = zod_1.z.object({
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
    tipoDescuento: zod_1.z.enum(['ajustes', 'reglas', 'exenciones', 'todos']).optional().default('todos')
});
exports.reporteExencionesSchema = zod_1.z.object({
    estado: zod_1.z.enum(['PENDIENTE_APROBACION', 'APROBADA', 'RECHAZADA', 'VIGENTE', 'VENCIDA', 'REVOCADA', 'TODAS'])
        .optional()
        .default('VIGENTE'),
    categoriaId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    motivoExencion: zod_1.z.enum(['BECA', 'SOCIO_FUNDADOR', 'SOCIO_HONORARIO', 'SITUACION_ECONOMICA', 'SITUACION_SALUD', 'INTERCAMBIO_SERVICIOS', 'PROMOCION', 'FAMILIAR_DOCENTE', 'OTRO', 'TODOS'])
        .optional()
        .default('TODOS'),
    incluirHistorico: zod_1.z.string()
        .transform(val => val === 'true')
        .optional()
        .default('false')
});
exports.reporteComparativoSchema = zod_1.z.object({
    mesInicio: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().min(1).max(12)),
    anioInicio: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().min(2020).max(2030)),
    mesFin: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().min(1).max(12)),
    anioFin: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().min(2020).max(2030))
}).refine((data) => {
    const fechaInicio = new Date(data.anioInicio, data.mesInicio - 1);
    const fechaFin = new Date(data.anioFin, data.mesFin - 1);
    return fechaInicio <= fechaFin;
}, {
    message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
    path: ['mesFin']
});
exports.estadisticasRecaudacionSchema = zod_1.z.object({
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
    categoriaId: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional())
});
exports.exportarReporteSchema = zod_1.z.object({
    tipoReporte: zod_1.z.enum(['dashboard', 'categoria', 'descuentos', 'exenciones', 'comparativo', 'recaudacion']),
    formato: zod_1.z.enum(['json', 'excel', 'pdf', 'csv']).default('json'),
    parametros: zod_1.z.record(zod_1.z.any()).optional()
});
//# sourceMappingURL=reportes-cuota.dto.js.map