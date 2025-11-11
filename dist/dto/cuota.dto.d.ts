import { z } from 'zod';
export declare const createCuotaSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    reciboId: z.ZodNumber;
    categoriaId: z.ZodNumber;
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    montoBase: z.ZodNumber;
    montoActividades: z.ZodDefault<z.ZodNumber>;
    montoTotal: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    categoriaId: number;
    mes: number;
    reciboId: number;
    anio: number;
    montoBase: number;
    montoActividades: number;
    montoTotal: number;
}, {
    categoriaId: number;
    mes: number;
    reciboId: number;
    anio: number;
    montoBase: number;
    montoTotal: number;
    montoActividades?: number | undefined;
}>, {
    categoriaId: number;
    mes: number;
    reciboId: number;
    anio: number;
    montoBase: number;
    montoActividades: number;
    montoTotal: number;
}, {
    categoriaId: number;
    mes: number;
    reciboId: number;
    anio: number;
    montoBase: number;
    montoTotal: number;
    montoActividades?: number | undefined;
}>, {
    categoriaId: number;
    mes: number;
    reciboId: number;
    anio: number;
    montoBase: number;
    montoActividades: number;
    montoTotal: number;
}, {
    categoriaId: number;
    mes: number;
    reciboId: number;
    anio: number;
    montoBase: number;
    montoTotal: number;
    montoActividades?: number | undefined;
}>;
export type CreateCuotaDto = z.infer<typeof createCuotaSchema>;
export declare const updateCuotaSchema: z.ZodObject<{
    categoriaId: z.ZodOptional<z.ZodNumber>;
    mes: z.ZodOptional<z.ZodNumber>;
    anio: z.ZodOptional<z.ZodNumber>;
    montoBase: z.ZodOptional<z.ZodNumber>;
    montoActividades: z.ZodOptional<z.ZodNumber>;
    montoTotal: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    categoriaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
    montoBase?: number | undefined;
    montoActividades?: number | undefined;
    montoTotal?: number | undefined;
}, {
    categoriaId?: number | undefined;
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
    categoriaIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    incluirInactivos: z.ZodDefault<z.ZodBoolean>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    incluirInactivos: boolean;
    aplicarDescuentos: boolean;
    observaciones?: string | undefined;
    categoriaIds?: number[] | undefined;
}, {
    mes: number;
    anio: number;
    observaciones?: string | undefined;
    categoriaIds?: number[] | undefined;
    incluirInactivos?: boolean | undefined;
    aplicarDescuentos?: boolean | undefined;
}>, {
    mes: number;
    anio: number;
    incluirInactivos: boolean;
    aplicarDescuentos: boolean;
    observaciones?: string | undefined;
    categoriaIds?: number[] | undefined;
}, {
    mes: number;
    anio: number;
    observaciones?: string | undefined;
    categoriaIds?: number[] | undefined;
    incluirInactivos?: boolean | undefined;
    aplicarDescuentos?: boolean | undefined;
}>;
export type GenerarCuotasDto = z.infer<typeof generarCuotasSchema>;
export declare const cuotaQuerySchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    categoriaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    mes: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    anio: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
    reciboId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    soloImpagas: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    soloVencidas: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    ordenarPor: z.ZodDefault<z.ZodEnum<["fecha", "monto", "categoria", "vencimiento"]>>;
    orden: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    orden: "asc" | "desc";
    ordenarPor: "categoria" | "fecha" | "monto" | "vencimiento";
    categoriaId?: number | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    mes?: number | undefined;
    reciboId?: number | undefined;
    anio?: number | undefined;
    soloImpagas?: boolean | undefined;
    soloVencidas?: boolean | undefined;
}, {
    categoriaId?: unknown;
    page?: unknown;
    limit?: unknown;
    orden?: "asc" | "desc" | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    mes?: unknown;
    reciboId?: unknown;
    anio?: unknown;
    soloImpagas?: string | undefined;
    soloVencidas?: string | undefined;
    ordenarPor?: "categoria" | "fecha" | "monto" | "vencimiento" | undefined;
}>;
export type CuotaQueryDto = z.infer<typeof cuotaQuerySchema>;
export declare const calcularCuotaSchema: z.ZodObject<{
    categoriaId: z.ZodNumber;
    mes: z.ZodOptional<z.ZodNumber>;
    anio: z.ZodOptional<z.ZodNumber>;
    socioId: z.ZodOptional<z.ZodNumber>;
    incluirActividades: z.ZodDefault<z.ZodBoolean>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    categoriaId: number;
    aplicarDescuentos: boolean;
    incluirActividades: boolean;
    socioId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
}, {
    categoriaId: number;
    socioId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
    aplicarDescuentos?: boolean | undefined;
    incluirActividades?: boolean | undefined;
}>;
export type CalcularCuotaDto = z.infer<typeof calcularCuotaSchema>;
export declare const cuotaSearchSchema: z.ZodObject<{
    search: z.ZodString;
    searchBy: z.ZodDefault<z.ZodEnum<["socio", "numero_recibo", "all"]>>;
    categoriaId: z.ZodOptional<z.ZodNumber>;
    mes: z.ZodOptional<z.ZodNumber>;
    anio: z.ZodOptional<z.ZodNumber>;
    estado: z.ZodOptional<z.ZodEnum<["PENDIENTE", "PAGADO", "VENCIDO", "CANCELADO"]>>;
}, "strip", z.ZodTypeAny, {
    search: string;
    searchBy: "socio" | "all" | "numero_recibo";
    categoriaId?: number | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
}, {
    search: string;
    categoriaId?: number | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    mes?: number | undefined;
    searchBy?: "socio" | "all" | "numero_recibo" | undefined;
    anio?: number | undefined;
}>;
export type CuotaSearchDto = z.infer<typeof cuotaSearchSchema>;
export declare const cuotaStatsSchema: z.ZodEffects<z.ZodObject<{
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
    agruparPor: z.ZodDefault<z.ZodEnum<["categoria", "mes", "estado", "general"]>>;
}, "strip", z.ZodTypeAny, {
    agruparPor: "categoria" | "estado" | "mes" | "general";
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    agruparPor?: "categoria" | "estado" | "mes" | "general" | undefined;
}>, {
    agruparPor: "categoria" | "estado" | "mes" | "general";
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    agruparPor?: "categoria" | "estado" | "mes" | "general" | undefined;
}>;
export type CuotaStatsDto = z.infer<typeof cuotaStatsSchema>;
export declare const deleteBulkCuotasSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
    confirmarEliminacion: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    ids: number[];
    confirmarEliminacion: boolean;
}, {
    ids: number[];
    confirmarEliminacion: boolean;
}>;
export type DeleteBulkCuotasDto = z.infer<typeof deleteBulkCuotasSchema>;
export declare const recalcularCuotasSchema: z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    categoriaId: z.ZodOptional<z.ZodNumber>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
    actualizarRecibos: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    actualizarRecibos: boolean;
    categoriaId?: number | undefined;
}, {
    mes: number;
    anio: number;
    categoriaId?: number | undefined;
    aplicarDescuentos?: boolean | undefined;
    actualizarRecibos?: boolean | undefined;
}>;
export type RecalcularCuotasDto = z.infer<typeof recalcularCuotasSchema>;
export declare const reporteCuotasSchema: z.ZodObject<{
    mes: z.ZodEffects<z.ZodNumber, number, unknown>;
    anio: z.ZodEffects<z.ZodNumber, number, unknown>;
    categoriaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    formato: z.ZodDefault<z.ZodEnum<["json", "excel", "pdf"]>>;
    incluirDetalle: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>>;
    incluirEstadisticas: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    formato: "json" | "excel" | "pdf";
    incluirDetalle: boolean;
    incluirEstadisticas: boolean;
    categoriaId?: number | undefined;
}, {
    categoriaId?: unknown;
    mes?: unknown;
    anio?: unknown;
    formato?: "json" | "excel" | "pdf" | undefined;
    incluirDetalle?: string | undefined;
    incluirEstadisticas?: string | undefined;
}>;
export type ReporteCuotasDto = z.infer<typeof reporteCuotasSchema>;
//# sourceMappingURL=cuota.dto.d.ts.map