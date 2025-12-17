import { z } from 'zod';
export declare const dashboardCuotasSchema: z.ZodObject<{
    mes: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    anio: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
}, "strip", z.ZodTypeAny, {
    mes?: number | undefined;
    anio?: number | undefined;
}, {
    mes?: unknown;
    anio?: unknown;
}>;
export type DashboardCuotasDto = z.infer<typeof dashboardCuotasSchema>;
export declare const reportePorCategoriaSchema: z.ZodObject<{
    mes: z.ZodEffects<z.ZodNumber, number, unknown>;
    anio: z.ZodEffects<z.ZodNumber, number, unknown>;
    categoriaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    incluirDetalle: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    incluirDetalle: boolean;
    categoriaId?: number | undefined;
}, {
    categoriaId?: unknown;
    mes?: unknown;
    anio?: unknown;
    incluirDetalle?: string | undefined;
}>;
export type ReportePorCategoriaDto = z.infer<typeof reportePorCategoriaSchema>;
export declare const analisisDescuentosSchema: z.ZodObject<{
    mes: z.ZodEffects<z.ZodNumber, number, unknown>;
    anio: z.ZodEffects<z.ZodNumber, number, unknown>;
    categoriaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    tipoDescuento: z.ZodDefault<z.ZodOptional<z.ZodEnum<["ajustes", "reglas", "exenciones", "todos"]>>>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    tipoDescuento: "ajustes" | "exenciones" | "reglas" | "todos";
    categoriaId?: number | undefined;
}, {
    categoriaId?: unknown;
    mes?: unknown;
    anio?: unknown;
    tipoDescuento?: "ajustes" | "exenciones" | "reglas" | "todos" | undefined;
}>;
export type AnalisisDescuentosDto = z.infer<typeof analisisDescuentosSchema>;
export declare const reporteExencionesSchema: z.ZodObject<{
    estado: z.ZodDefault<z.ZodOptional<z.ZodEnum<["PENDIENTE_APROBACION", "APROBADA", "RECHAZADA", "VIGENTE", "VENCIDA", "REVOCADA", "TODAS"]>>>;
    categoriaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    motivoExencion: z.ZodDefault<z.ZodOptional<z.ZodEnum<["BECA", "SOCIO_FUNDADOR", "SOCIO_HONORARIO", "SITUACION_ECONOMICA", "SITUACION_SALUD", "INTERCAMBIO_SERVICIOS", "PROMOCION", "FAMILIAR_DOCENTE", "OTRO", "TODOS"]>>>;
    incluirHistorico: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>>;
}, "strip", z.ZodTypeAny, {
    estado: "PENDIENTE_APROBACION" | "APROBADA" | "RECHAZADA" | "VIGENTE" | "VENCIDA" | "REVOCADA" | "TODAS";
    motivoExencion: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO" | "TODOS";
    incluirHistorico: boolean;
    categoriaId?: number | undefined;
}, {
    categoriaId?: unknown;
    estado?: "PENDIENTE_APROBACION" | "APROBADA" | "RECHAZADA" | "VIGENTE" | "VENCIDA" | "REVOCADA" | "TODAS" | undefined;
    motivoExencion?: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO" | "TODOS" | undefined;
    incluirHistorico?: string | undefined;
}>;
export type ReporteExencionesDto = z.infer<typeof reporteExencionesSchema>;
export declare const reporteComparativoSchema: z.ZodEffects<z.ZodObject<{
    mesInicio: z.ZodEffects<z.ZodNumber, number, unknown>;
    anioInicio: z.ZodEffects<z.ZodNumber, number, unknown>;
    mesFin: z.ZodEffects<z.ZodNumber, number, unknown>;
    anioFin: z.ZodEffects<z.ZodNumber, number, unknown>;
}, "strip", z.ZodTypeAny, {
    mesInicio: number;
    anioInicio: number;
    mesFin: number;
    anioFin: number;
}, {
    mesInicio?: unknown;
    anioInicio?: unknown;
    mesFin?: unknown;
    anioFin?: unknown;
}>, {
    mesInicio: number;
    anioInicio: number;
    mesFin: number;
    anioFin: number;
}, {
    mesInicio?: unknown;
    anioInicio?: unknown;
    mesFin?: unknown;
    anioFin?: unknown;
}>;
export type ReporteComparativoDto = z.infer<typeof reporteComparativoSchema>;
export declare const estadisticasRecaudacionSchema: z.ZodObject<{
    mes: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    anio: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    categoriaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
}, "strip", z.ZodTypeAny, {
    categoriaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
}, {
    categoriaId?: unknown;
    mes?: unknown;
    anio?: unknown;
}>;
export type EstadisticasRecaudacionDto = z.infer<typeof estadisticasRecaudacionSchema>;
export declare const exportarReporteSchema: z.ZodObject<{
    tipoReporte: z.ZodEnum<["dashboard", "categoria", "descuentos", "exenciones", "comparativo", "recaudacion"]>;
    formato: z.ZodDefault<z.ZodEnum<["json", "excel", "pdf", "csv"]>>;
    parametros: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    formato: "json" | "excel" | "pdf" | "csv";
    tipoReporte: "categoria" | "exenciones" | "dashboard" | "descuentos" | "comparativo" | "recaudacion";
    parametros?: Record<string, any> | undefined;
}, {
    tipoReporte: "categoria" | "exenciones" | "dashboard" | "descuentos" | "comparativo" | "recaudacion";
    formato?: "json" | "excel" | "pdf" | "csv" | undefined;
    parametros?: Record<string, any> | undefined;
}>;
export type ExportarReporteDto = z.infer<typeof exportarReporteSchema>;
//# sourceMappingURL=reportes-cuota.dto.d.ts.map