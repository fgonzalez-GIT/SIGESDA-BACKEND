import { z } from 'zod';
export declare const createReservaAulaSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    aulaId: z.ZodEffects<z.ZodNumber, number, unknown>;
    actividadId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    docenteId: z.ZodEffects<z.ZodNumber, number, unknown>;
    estadoReservaId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    fechaInicio: z.ZodString;
    fechaFin: z.ZodString;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: number;
    docenteId: number;
    observaciones?: string | undefined;
    actividadId?: number | undefined;
    estadoReservaId?: number | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    observaciones?: string | undefined;
    actividadId?: unknown;
    aulaId?: unknown;
    docenteId?: unknown;
    estadoReservaId?: unknown;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: number;
    docenteId: number;
    observaciones?: string | undefined;
    actividadId?: number | undefined;
    estadoReservaId?: number | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    observaciones?: string | undefined;
    actividadId?: unknown;
    aulaId?: unknown;
    docenteId?: unknown;
    estadoReservaId?: unknown;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: number;
    docenteId: number;
    observaciones?: string | undefined;
    actividadId?: number | undefined;
    estadoReservaId?: number | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    observaciones?: string | undefined;
    actividadId?: unknown;
    aulaId?: unknown;
    docenteId?: unknown;
    estadoReservaId?: unknown;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: number;
    docenteId: number;
    observaciones?: string | undefined;
    actividadId?: number | undefined;
    estadoReservaId?: number | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    observaciones?: string | undefined;
    actividadId?: unknown;
    aulaId?: unknown;
    docenteId?: unknown;
    estadoReservaId?: unknown;
}>;
export declare const updateReservaAulaSchema: z.ZodEffects<z.ZodObject<{
    aulaId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    actividadId: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>>;
    docenteId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    estadoReservaId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    fechaInicio: z.ZodOptional<z.ZodString>;
    fechaFin: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    actividadId?: number | null | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    aulaId?: number | undefined;
    docenteId?: number | undefined;
    estadoReservaId?: number | undefined;
}, {
    observaciones?: string | null | undefined;
    actividadId?: unknown;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    aulaId?: unknown;
    docenteId?: unknown;
    estadoReservaId?: unknown;
}>, {
    observaciones?: string | null | undefined;
    actividadId?: number | null | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    aulaId?: number | undefined;
    docenteId?: number | undefined;
    estadoReservaId?: number | undefined;
}, {
    observaciones?: string | null | undefined;
    actividadId?: unknown;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    aulaId?: unknown;
    docenteId?: unknown;
    estadoReservaId?: unknown;
}>;
export declare const reservaAulaQuerySchema: z.ZodObject<{
    aulaId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    actividadId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    docenteId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    estadoReservaId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
    soloActivas: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    incluirPasadas: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    soloActivas: boolean;
    incluirPasadas: boolean;
    actividadId?: number | undefined;
    aulaId?: number | undefined;
    docenteId?: number | undefined;
    estadoReservaId?: number | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    page?: unknown;
    limit?: unknown;
    actividadId?: unknown;
    aulaId?: unknown;
    docenteId?: unknown;
    estadoReservaId?: unknown;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    soloActivas?: unknown;
    incluirPasadas?: unknown;
}>;
export declare const conflictDetectionSchema: z.ZodEffects<z.ZodObject<{
    aulaId: z.ZodEffects<z.ZodNumber, number, unknown>;
    fechaInicio: z.ZodString;
    fechaFin: z.ZodString;
    excludeReservaId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
}, "strip", z.ZodTypeAny, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: number;
    excludeReservaId?: number | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId?: unknown;
    excludeReservaId?: unknown;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: number;
    excludeReservaId?: number | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId?: unknown;
    excludeReservaId?: unknown;
}>;
export declare const createBulkReservasSchema: z.ZodObject<{
    reservas: z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        aulaId: z.ZodEffects<z.ZodNumber, number, unknown>;
        actividadId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
        docenteId: z.ZodEffects<z.ZodNumber, number, unknown>;
        estadoReservaId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
        fechaInicio: z.ZodString;
        fechaFin: z.ZodString;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: number;
        docenteId: number;
        observaciones?: string | undefined;
        actividadId?: number | undefined;
        estadoReservaId?: number | undefined;
    }, {
        fechaInicio: string;
        fechaFin: string;
        observaciones?: string | undefined;
        actividadId?: unknown;
        aulaId?: unknown;
        docenteId?: unknown;
        estadoReservaId?: unknown;
    }>, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: number;
        docenteId: number;
        observaciones?: string | undefined;
        actividadId?: number | undefined;
        estadoReservaId?: number | undefined;
    }, {
        fechaInicio: string;
        fechaFin: string;
        observaciones?: string | undefined;
        actividadId?: unknown;
        aulaId?: unknown;
        docenteId?: unknown;
        estadoReservaId?: unknown;
    }>, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: number;
        docenteId: number;
        observaciones?: string | undefined;
        actividadId?: number | undefined;
        estadoReservaId?: number | undefined;
    }, {
        fechaInicio: string;
        fechaFin: string;
        observaciones?: string | undefined;
        actividadId?: unknown;
        aulaId?: unknown;
        docenteId?: unknown;
        estadoReservaId?: unknown;
    }>, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: number;
        docenteId: number;
        observaciones?: string | undefined;
        actividadId?: number | undefined;
        estadoReservaId?: number | undefined;
    }, {
        fechaInicio: string;
        fechaFin: string;
        observaciones?: string | undefined;
        actividadId?: unknown;
        aulaId?: unknown;
        docenteId?: unknown;
        estadoReservaId?: unknown;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    reservas: {
        fechaInicio: string;
        fechaFin: string;
        aulaId: number;
        docenteId: number;
        observaciones?: string | undefined;
        actividadId?: number | undefined;
        estadoReservaId?: number | undefined;
    }[];
}, {
    reservas: {
        fechaInicio: string;
        fechaFin: string;
        observaciones?: string | undefined;
        actividadId?: unknown;
        aulaId?: unknown;
        docenteId?: unknown;
        estadoReservaId?: unknown;
    }[];
}>;
export declare const deleteBulkReservasSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodEffects<z.ZodNumber, number, unknown>, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: unknown[];
}>;
export declare const createRecurringReservaSchema: z.ZodEffects<z.ZodObject<{
    aulaId: z.ZodEffects<z.ZodNumber, number, unknown>;
    actividadId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    docenteId: z.ZodEffects<z.ZodNumber, number, unknown>;
    fechaInicio: z.ZodString;
    fechaFin: z.ZodString;
    observaciones: z.ZodOptional<z.ZodString>;
    recurrencia: z.ZodObject<{
        tipo: z.ZodEnum<["DIARIO", "SEMANAL", "MENSUAL"]>;
        intervalo: z.ZodNumber;
        diasSemana: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        fechaHasta: z.ZodString;
        maxOcurrencias: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    }, {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: number;
    docenteId: number;
    recurrencia: {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    };
    observaciones?: string | undefined;
    actividadId?: number | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    recurrencia: {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    };
    observaciones?: string | undefined;
    actividadId?: unknown;
    aulaId?: unknown;
    docenteId?: unknown;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: number;
    docenteId: number;
    recurrencia: {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    };
    observaciones?: string | undefined;
    actividadId?: number | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    recurrencia: {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    };
    observaciones?: string | undefined;
    actividadId?: unknown;
    aulaId?: unknown;
    docenteId?: unknown;
}>;
export declare const reservaSearchSchema: z.ZodObject<{
    search: z.ZodString;
    searchBy: z.ZodDefault<z.ZodEnum<["aula", "docente", "actividad", "observaciones", "all"]>>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
    incluirPasadas: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    search: string;
    searchBy: "aula" | "observaciones" | "actividad" | "all" | "docente";
    incluirPasadas: boolean;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    search: string;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    searchBy?: "aula" | "observaciones" | "actividad" | "all" | "docente" | undefined;
    incluirPasadas?: boolean | undefined;
}>;
export declare const reservaStatsSchema: z.ZodEffects<z.ZodObject<{
    fechaDesde: z.ZodString;
    fechaHasta: z.ZodString;
    agruparPor: z.ZodDefault<z.ZodEnum<["aula", "docente", "actividad", "dia", "mes"]>>;
}, "strip", z.ZodTypeAny, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "aula" | "dia" | "actividad" | "mes" | "docente";
}, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor?: "aula" | "dia" | "actividad" | "mes" | "docente" | undefined;
}>, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "aula" | "dia" | "actividad" | "mes" | "docente";
}, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor?: "aula" | "dia" | "actividad" | "mes" | "docente" | undefined;
}>;
export declare const aprobarReservaSchema: z.ZodObject<{
    aprobadoPorId: z.ZodEffects<z.ZodNumber, number, unknown>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    aprobadoPorId: number;
    observaciones?: string | undefined;
}, {
    observaciones?: string | undefined;
    aprobadoPorId?: unknown;
}>;
export declare const rechazarReservaSchema: z.ZodObject<{
    rechazadoPorId: z.ZodEffects<z.ZodNumber, number, unknown>;
    motivo: z.ZodString;
}, "strip", z.ZodTypeAny, {
    motivo: string;
    rechazadoPorId: number;
}, {
    motivo: string;
    rechazadoPorId?: unknown;
}>;
export declare const cancelarReservaSchema: z.ZodObject<{
    canceladoPorId: z.ZodEffects<z.ZodNumber, number, unknown>;
    motivoCancelacion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    motivoCancelacion: string;
    canceladoPorId: number;
}, {
    motivoCancelacion: string;
    canceladoPorId?: unknown;
}>;
export type CreateReservaAulaDto = z.infer<typeof createReservaAulaSchema>;
export type UpdateReservaAulaDto = z.infer<typeof updateReservaAulaSchema>;
export type ReservaAulaQueryDto = z.infer<typeof reservaAulaQuerySchema>;
export type ConflictDetectionDto = z.infer<typeof conflictDetectionSchema>;
export type CreateBulkReservasDto = z.infer<typeof createBulkReservasSchema>;
export type DeleteBulkReservasDto = z.infer<typeof deleteBulkReservasSchema>;
export type CreateRecurringReservaDto = z.infer<typeof createRecurringReservaSchema>;
export type ReservaSearchDto = z.infer<typeof reservaSearchSchema>;
export type ReservaStatsDto = z.infer<typeof reservaStatsSchema>;
export type AprobarReservaDto = z.infer<typeof aprobarReservaSchema>;
export type RechazarReservaDto = z.infer<typeof rechazarReservaSchema>;
export type CancelarReservaDto = z.infer<typeof cancelarReservaSchema>;
//# sourceMappingURL=reserva-aula.dto.d.ts.map