import { z } from 'zod';
export declare const createReservaAulaSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    aulaId: z.ZodString;
    actividadId: z.ZodOptional<z.ZodString>;
    docenteId: z.ZodString;
    fechaInicio: z.ZodString;
    fechaFin: z.ZodString;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}>;
export declare const updateReservaAulaSchema: z.ZodEffects<z.ZodObject<{
    aulaId: z.ZodOptional<z.ZodString>;
    actividadId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    docenteId: z.ZodOptional<z.ZodString>;
    fechaInicio: z.ZodOptional<z.ZodString>;
    fechaFin: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    actividadId?: string | null | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    aulaId?: string | undefined;
    docenteId?: string | undefined;
}, {
    observaciones?: string | null | undefined;
    actividadId?: string | null | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    aulaId?: string | undefined;
    docenteId?: string | undefined;
}>, {
    observaciones?: string | null | undefined;
    actividadId?: string | null | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    aulaId?: string | undefined;
    docenteId?: string | undefined;
}, {
    observaciones?: string | null | undefined;
    actividadId?: string | null | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    aulaId?: string | undefined;
    docenteId?: string | undefined;
}>;
export declare const reservaAulaQuerySchema: z.ZodObject<{
    aulaId: z.ZodOptional<z.ZodString>;
    actividadId: z.ZodOptional<z.ZodString>;
    docenteId: z.ZodOptional<z.ZodString>;
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
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    actividadId?: string | undefined;
    aulaId?: string | undefined;
    docenteId?: string | undefined;
}, {
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    page?: unknown;
    limit?: unknown;
    actividadId?: string | undefined;
    aulaId?: string | undefined;
    docenteId?: string | undefined;
    soloActivas?: unknown;
    incluirPasadas?: unknown;
}>;
export declare const conflictDetectionSchema: z.ZodEffects<z.ZodObject<{
    aulaId: z.ZodString;
    fechaInicio: z.ZodString;
    fechaFin: z.ZodString;
    excludeReservaId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    excludeReservaId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    excludeReservaId?: string | undefined;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    excludeReservaId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    excludeReservaId?: string | undefined;
}>;
export declare const createBulkReservasSchema: z.ZodObject<{
    reservas: z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        aulaId: z.ZodString;
        actividadId: z.ZodOptional<z.ZodString>;
        docenteId: z.ZodString;
        fechaInicio: z.ZodString;
        fechaFin: z.ZodString;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }>, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }>, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }>, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }, {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    reservas: {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }[];
}, {
    reservas: {
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        docenteId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }[];
}>;
export declare const deleteBulkReservasSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    ids: string[];
}, {
    ids: string[];
}>;
export declare const createRecurringReservaSchema: z.ZodEffects<z.ZodObject<{
    aulaId: z.ZodString;
    actividadId: z.ZodOptional<z.ZodString>;
    docenteId: z.ZodString;
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
    aulaId: string;
    docenteId: string;
    recurrencia: {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    };
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    recurrencia: {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    };
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}>, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    recurrencia: {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    };
    observaciones?: string | undefined;
    actividadId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    aulaId: string;
    docenteId: string;
    recurrencia: {
        tipo: "DIARIO" | "SEMANAL" | "MENSUAL";
        fechaHasta: string;
        intervalo: number;
        diasSemana?: number[] | undefined;
        maxOcurrencias?: number | undefined;
    };
    observaciones?: string | undefined;
    actividadId?: string | undefined;
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
export type CreateReservaAulaDto = z.infer<typeof createReservaAulaSchema>;
export type UpdateReservaAulaDto = z.infer<typeof updateReservaAulaSchema>;
export type ReservaAulaQueryDto = z.infer<typeof reservaAulaQuerySchema>;
export type ConflictDetectionDto = z.infer<typeof conflictDetectionSchema>;
export type CreateBulkReservasDto = z.infer<typeof createBulkReservasSchema>;
export type DeleteBulkReservasDto = z.infer<typeof deleteBulkReservasSchema>;
export type CreateRecurringReservaDto = z.infer<typeof createRecurringReservaSchema>;
export type ReservaSearchDto = z.infer<typeof reservaSearchSchema>;
export type ReservaStatsDto = z.infer<typeof reservaStatsSchema>;
//# sourceMappingURL=reserva-aula.dto.d.ts.map