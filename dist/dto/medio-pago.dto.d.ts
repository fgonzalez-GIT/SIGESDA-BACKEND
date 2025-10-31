import { z } from 'zod';
import { MedioPagoTipo } from '@prisma/client';
export declare const MedioPagoTipoSchema: z.ZodNativeEnum<{
    EFECTIVO: "EFECTIVO";
    TRANSFERENCIA: "TRANSFERENCIA";
    TARJETA_DEBITO: "TARJETA_DEBITO";
    TARJETA_CREDITO: "TARJETA_CREDITO";
    CHEQUE: "CHEQUE";
}>;
export declare const CreateMedioPagoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    reciboId: z.ZodString;
    tipo: z.ZodNativeEnum<{
        EFECTIVO: "EFECTIVO";
        TRANSFERENCIA: "TRANSFERENCIA";
        TARJETA_DEBITO: "TARJETA_DEBITO";
        TARJETA_CREDITO: "TARJETA_CREDITO";
        CHEQUE: "CHEQUE";
    }>;
    importe: z.ZodNumber;
    numero: z.ZodOptional<z.ZodString>;
    fecha: z.ZodOptional<z.ZodString>;
    banco: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
    importe: number;
    reciboId: string;
    observaciones?: string | undefined;
    numero?: string | undefined;
    fecha?: string | undefined;
    banco?: string | undefined;
}, {
    tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
    importe: number;
    reciboId: string;
    observaciones?: string | undefined;
    numero?: string | undefined;
    fecha?: string | undefined;
    banco?: string | undefined;
}>, {
    tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
    importe: number;
    reciboId: string;
    observaciones?: string | undefined;
    numero?: string | undefined;
    fecha?: string | undefined;
    banco?: string | undefined;
}, {
    tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
    importe: number;
    reciboId: string;
    observaciones?: string | undefined;
    numero?: string | undefined;
    fecha?: string | undefined;
    banco?: string | undefined;
}>, {
    tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
    importe: number;
    reciboId: string;
    observaciones?: string | undefined;
    numero?: string | undefined;
    fecha?: string | undefined;
    banco?: string | undefined;
}, {
    tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
    importe: number;
    reciboId: string;
    observaciones?: string | undefined;
    numero?: string | undefined;
    fecha?: string | undefined;
    banco?: string | undefined;
}>;
export declare const UpdateMedioPagoSchema: z.ZodObject<{
    tipo: z.ZodOptional<z.ZodNativeEnum<{
        EFECTIVO: "EFECTIVO";
        TRANSFERENCIA: "TRANSFERENCIA";
        TARJETA_DEBITO: "TARJETA_DEBITO";
        TARJETA_CREDITO: "TARJETA_CREDITO";
        CHEQUE: "CHEQUE";
    }>>;
    importe: z.ZodOptional<z.ZodNumber>;
    numero: z.ZodOptional<z.ZodString>;
    fecha: z.ZodOptional<z.ZodString>;
    banco: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo?: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE" | undefined;
    observaciones?: string | undefined;
    numero?: string | undefined;
    importe?: number | undefined;
    fecha?: string | undefined;
    banco?: string | undefined;
}, {
    tipo?: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE" | undefined;
    observaciones?: string | undefined;
    numero?: string | undefined;
    importe?: number | undefined;
    fecha?: string | undefined;
    banco?: string | undefined;
}>;
export declare const MedioPagoFilterSchema: z.ZodObject<{
    reciboId: z.ZodOptional<z.ZodString>;
    tipo: z.ZodOptional<z.ZodNativeEnum<{
        EFECTIVO: "EFECTIVO";
        TRANSFERENCIA: "TRANSFERENCIA";
        TARJETA_DEBITO: "TARJETA_DEBITO";
        TARJETA_CREDITO: "TARJETA_CREDITO";
        CHEQUE: "CHEQUE";
    }>>;
    importeMinimo: z.ZodOptional<z.ZodNumber>;
    importeMaximo: z.ZodOptional<z.ZodNumber>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
    banco: z.ZodOptional<z.ZodString>;
    numero: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    orderBy: z.ZodDefault<z.ZodEnum<["fecha", "importe", "tipo", "numero"]>>;
    orderDirection: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    orderBy: "tipo" | "numero" | "importe" | "fecha";
    page: number;
    limit: number;
    orderDirection: "asc" | "desc";
    tipo?: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE" | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    numero?: string | undefined;
    importeMinimo?: number | undefined;
    importeMaximo?: number | undefined;
    reciboId?: string | undefined;
    banco?: string | undefined;
}, {
    tipo?: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE" | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    orderBy?: "tipo" | "numero" | "importe" | "fecha" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    numero?: string | undefined;
    importeMinimo?: number | undefined;
    importeMaximo?: number | undefined;
    reciboId?: string | undefined;
    banco?: string | undefined;
    orderDirection?: "asc" | "desc" | undefined;
}>;
export declare const MedioPagoSearchSchema: z.ZodObject<{
    search: z.ZodString;
    searchBy: z.ZodDefault<z.ZodEnum<["numero", "banco", "recibo", "all"]>>;
    tipo: z.ZodOptional<z.ZodNativeEnum<{
        EFECTIVO: "EFECTIVO";
        TRANSFERENCIA: "TRANSFERENCIA";
        TARJETA_DEBITO: "TARJETA_DEBITO";
        TARJETA_CREDITO: "TARJETA_CREDITO";
        CHEQUE: "CHEQUE";
    }>>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search: string;
    searchBy: "recibo" | "numero" | "all" | "banco";
    tipo?: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE" | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    search: string;
    tipo?: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE" | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    searchBy?: "recibo" | "numero" | "all" | "banco" | undefined;
}>;
export declare const MedioPagoStatsSchema: z.ZodEffects<z.ZodObject<{
    fechaDesde: z.ZodString;
    fechaHasta: z.ZodString;
    agruparPor: z.ZodDefault<z.ZodEnum<["tipo", "banco", "mes", "general"]>>;
    reciboId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "tipo" | "mes" | "banco" | "general";
    reciboId?: string | undefined;
}, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor?: "tipo" | "mes" | "banco" | "general" | undefined;
    reciboId?: string | undefined;
}>, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "tipo" | "mes" | "banco" | "general";
    reciboId?: string | undefined;
}, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor?: "tipo" | "mes" | "banco" | "general" | undefined;
    reciboId?: string | undefined;
}>;
export declare const DeleteBulkMediosPagoSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
    confirmarEliminacion: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    ids: string[];
    confirmarEliminacion: boolean;
}, {
    ids: string[];
    confirmarEliminacion: boolean;
}>;
export declare const ValidarPagoCompletoSchema: z.ZodObject<{
    reciboId: z.ZodString;
    tolerancia: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    reciboId: string;
    tolerancia: number;
}, {
    reciboId: string;
    tolerancia?: number | undefined;
}>;
export declare const ConciliacionBancariaSchema: z.ZodObject<{
    banco: z.ZodString;
    fechaDesde: z.ZodString;
    fechaHasta: z.ZodString;
    tipo: z.ZodOptional<z.ZodEnum<["CHEQUE", "TRANSFERENCIA"]>>;
}, "strip", z.ZodTypeAny, {
    fechaDesde: string;
    fechaHasta: string;
    banco: string;
    tipo?: "TRANSFERENCIA" | "CHEQUE" | undefined;
}, {
    fechaDesde: string;
    fechaHasta: string;
    banco: string;
    tipo?: "TRANSFERENCIA" | "CHEQUE" | undefined;
}>;
export type CreateMedioPagoDto = z.infer<typeof CreateMedioPagoSchema>;
export type UpdateMedioPagoDto = z.infer<typeof UpdateMedioPagoSchema>;
export type MedioPagoFilterDto = z.infer<typeof MedioPagoFilterSchema>;
export type MedioPagoSearchDto = z.infer<typeof MedioPagoSearchSchema>;
export type MedioPagoStatsDto = z.infer<typeof MedioPagoStatsSchema>;
export type DeleteBulkMediosPagoDto = z.infer<typeof DeleteBulkMediosPagoSchema>;
export type ValidarPagoCompletoDto = z.infer<typeof ValidarPagoCompletoSchema>;
export type ConciliacionBancariaDto = z.infer<typeof ConciliacionBancariaSchema>;
export interface MedioPagoResponseDto {
    id: string;
    reciboId: string;
    tipo: MedioPagoTipo;
    importe: number;
    numero?: string;
    fecha: Date;
    banco?: string;
    observaciones?: string;
    createdAt: Date;
    updatedAt: Date;
    recibo?: {
        numero: string;
        estado: string;
        importe: number;
        concepto: string;
        fecha: Date;
        receptor?: {
            nombre: string;
            apellido: string;
            dni: string;
        };
    };
}
export interface MedioPagoStatsResponseDto {
    totalMediosPago: number;
    importeTotal: number;
    porTipo: {
        tipo: MedioPagoTipo;
        cantidad: number;
        importeTotal: number;
        porcentaje: number;
    }[];
    porBanco?: {
        banco: string;
        cantidad: number;
        importeTotal: number;
        tipos: MedioPagoTipo[];
    }[];
    tendenciaMensual?: {
        mes: number;
        anio: number;
        cantidad: number;
        importeTotal: number;
        tipos: {
            tipo: MedioPagoTipo;
            cantidad: number;
            importe: number;
        }[];
    }[];
}
export interface ValidacionPagoResponseDto {
    reciboId: string;
    importeRecibo: number;
    importeTotalPagos: number;
    diferencia: number;
    esPagoCompleto: boolean;
    estado: 'COMPLETO' | 'PARCIAL' | 'EXCEDIDO';
    mediosPago: {
        id: string;
        tipo: MedioPagoTipo;
        importe: number;
        fecha: Date;
        numero?: string;
        banco?: string;
    }[];
    alertas: string[];
}
export interface ConciliacionBancariaResponseDto {
    banco: string;
    periodo: {
        desde: Date;
        hasta: Date;
    };
    resumen: {
        totalOperaciones: number;
        importeTotal: number;
        tiposOperaciones: {
            tipo: MedioPagoTipo;
            cantidad: number;
            importe: number;
        }[];
    };
    operaciones: {
        id: string;
        tipo: MedioPagoTipo;
        numero: string;
        importe: number;
        fecha: Date;
        recibo: {
            numero: string;
            concepto: string;
            receptor: string;
        };
    }[];
    estadisticas: {
        promedioOperacion: number;
        operacionMayor: number;
        operacionMenor: number;
        diasConOperaciones: number;
    };
}
//# sourceMappingURL=medio-pago.dto.d.ts.map