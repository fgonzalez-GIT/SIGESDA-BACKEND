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
    incluirInactivos: boolean;
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    observaciones?: string | undefined;
    categoriaIds?: number[] | undefined;
}, {
    mes: number;
    anio: number;
    observaciones?: string | undefined;
    incluirInactivos?: boolean | undefined;
    categoriaIds?: number[] | undefined;
    aplicarDescuentos?: boolean | undefined;
}>, {
    incluirInactivos: boolean;
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    observaciones?: string | undefined;
    categoriaIds?: number[] | undefined;
}, {
    mes: number;
    anio: number;
    observaciones?: string | undefined;
    incluirInactivos?: boolean | undefined;
    categoriaIds?: number[] | undefined;
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
    orden: "asc" | "desc";
    ordenarPor: "categoria" | "fecha" | "monto" | "vencimiento";
    page: number;
    limit: number;
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
    orden?: "asc" | "desc" | undefined;
    ordenarPor?: "categoria" | "fecha" | "monto" | "vencimiento" | undefined;
    page?: unknown;
    limit?: unknown;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    mes?: unknown;
    reciboId?: unknown;
    anio?: unknown;
    soloImpagas?: string | undefined;
    soloVencidas?: string | undefined;
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
export declare const recalcularCuotaSchema: z.ZodObject<{
    cuotaId: z.ZodNumber;
    aplicarAjustes: z.ZodDefault<z.ZodBoolean>;
    aplicarExenciones: z.ZodDefault<z.ZodBoolean>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
    usuario: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cuotaId: number;
    aplicarDescuentos: boolean;
    aplicarAjustes: boolean;
    aplicarExenciones: boolean;
    usuario?: string | undefined;
}, {
    cuotaId: number;
    usuario?: string | undefined;
    aplicarDescuentos?: boolean | undefined;
    aplicarAjustes?: boolean | undefined;
    aplicarExenciones?: boolean | undefined;
}>;
export type RecalcularCuotaDto = z.infer<typeof recalcularCuotaSchema>;
export declare const regenerarCuotasSchema: z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    categoriaId: z.ZodOptional<z.ZodNumber>;
    personaId: z.ZodOptional<z.ZodNumber>;
    aplicarAjustes: z.ZodDefault<z.ZodBoolean>;
    aplicarExenciones: z.ZodDefault<z.ZodBoolean>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
    confirmarRegeneracion: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    aplicarAjustes: boolean;
    aplicarExenciones: boolean;
    confirmarRegeneracion: boolean;
    categoriaId?: number | undefined;
    personaId?: number | undefined;
}, {
    mes: number;
    anio: number;
    confirmarRegeneracion: boolean;
    categoriaId?: number | undefined;
    personaId?: number | undefined;
    aplicarDescuentos?: boolean | undefined;
    aplicarAjustes?: boolean | undefined;
    aplicarExenciones?: boolean | undefined;
}>;
export type RegenerarCuotasDto = z.infer<typeof regenerarCuotasSchema>;
export declare const previewRecalculoSchema: z.ZodEffects<z.ZodObject<{
    cuotaId: z.ZodOptional<z.ZodNumber>;
    mes: z.ZodOptional<z.ZodNumber>;
    anio: z.ZodOptional<z.ZodNumber>;
    categoriaId: z.ZodOptional<z.ZodNumber>;
    personaId: z.ZodOptional<z.ZodNumber>;
    aplicarAjustes: z.ZodDefault<z.ZodBoolean>;
    aplicarExenciones: z.ZodDefault<z.ZodBoolean>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    aplicarDescuentos: boolean;
    aplicarAjustes: boolean;
    aplicarExenciones: boolean;
    categoriaId?: number | undefined;
    personaId?: number | undefined;
    cuotaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
}, {
    categoriaId?: number | undefined;
    personaId?: number | undefined;
    cuotaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
    aplicarDescuentos?: boolean | undefined;
    aplicarAjustes?: boolean | undefined;
    aplicarExenciones?: boolean | undefined;
}>, {
    aplicarDescuentos: boolean;
    aplicarAjustes: boolean;
    aplicarExenciones: boolean;
    categoriaId?: number | undefined;
    personaId?: number | undefined;
    cuotaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
}, {
    categoriaId?: number | undefined;
    personaId?: number | undefined;
    cuotaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
    aplicarDescuentos?: boolean | undefined;
    aplicarAjustes?: boolean | undefined;
    aplicarExenciones?: boolean | undefined;
}>;
export type PreviewRecalculoDto = z.infer<typeof previewRecalculoSchema>;
export declare const compararCuotaSchema: z.ZodObject<{
    cuotaId: z.ZodNumber;
    cambiosPropuestos: z.ZodOptional<z.ZodObject<{
        nuevoDescuento: z.ZodOptional<z.ZodNumber>;
        nuevosAjustes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            tipoItemCuotaId: z.ZodNumber;
            monto: z.ZodNumber;
            motivo: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            motivo: string;
            monto: number;
            tipoItemCuotaId: number;
        }, {
            motivo: string;
            monto: number;
            tipoItemCuotaId: number;
        }>, "many">>;
        nuevasExenciones: z.ZodOptional<z.ZodArray<z.ZodObject<{
            tipoItemCuotaId: z.ZodNumber;
            porcentaje: z.ZodNumber;
            motivo: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            motivo: string;
            tipoItemCuotaId: number;
            porcentaje: number;
        }, {
            motivo: string;
            tipoItemCuotaId: number;
            porcentaje: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        nuevoDescuento?: number | undefined;
        nuevosAjustes?: {
            motivo: string;
            monto: number;
            tipoItemCuotaId: number;
        }[] | undefined;
        nuevasExenciones?: {
            motivo: string;
            tipoItemCuotaId: number;
            porcentaje: number;
        }[] | undefined;
    }, {
        nuevoDescuento?: number | undefined;
        nuevosAjustes?: {
            motivo: string;
            monto: number;
            tipoItemCuotaId: number;
        }[] | undefined;
        nuevasExenciones?: {
            motivo: string;
            tipoItemCuotaId: number;
            porcentaje: number;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    cuotaId: number;
    cambiosPropuestos?: {
        nuevoDescuento?: number | undefined;
        nuevosAjustes?: {
            motivo: string;
            monto: number;
            tipoItemCuotaId: number;
        }[] | undefined;
        nuevasExenciones?: {
            motivo: string;
            tipoItemCuotaId: number;
            porcentaje: number;
        }[] | undefined;
    } | undefined;
}, {
    cuotaId: number;
    cambiosPropuestos?: {
        nuevoDescuento?: number | undefined;
        nuevosAjustes?: {
            motivo: string;
            monto: number;
            tipoItemCuotaId: number;
        }[] | undefined;
        nuevasExenciones?: {
            motivo: string;
            tipoItemCuotaId: number;
            porcentaje: number;
        }[] | undefined;
    } | undefined;
}>;
export type CompararCuotaDto = z.infer<typeof compararCuotaSchema>;
export declare const simularGeneracionSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    categoriaIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    socioIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
    aplicarAjustes: z.ZodDefault<z.ZodBoolean>;
    aplicarExenciones: z.ZodDefault<z.ZodBoolean>;
    incluirInactivos: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    incluirInactivos: boolean;
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    aplicarAjustes: boolean;
    aplicarExenciones: boolean;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
}, {
    mes: number;
    anio: number;
    incluirInactivos?: boolean | undefined;
    categoriaIds?: number[] | undefined;
    aplicarDescuentos?: boolean | undefined;
    aplicarAjustes?: boolean | undefined;
    aplicarExenciones?: boolean | undefined;
    socioIds?: number[] | undefined;
}>, {
    incluirInactivos: boolean;
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    aplicarAjustes: boolean;
    aplicarExenciones: boolean;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
}, {
    mes: number;
    anio: number;
    incluirInactivos?: boolean | undefined;
    categoriaIds?: number[] | undefined;
    aplicarDescuentos?: boolean | undefined;
    aplicarAjustes?: boolean | undefined;
    aplicarExenciones?: boolean | undefined;
    socioIds?: number[] | undefined;
}>, {
    incluirInactivos: boolean;
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    aplicarAjustes: boolean;
    aplicarExenciones: boolean;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
}, {
    mes: number;
    anio: number;
    incluirInactivos?: boolean | undefined;
    categoriaIds?: number[] | undefined;
    aplicarDescuentos?: boolean | undefined;
    aplicarAjustes?: boolean | undefined;
    aplicarExenciones?: boolean | undefined;
    socioIds?: number[] | undefined;
}>;
export type SimularGeneracionDto = z.infer<typeof simularGeneracionSchema>;
export declare const simularReglaDescuentoSchema: z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    reglasModificadas: z.ZodArray<z.ZodObject<{
        reglaId: z.ZodOptional<z.ZodNumber>;
        tipo: z.ZodEnum<["ANTIGUEDAD", "FAMILIAR", "CATEGORIA", "COMBINADA"]>;
        porcentaje: z.ZodNumber;
        condiciones: z.ZodRecord<z.ZodString, z.ZodAny>;
        activa: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        tipo: "FAMILIAR" | "ANTIGUEDAD" | "CATEGORIA" | "COMBINADA";
        activa: boolean;
        porcentaje: number;
        condiciones: Record<string, any>;
        reglaId?: number | undefined;
    }, {
        tipo: "FAMILIAR" | "ANTIGUEDAD" | "CATEGORIA" | "COMBINADA";
        porcentaje: number;
        condiciones: Record<string, any>;
        activa?: boolean | undefined;
        reglaId?: number | undefined;
    }>, "many">;
    reglasNuevas: z.ZodOptional<z.ZodArray<z.ZodObject<{
        codigo: z.ZodString;
        nombre: z.ZodString;
        tipo: z.ZodEnum<["ANTIGUEDAD", "FAMILIAR", "CATEGORIA", "COMBINADA"]>;
        porcentaje: z.ZodNumber;
        condiciones: z.ZodRecord<z.ZodString, z.ZodAny>;
        activa: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        codigo: string;
        nombre: string;
        tipo: "FAMILIAR" | "ANTIGUEDAD" | "CATEGORIA" | "COMBINADA";
        activa: boolean;
        porcentaje: number;
        condiciones: Record<string, any>;
    }, {
        codigo: string;
        nombre: string;
        tipo: "FAMILIAR" | "ANTIGUEDAD" | "CATEGORIA" | "COMBINADA";
        porcentaje: number;
        condiciones: Record<string, any>;
        activa?: boolean | undefined;
    }>, "many">>;
    socioIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    categoriaIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    reglasModificadas: {
        tipo: "FAMILIAR" | "ANTIGUEDAD" | "CATEGORIA" | "COMBINADA";
        activa: boolean;
        porcentaje: number;
        condiciones: Record<string, any>;
        reglaId?: number | undefined;
    }[];
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
    reglasNuevas?: {
        codigo: string;
        nombre: string;
        tipo: "FAMILIAR" | "ANTIGUEDAD" | "CATEGORIA" | "COMBINADA";
        activa: boolean;
        porcentaje: number;
        condiciones: Record<string, any>;
    }[] | undefined;
}, {
    mes: number;
    anio: number;
    reglasModificadas: {
        tipo: "FAMILIAR" | "ANTIGUEDAD" | "CATEGORIA" | "COMBINADA";
        porcentaje: number;
        condiciones: Record<string, any>;
        activa?: boolean | undefined;
        reglaId?: number | undefined;
    }[];
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
    reglasNuevas?: {
        codigo: string;
        nombre: string;
        tipo: "FAMILIAR" | "ANTIGUEDAD" | "CATEGORIA" | "COMBINADA";
        porcentaje: number;
        condiciones: Record<string, any>;
        activa?: boolean | undefined;
    }[] | undefined;
}>;
export type SimularReglaDescuentoDto = z.infer<typeof simularReglaDescuentoSchema>;
export declare const compararEscenariosSchema: z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    escenarios: z.ZodArray<z.ZodObject<{
        nombre: z.ZodString;
        descripcion: z.ZodOptional<z.ZodString>;
        aplicarDescuentos: z.ZodDefault<z.ZodBoolean>;
        aplicarAjustes: z.ZodDefault<z.ZodBoolean>;
        aplicarExenciones: z.ZodDefault<z.ZodBoolean>;
        porcentajeDescuentoGlobal: z.ZodOptional<z.ZodNumber>;
        montoFijoDescuento: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        nombre: string;
        aplicarDescuentos: boolean;
        aplicarAjustes: boolean;
        aplicarExenciones: boolean;
        descripcion?: string | undefined;
        porcentajeDescuentoGlobal?: number | undefined;
        montoFijoDescuento?: number | undefined;
    }, {
        nombre: string;
        descripcion?: string | undefined;
        aplicarDescuentos?: boolean | undefined;
        aplicarAjustes?: boolean | undefined;
        aplicarExenciones?: boolean | undefined;
        porcentajeDescuentoGlobal?: number | undefined;
        montoFijoDescuento?: number | undefined;
    }>, "many">;
    socioIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    categoriaIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    escenarios: {
        nombre: string;
        aplicarDescuentos: boolean;
        aplicarAjustes: boolean;
        aplicarExenciones: boolean;
        descripcion?: string | undefined;
        porcentajeDescuentoGlobal?: number | undefined;
        montoFijoDescuento?: number | undefined;
    }[];
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
}, {
    mes: number;
    anio: number;
    escenarios: {
        nombre: string;
        descripcion?: string | undefined;
        aplicarDescuentos?: boolean | undefined;
        aplicarAjustes?: boolean | undefined;
        aplicarExenciones?: boolean | undefined;
        porcentajeDescuentoGlobal?: number | undefined;
        montoFijoDescuento?: number | undefined;
    }[];
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
}>;
export type CompararEscenariosDto = z.infer<typeof compararEscenariosSchema>;
export declare const simularImpactoMasivoSchema: z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    cambios: z.ZodObject<{
        nuevosMontosPorCategoria: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        nuevasPorcentajesDescuento: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        ajusteGlobalPorcentaje: z.ZodOptional<z.ZodNumber>;
        ajusteGlobalMonto: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        nuevosMontosPorCategoria?: Record<string, number> | undefined;
        nuevasPorcentajesDescuento?: Record<string, number> | undefined;
        ajusteGlobalPorcentaje?: number | undefined;
        ajusteGlobalMonto?: number | undefined;
    }, {
        nuevosMontosPorCategoria?: Record<string, number> | undefined;
        nuevasPorcentajesDescuento?: Record<string, number> | undefined;
        ajusteGlobalPorcentaje?: number | undefined;
        ajusteGlobalMonto?: number | undefined;
    }>;
    incluirProyeccion: z.ZodDefault<z.ZodBoolean>;
    mesesProyeccion: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    cambios: {
        nuevosMontosPorCategoria?: Record<string, number> | undefined;
        nuevasPorcentajesDescuento?: Record<string, number> | undefined;
        ajusteGlobalPorcentaje?: number | undefined;
        ajusteGlobalMonto?: number | undefined;
    };
    incluirProyeccion: boolean;
    mesesProyeccion?: number | undefined;
}, {
    mes: number;
    anio: number;
    cambios: {
        nuevosMontosPorCategoria?: Record<string, number> | undefined;
        nuevasPorcentajesDescuento?: Record<string, number> | undefined;
        ajusteGlobalPorcentaje?: number | undefined;
        ajusteGlobalMonto?: number | undefined;
    };
    incluirProyeccion?: boolean | undefined;
    mesesProyeccion?: number | undefined;
}>;
export type SimularImpactoMasivoDto = z.infer<typeof simularImpactoMasivoSchema>;
export declare const ajusteMasivoSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    filtros: z.ZodObject<{
        mes: z.ZodOptional<z.ZodNumber>;
        anio: z.ZodOptional<z.ZodNumber>;
        categoriaIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        socioIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        estadoCuota: z.ZodOptional<z.ZodEnum<["PENDIENTE", "PAGADO", "VENCIDO", "ANULADO"]>>;
    }, "strip", z.ZodTypeAny, {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    }, {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    }>;
    tipoAjuste: z.ZodEnum<["DESCUENTO_PORCENTAJE", "DESCUENTO_FIJO", "RECARGO_PORCENTAJE", "RECARGO_FIJO", "MONTO_FIJO_TOTAL"]>;
    valor: z.ZodNumber;
    motivo: z.ZodString;
    condiciones: z.ZodOptional<z.ZodObject<{
        montoMinimo: z.ZodOptional<z.ZodNumber>;
        montoMaximo: z.ZodOptional<z.ZodNumber>;
        soloConDescuentos: z.ZodOptional<z.ZodBoolean>;
        soloSinExenciones: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    }, {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    }>>;
    modo: z.ZodDefault<z.ZodEnum<["PREVIEW", "APLICAR"]>>;
    confirmarAplicacion: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    valor: number;
    tipoAjuste: "DESCUENTO_FIJO" | "DESCUENTO_PORCENTAJE" | "RECARGO_FIJO" | "RECARGO_PORCENTAJE" | "MONTO_FIJO_TOTAL";
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    };
    modo: "PREVIEW" | "APLICAR";
    condiciones?: {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    } | undefined;
    confirmarAplicacion?: boolean | undefined;
}, {
    valor: number;
    tipoAjuste: "DESCUENTO_FIJO" | "DESCUENTO_PORCENTAJE" | "RECARGO_FIJO" | "RECARGO_PORCENTAJE" | "MONTO_FIJO_TOTAL";
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    };
    condiciones?: {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    } | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarAplicacion?: boolean | undefined;
}>, {
    valor: number;
    tipoAjuste: "DESCUENTO_FIJO" | "DESCUENTO_PORCENTAJE" | "RECARGO_FIJO" | "RECARGO_PORCENTAJE" | "MONTO_FIJO_TOTAL";
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    };
    modo: "PREVIEW" | "APLICAR";
    condiciones?: {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    } | undefined;
    confirmarAplicacion?: boolean | undefined;
}, {
    valor: number;
    tipoAjuste: "DESCUENTO_FIJO" | "DESCUENTO_PORCENTAJE" | "RECARGO_FIJO" | "RECARGO_PORCENTAJE" | "MONTO_FIJO_TOTAL";
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    };
    condiciones?: {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    } | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarAplicacion?: boolean | undefined;
}>, {
    valor: number;
    tipoAjuste: "DESCUENTO_FIJO" | "DESCUENTO_PORCENTAJE" | "RECARGO_FIJO" | "RECARGO_PORCENTAJE" | "MONTO_FIJO_TOTAL";
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    };
    modo: "PREVIEW" | "APLICAR";
    condiciones?: {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    } | undefined;
    confirmarAplicacion?: boolean | undefined;
}, {
    valor: number;
    tipoAjuste: "DESCUENTO_FIJO" | "DESCUENTO_PORCENTAJE" | "RECARGO_FIJO" | "RECARGO_PORCENTAJE" | "MONTO_FIJO_TOTAL";
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    };
    condiciones?: {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    } | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarAplicacion?: boolean | undefined;
}>, {
    valor: number;
    tipoAjuste: "DESCUENTO_FIJO" | "DESCUENTO_PORCENTAJE" | "RECARGO_FIJO" | "RECARGO_PORCENTAJE" | "MONTO_FIJO_TOTAL";
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    };
    modo: "PREVIEW" | "APLICAR";
    condiciones?: {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    } | undefined;
    confirmarAplicacion?: boolean | undefined;
}, {
    valor: number;
    tipoAjuste: "DESCUENTO_FIJO" | "DESCUENTO_PORCENTAJE" | "RECARGO_FIJO" | "RECARGO_PORCENTAJE" | "MONTO_FIJO_TOTAL";
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        estadoCuota?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | undefined;
    };
    condiciones?: {
        montoMinimo?: number | undefined;
        montoMaximo?: number | undefined;
        soloConDescuentos?: boolean | undefined;
        soloSinExenciones?: boolean | undefined;
    } | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarAplicacion?: boolean | undefined;
}>;
export type AjusteMasivoDto = z.infer<typeof ajusteMasivoSchema>;
export declare const modificarItemsMasivoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    filtros: z.ZodObject<{
        mes: z.ZodOptional<z.ZodNumber>;
        anio: z.ZodOptional<z.ZodNumber>;
        categoriaItemId: z.ZodOptional<z.ZodNumber>;
        tipoItemId: z.ZodOptional<z.ZodNumber>;
        conceptoContiene: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaItemId?: number | undefined;
        tipoItemId?: number | undefined;
        conceptoContiene?: string | undefined;
    }, {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaItemId?: number | undefined;
        tipoItemId?: number | undefined;
        conceptoContiene?: string | undefined;
    }>;
    modificaciones: z.ZodObject<{
        nuevoConcepto: z.ZodOptional<z.ZodString>;
        nuevoMonto: z.ZodOptional<z.ZodNumber>;
        nuevoPorcentaje: z.ZodOptional<z.ZodNumber>;
        multiplicarMonto: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        nuevoConcepto?: string | undefined;
        nuevoMonto?: number | undefined;
        nuevoPorcentaje?: number | undefined;
        multiplicarMonto?: number | undefined;
    }, {
        nuevoConcepto?: string | undefined;
        nuevoMonto?: number | undefined;
        nuevoPorcentaje?: number | undefined;
        multiplicarMonto?: number | undefined;
    }>;
    motivo: z.ZodString;
    modo: z.ZodDefault<z.ZodEnum<["PREVIEW", "APLICAR"]>>;
    confirmarModificacion: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaItemId?: number | undefined;
        tipoItemId?: number | undefined;
        conceptoContiene?: string | undefined;
    };
    modo: "PREVIEW" | "APLICAR";
    modificaciones: {
        nuevoConcepto?: string | undefined;
        nuevoMonto?: number | undefined;
        nuevoPorcentaje?: number | undefined;
        multiplicarMonto?: number | undefined;
    };
    confirmarModificacion?: boolean | undefined;
}, {
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaItemId?: number | undefined;
        tipoItemId?: number | undefined;
        conceptoContiene?: string | undefined;
    };
    modificaciones: {
        nuevoConcepto?: string | undefined;
        nuevoMonto?: number | undefined;
        nuevoPorcentaje?: number | undefined;
        multiplicarMonto?: number | undefined;
    };
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarModificacion?: boolean | undefined;
}>, {
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaItemId?: number | undefined;
        tipoItemId?: number | undefined;
        conceptoContiene?: string | undefined;
    };
    modo: "PREVIEW" | "APLICAR";
    modificaciones: {
        nuevoConcepto?: string | undefined;
        nuevoMonto?: number | undefined;
        nuevoPorcentaje?: number | undefined;
        multiplicarMonto?: number | undefined;
    };
    confirmarModificacion?: boolean | undefined;
}, {
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaItemId?: number | undefined;
        tipoItemId?: number | undefined;
        conceptoContiene?: string | undefined;
    };
    modificaciones: {
        nuevoConcepto?: string | undefined;
        nuevoMonto?: number | undefined;
        nuevoPorcentaje?: number | undefined;
        multiplicarMonto?: number | undefined;
    };
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarModificacion?: boolean | undefined;
}>, {
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaItemId?: number | undefined;
        tipoItemId?: number | undefined;
        conceptoContiene?: string | undefined;
    };
    modo: "PREVIEW" | "APLICAR";
    modificaciones: {
        nuevoConcepto?: string | undefined;
        nuevoMonto?: number | undefined;
        nuevoPorcentaje?: number | undefined;
        multiplicarMonto?: number | undefined;
    };
    confirmarModificacion?: boolean | undefined;
}, {
    motivo: string;
    filtros: {
        mes?: number | undefined;
        anio?: number | undefined;
        categoriaItemId?: number | undefined;
        tipoItemId?: number | undefined;
        conceptoContiene?: string | undefined;
    };
    modificaciones: {
        nuevoConcepto?: string | undefined;
        nuevoMonto?: number | undefined;
        nuevoPorcentaje?: number | undefined;
        multiplicarMonto?: number | undefined;
    };
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarModificacion?: boolean | undefined;
}>;
export type ModificarItemsMasivoDto = z.infer<typeof modificarItemsMasivoSchema>;
export declare const descuentoGlobalSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    tipoDescuento: z.ZodEnum<["PORCENTAJE", "MONTO_FIJO"]>;
    valor: z.ZodNumber;
    motivo: z.ZodString;
    filtros: z.ZodOptional<z.ZodObject<{
        categoriaIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        socioIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        montoMinimo: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        montoMinimo?: number | undefined;
    }, {
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        montoMinimo?: number | undefined;
    }>>;
    modo: z.ZodDefault<z.ZodEnum<["PREVIEW", "APLICAR"]>>;
    confirmarDescuento: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    valor: number;
    motivo: string;
    mes: number;
    anio: number;
    modo: "PREVIEW" | "APLICAR";
    tipoDescuento: "PORCENTAJE" | "MONTO_FIJO";
    filtros?: {
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        montoMinimo?: number | undefined;
    } | undefined;
    confirmarDescuento?: boolean | undefined;
}, {
    valor: number;
    motivo: string;
    mes: number;
    anio: number;
    tipoDescuento: "PORCENTAJE" | "MONTO_FIJO";
    filtros?: {
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        montoMinimo?: number | undefined;
    } | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarDescuento?: boolean | undefined;
}>, {
    valor: number;
    motivo: string;
    mes: number;
    anio: number;
    modo: "PREVIEW" | "APLICAR";
    tipoDescuento: "PORCENTAJE" | "MONTO_FIJO";
    filtros?: {
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        montoMinimo?: number | undefined;
    } | undefined;
    confirmarDescuento?: boolean | undefined;
}, {
    valor: number;
    motivo: string;
    mes: number;
    anio: number;
    tipoDescuento: "PORCENTAJE" | "MONTO_FIJO";
    filtros?: {
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        montoMinimo?: number | undefined;
    } | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarDescuento?: boolean | undefined;
}>, {
    valor: number;
    motivo: string;
    mes: number;
    anio: number;
    modo: "PREVIEW" | "APLICAR";
    tipoDescuento: "PORCENTAJE" | "MONTO_FIJO";
    filtros?: {
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        montoMinimo?: number | undefined;
    } | undefined;
    confirmarDescuento?: boolean | undefined;
}, {
    valor: number;
    motivo: string;
    mes: number;
    anio: number;
    tipoDescuento: "PORCENTAJE" | "MONTO_FIJO";
    filtros?: {
        categoriaIds?: number[] | undefined;
        socioIds?: number[] | undefined;
        montoMinimo?: number | undefined;
    } | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarDescuento?: boolean | undefined;
}>;
export type DescuentoGlobalDto = z.infer<typeof descuentoGlobalSchema>;
export declare const validarAjusteMasivoSchema: z.ZodObject<{
    cuotasAfectadas: z.ZodNumber;
    montoTotalOriginal: z.ZodNumber;
    montoTotalNuevo: z.ZodNumber;
    impactoEconomico: z.ZodNumber;
    advertencias: z.ZodArray<z.ZodString, "many">;
    errores: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    cuotasAfectadas: number;
    montoTotalOriginal: number;
    montoTotalNuevo: number;
    impactoEconomico: number;
    advertencias: string[];
    errores: string[];
}, {
    cuotasAfectadas: number;
    montoTotalOriginal: number;
    montoTotalNuevo: number;
    impactoEconomico: number;
    advertencias: string[];
    errores: string[];
}>;
export type ValidarAjusteMasivoDto = z.infer<typeof validarAjusteMasivoSchema>;
export declare const rollbackGeneracionSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    categoriaIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    socioIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    modo: z.ZodDefault<z.ZodEnum<["PREVIEW", "APLICAR"]>>;
    opciones: z.ZodOptional<z.ZodObject<{
        eliminarCuotasPendientes: z.ZodDefault<z.ZodBoolean>;
        eliminarCuotasPagadas: z.ZodDefault<z.ZodBoolean>;
        restaurarRecibos: z.ZodDefault<z.ZodBoolean>;
        crearBackup: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        eliminarCuotasPendientes: boolean;
        eliminarCuotasPagadas: boolean;
        restaurarRecibos: boolean;
        crearBackup: boolean;
    }, {
        eliminarCuotasPendientes?: boolean | undefined;
        eliminarCuotasPagadas?: boolean | undefined;
        restaurarRecibos?: boolean | undefined;
        crearBackup?: boolean | undefined;
    }>>;
    confirmarRollback: z.ZodOptional<z.ZodBoolean>;
    motivo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    modo: "PREVIEW" | "APLICAR";
    motivo?: string | undefined;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
    opciones?: {
        eliminarCuotasPendientes: boolean;
        eliminarCuotasPagadas: boolean;
        restaurarRecibos: boolean;
        crearBackup: boolean;
    } | undefined;
    confirmarRollback?: boolean | undefined;
}, {
    mes: number;
    anio: number;
    motivo?: string | undefined;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    opciones?: {
        eliminarCuotasPendientes?: boolean | undefined;
        eliminarCuotasPagadas?: boolean | undefined;
        restaurarRecibos?: boolean | undefined;
        crearBackup?: boolean | undefined;
    } | undefined;
    confirmarRollback?: boolean | undefined;
}>, {
    mes: number;
    anio: number;
    modo: "PREVIEW" | "APLICAR";
    motivo?: string | undefined;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
    opciones?: {
        eliminarCuotasPendientes: boolean;
        eliminarCuotasPagadas: boolean;
        restaurarRecibos: boolean;
        crearBackup: boolean;
    } | undefined;
    confirmarRollback?: boolean | undefined;
}, {
    mes: number;
    anio: number;
    motivo?: string | undefined;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    opciones?: {
        eliminarCuotasPendientes?: boolean | undefined;
        eliminarCuotasPagadas?: boolean | undefined;
        restaurarRecibos?: boolean | undefined;
        crearBackup?: boolean | undefined;
    } | undefined;
    confirmarRollback?: boolean | undefined;
}>, {
    mes: number;
    anio: number;
    modo: "PREVIEW" | "APLICAR";
    motivo?: string | undefined;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
    opciones?: {
        eliminarCuotasPendientes: boolean;
        eliminarCuotasPagadas: boolean;
        restaurarRecibos: boolean;
        crearBackup: boolean;
    } | undefined;
    confirmarRollback?: boolean | undefined;
}, {
    mes: number;
    anio: number;
    motivo?: string | undefined;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    opciones?: {
        eliminarCuotasPendientes?: boolean | undefined;
        eliminarCuotasPagadas?: boolean | undefined;
        restaurarRecibos?: boolean | undefined;
        crearBackup?: boolean | undefined;
    } | undefined;
    confirmarRollback?: boolean | undefined;
}>;
export type RollbackGeneracionDto = z.infer<typeof rollbackGeneracionSchema>;
export declare const rollbackCuotaSchema: z.ZodEffects<z.ZodObject<{
    cuotaId: z.ZodNumber;
    eliminarItemsAsociados: z.ZodDefault<z.ZodBoolean>;
    eliminarRecibo: z.ZodDefault<z.ZodBoolean>;
    modo: z.ZodDefault<z.ZodEnum<["PREVIEW", "APLICAR"]>>;
    confirmarRollback: z.ZodOptional<z.ZodBoolean>;
    motivo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cuotaId: number;
    modo: "PREVIEW" | "APLICAR";
    eliminarItemsAsociados: boolean;
    eliminarRecibo: boolean;
    motivo?: string | undefined;
    confirmarRollback?: boolean | undefined;
}, {
    cuotaId: number;
    motivo?: string | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarRollback?: boolean | undefined;
    eliminarItemsAsociados?: boolean | undefined;
    eliminarRecibo?: boolean | undefined;
}>, {
    cuotaId: number;
    modo: "PREVIEW" | "APLICAR";
    eliminarItemsAsociados: boolean;
    eliminarRecibo: boolean;
    motivo?: string | undefined;
    confirmarRollback?: boolean | undefined;
}, {
    cuotaId: number;
    motivo?: string | undefined;
    modo?: "PREVIEW" | "APLICAR" | undefined;
    confirmarRollback?: boolean | undefined;
    eliminarItemsAsociados?: boolean | undefined;
    eliminarRecibo?: boolean | undefined;
}>;
export type RollbackCuotaDto = z.infer<typeof rollbackCuotaSchema>;
export declare const validarRollbackSchema: z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
    categoriaIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    socioIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    mes: number;
    anio: number;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
}, {
    mes: number;
    anio: number;
    categoriaIds?: number[] | undefined;
    socioIds?: number[] | undefined;
}>;
export type ValidarRollbackDto = z.infer<typeof validarRollbackSchema>;
export declare const previewCuotaSchema: z.ZodEffects<z.ZodObject<{
    cuotaId: z.ZodOptional<z.ZodNumber>;
    socioId: z.ZodOptional<z.ZodNumber>;
    mes: z.ZodOptional<z.ZodNumber>;
    anio: z.ZodOptional<z.ZodNumber>;
    categoriaId: z.ZodOptional<z.ZodNumber>;
    incluirDetalleItems: z.ZodDefault<z.ZodBoolean>;
    incluirExplicacionDescuentos: z.ZodDefault<z.ZodBoolean>;
    incluirHistorialCambios: z.ZodDefault<z.ZodBoolean>;
    formato: z.ZodDefault<z.ZodEnum<["COMPLETO", "RESUMIDO", "SIMPLE"]>>;
}, "strip", z.ZodTypeAny, {
    formato: "COMPLETO" | "RESUMIDO" | "SIMPLE";
    incluirDetalleItems: boolean;
    incluirExplicacionDescuentos: boolean;
    incluirHistorialCambios: boolean;
    categoriaId?: number | undefined;
    socioId?: number | undefined;
    cuotaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
}, {
    categoriaId?: number | undefined;
    socioId?: number | undefined;
    cuotaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
    formato?: "COMPLETO" | "RESUMIDO" | "SIMPLE" | undefined;
    incluirDetalleItems?: boolean | undefined;
    incluirExplicacionDescuentos?: boolean | undefined;
    incluirHistorialCambios?: boolean | undefined;
}>, {
    formato: "COMPLETO" | "RESUMIDO" | "SIMPLE";
    incluirDetalleItems: boolean;
    incluirExplicacionDescuentos: boolean;
    incluirHistorialCambios: boolean;
    categoriaId?: number | undefined;
    socioId?: number | undefined;
    cuotaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
}, {
    categoriaId?: number | undefined;
    socioId?: number | undefined;
    cuotaId?: number | undefined;
    mes?: number | undefined;
    anio?: number | undefined;
    formato?: "COMPLETO" | "RESUMIDO" | "SIMPLE" | undefined;
    incluirDetalleItems?: boolean | undefined;
    incluirExplicacionDescuentos?: boolean | undefined;
    incluirHistorialCambios?: boolean | undefined;
}>;
export type PreviewCuotaDto = z.infer<typeof previewCuotaSchema>;
export declare const previewCuotasSocioSchema: z.ZodObject<{
    socioId: z.ZodNumber;
    mesDesde: z.ZodNumber;
    anioDesde: z.ZodNumber;
    mesHasta: z.ZodOptional<z.ZodNumber>;
    anioHasta: z.ZodOptional<z.ZodNumber>;
    incluirPagadas: z.ZodDefault<z.ZodBoolean>;
    incluirAnuladas: z.ZodDefault<z.ZodBoolean>;
    formato: z.ZodDefault<z.ZodEnum<["COMPLETO", "RESUMIDO", "SIMPLE"]>>;
}, "strip", z.ZodTypeAny, {
    socioId: number;
    formato: "COMPLETO" | "RESUMIDO" | "SIMPLE";
    mesDesde: number;
    anioDesde: number;
    incluirPagadas: boolean;
    incluirAnuladas: boolean;
    mesHasta?: number | undefined;
    anioHasta?: number | undefined;
}, {
    socioId: number;
    mesDesde: number;
    anioDesde: number;
    formato?: "COMPLETO" | "RESUMIDO" | "SIMPLE" | undefined;
    mesHasta?: number | undefined;
    anioHasta?: number | undefined;
    incluirPagadas?: boolean | undefined;
    incluirAnuladas?: boolean | undefined;
}>;
export type PreviewCuotasSocioDto = z.infer<typeof previewCuotasSocioSchema>;
//# sourceMappingURL=cuota.dto.d.ts.map