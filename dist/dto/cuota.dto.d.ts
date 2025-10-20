import { z } from 'zod';
export declare const createCuotaSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    reciboId: z.ZodString;
    categoriaId: z.ZodString;
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    montoBase: z.ZodNumber;
    montoActividades: z.ZodDefault<z.ZodNumber>;
    montoTotal: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    categoriaId: string;
    mes: number;
    reciboId: string;
    anio: number;
    montoBase: number;
    montoActividades: number;
    montoTotal: number;
}, {
    categoriaId: string;
    mes: number;
    reciboId: string;
    anio: number;
    montoBase: number;
    montoTotal: number;
    montoActividades?: number | undefined;
}>, {
    categoriaId: string;
    mes: number;
    reciboId: string;
    anio: number;
    montoBase: number;
    montoActividades: number;
    montoTotal: number;
}, {
    categoriaId: string;
    mes: number;
    reciboId: string;
    anio: number;
    montoBase: number;
    montoTotal: number;
    montoActividades?: number | undefined;
}>, {
    categoriaId: string;
    mes: number;
    reciboId: string;
    anio: number;
    montoBase: number;
    montoActividades: number;
    montoTotal: number;
}, {
    categoriaId: string;
    mes: number;
    reciboId: string;
    anio: number;
    montoBase: number;
    montoTotal: number;
    montoActividades?: number | undefined;
}>;
export type CreateCuotaDto = z.infer<typeof createCuotaSchema>;
export declare const updateCuotaSchema: z.ZodObject<{
    categoriaId: z.ZodOptional<z.ZodString>;
    mes: z.ZodOptional<z.ZodNumber>;
    anio: z.ZodOptional<z.ZodNumber>;
    montoBase: z.ZodOptional<z.ZodNumber>;
    montoActividades: z.ZodOptional<z.ZodNumber>;
    montoTotal: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    categoriaId?: string | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
    montoBase?: number | undefined;
    montoActividades?: number | undefined;
    montoTotal?: number | undefined;
}, {
    categoriaId?: string | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
    montoBase?: number | undefined;
    montoActividades?: number | undefined;
    montoTotal?: number | undefined;
}>;
export type UpdateCuotaDto = z.infer<typeof updateCuotaSchema>;
export declare const generarCuotasSchema: z.ZodEffects<z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    categoriaIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    incluirInactivos: z.ZodDefault<z.ZodBoolean>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    incluirInactivos: boolean;
    aplicarDescuentos: boolean;
    observaciones?: string | undefined;
    categoriaIds?: string[] | undefined;
}, {
    mes: number;
    anio: number;
    observaciones?: string | undefined;
    categoriaIds?: string[] | undefined;
    incluirInactivos?: boolean | undefined;
    aplicarDescuentos?: boolean | undefined;
}>, {
    mes: number;
    anio: number;
    incluirInactivos: boolean;
    aplicarDescuentos: boolean;
    observaciones?: string | undefined;
    categoriaIds?: string[] | undefined;
}, {
    mes: number;
    anio: number;
    observaciones?: string | undefined;
    categoriaIds?: string[] | undefined;
    incluirInactivos?: boolean | undefined;
    aplicarDescuentos?: boolean | undefined;
}>;
export type GenerarCuotasDto = z.infer<typeof generarCuotasSchema>;
export declare const cuotaQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    categoriaId: z.ZodOptional<z.ZodString>;
    mes: z.ZodOptional<z.ZodNumber>;
    anio: z.ZodOptional<z.ZodNumber>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
    reciboId: z.ZodOptional<z.ZodString>;
    soloImpagas: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    soloVencidas: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    ordenarPor: z.ZodDefault<z.ZodEnum<["fecha", "monto", "categoria", "vencimiento"]>>;
    orden: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    orden: "asc" | "desc";
    ordenarPor: "categoria" | "fecha" | "monto" | "vencimiento";
    categoriaId?: string | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    mes?: number | undefined;
    reciboId?: string | undefined;
    anio?: number | undefined;
    soloImpagas?: boolean | undefined;
    soloVencidas?: boolean | undefined;
}, {
    categoriaId?: string | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    orden?: "asc" | "desc" | undefined;
    mes?: number | undefined;
    reciboId?: string | undefined;
    anio?: number | undefined;
    soloImpagas?: string | undefined;
    soloVencidas?: string | undefined;
    ordenarPor?: "categoria" | "fecha" | "monto" | "vencimiento" | undefined;
}>;
export type CuotaQueryDto = z.infer<typeof cuotaQuerySchema>;
export declare const calcularCuotaSchema: z.ZodObject<{
    categoriaId: z.ZodString;
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    socioId: z.ZodOptional<z.ZodString>;
    incluirActividades: z.ZodDefault<z.ZodBoolean>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    categoriaId: string;
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    incluirActividades: boolean;
    socioId?: string | undefined;
}, {
    categoriaId: string;
    mes: number;
    anio: number;
    socioId?: string | undefined;
    aplicarDescuentos?: boolean | undefined;
    incluirActividades?: boolean | undefined;
}>;
export type CalcularCuotaDto = z.infer<typeof calcularCuotaSchema>;
export declare const cuotaSearchSchema: z.ZodObject<{
    search: z.ZodString;
    searchBy: z.ZodDefault<z.ZodEnum<["socio", "numero_recibo", "all"]>>;
    categoriaId: z.ZodOptional<z.ZodString>;
    mes: z.ZodOptional<z.ZodNumber>;
    anio: z.ZodOptional<z.ZodNumber>;
    estado: z.ZodOptional<z.ZodEnum<["PENDIENTE", "PAGADO", "VENCIDO", "CANCELADO"]>>;
}, "strip", z.ZodTypeAny, {
    search: string;
    searchBy: "all" | "socio" | "numero_recibo";
    categoriaId?: string | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
}, {
    search: string;
    categoriaId?: string | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    mes?: number | undefined;
    searchBy?: "all" | "socio" | "numero_recibo" | undefined;
    anio?: number | undefined;
}>;
export type CuotaSearchDto = z.infer<typeof cuotaSearchSchema>;
export declare const cuotaStatsSchema: z.ZodEffects<z.ZodObject<{
    fechaDesde: z.ZodString;
    fechaHasta: z.ZodString;
    agruparPor: z.ZodDefault<z.ZodEnum<["categoria", "mes", "estado", "general"]>>;
}, "strip", z.ZodTypeAny, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "categoria" | "estado" | "mes" | "general";
}, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor?: "categoria" | "estado" | "mes" | "general" | undefined;
}>, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "categoria" | "estado" | "mes" | "general";
}, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor?: "categoria" | "estado" | "mes" | "general" | undefined;
}>;
export type CuotaStatsDto = z.infer<typeof cuotaStatsSchema>;
export declare const deleteBulkCuotasSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
    confirmarEliminacion: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    ids: string[];
    confirmarEliminacion: boolean;
}, {
    ids: string[];
    confirmarEliminacion: boolean;
}>;
export type DeleteBulkCuotasDto = z.infer<typeof deleteBulkCuotasSchema>;
export declare const recalcularCuotasSchema: z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    categoriaId: z.ZodOptional<z.ZodString>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
    actualizarRecibos: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    actualizarRecibos: boolean;
    categoriaId?: string | undefined;
}, {
    mes: number;
    anio: number;
    categoriaId?: string | undefined;
    aplicarDescuentos?: boolean | undefined;
    actualizarRecibos?: boolean | undefined;
}>;
export type RecalcularCuotasDto = z.infer<typeof recalcularCuotasSchema>;
export declare const reporteCuotasSchema: z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    categoriaId: z.ZodOptional<z.ZodString>;
    formato: z.ZodDefault<z.ZodEnum<["json", "excel", "pdf"]>>;
    incluirDetalle: z.ZodDefault<z.ZodBoolean>;
    incluirEstadisticas: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    formato: "json" | "excel" | "pdf";
    incluirDetalle: boolean;
    incluirEstadisticas: boolean;
    categoriaId?: string | undefined;
}, {
    mes: number;
    anio: number;
    categoriaId?: string | undefined;
    formato?: "json" | "excel" | "pdf" | undefined;
    incluirDetalle?: boolean | undefined;
    incluirEstadisticas?: boolean | undefined;
}>;
export type ReporteCuotasDto = z.infer<typeof reporteCuotasSchema>;
//# sourceMappingURL=cuota.dto.d.ts.map