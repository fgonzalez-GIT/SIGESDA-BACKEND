import { z } from 'zod';
export declare const createAsistenciaSchema: z.ZodObject<{
    participacionId: z.ZodNumber;
    fechaSesion: z.ZodString;
    asistio: z.ZodBoolean;
    justificada: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    participacionId: number;
    fechaSesion: string;
    asistio: boolean;
    justificada: boolean;
    observaciones?: string | undefined;
}, {
    participacionId: number;
    fechaSesion: string;
    asistio: boolean;
    observaciones?: string | undefined;
    justificada?: boolean | undefined;
}>;
export declare const registroAsistenciaMasivaSchema: z.ZodObject<{
    actividadId: z.ZodNumber;
    fechaSesion: z.ZodString;
    asistencias: z.ZodArray<z.ZodObject<{
        participacionId: z.ZodNumber;
        asistio: z.ZodBoolean;
        justificada: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        participacionId: number;
        asistio: boolean;
        justificada: boolean;
        observaciones?: string | undefined;
    }, {
        participacionId: number;
        asistio: boolean;
        observaciones?: string | undefined;
        justificada?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    actividadId: number;
    fechaSesion: string;
    asistencias: {
        participacionId: number;
        asistio: boolean;
        justificada: boolean;
        observaciones?: string | undefined;
    }[];
}, {
    actividadId: number;
    fechaSesion: string;
    asistencias: {
        participacionId: number;
        asistio: boolean;
        observaciones?: string | undefined;
        justificada?: boolean | undefined;
    }[];
}>;
export declare const updateAsistenciaSchema: z.ZodObject<{
    asistio: z.ZodOptional<z.ZodBoolean>;
    justificada: z.ZodOptional<z.ZodBoolean>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | undefined;
    asistio?: boolean | undefined;
    justificada?: boolean | undefined;
}, {
    observaciones?: string | undefined;
    asistio?: boolean | undefined;
    justificada?: boolean | undefined;
}>;
export declare const asistenciaQuerySchema: z.ZodObject<{
    participacionId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    actividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    personaId: z.ZodOptional<z.ZodString>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
    soloInasistencias: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    soloJustificadas: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    personaId?: string | undefined;
    actividadId?: number | undefined;
    participacionId?: number | undefined;
    soloInasistencias?: boolean | undefined;
    soloJustificadas?: boolean | undefined;
}, {
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    personaId?: string | undefined;
    page?: unknown;
    limit?: unknown;
    actividadId?: unknown;
    participacionId?: unknown;
    soloInasistencias?: unknown;
    soloJustificadas?: unknown;
}>;
export declare const reporteAsistenciasSchema: z.ZodEffects<z.ZodObject<{
    actividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    personaId: z.ZodOptional<z.ZodString>;
    fechaDesde: z.ZodString;
    fechaHasta: z.ZodString;
    agruparPor: z.ZodDefault<z.ZodEnum<["persona", "actividad", "mes", "dia"]>>;
}, "strip", z.ZodTypeAny, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "persona" | "actividad" | "mes" | "dia";
    personaId?: string | undefined;
    actividadId?: number | undefined;
}, {
    fechaDesde: string;
    fechaHasta: string;
    personaId?: string | undefined;
    actividadId?: unknown;
    agruparPor?: "persona" | "actividad" | "mes" | "dia" | undefined;
}>, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "persona" | "actividad" | "mes" | "dia";
    personaId?: string | undefined;
    actividadId?: number | undefined;
}, {
    fechaDesde: string;
    fechaHasta: string;
    personaId?: string | undefined;
    actividadId?: unknown;
    agruparPor?: "persona" | "actividad" | "mes" | "dia" | undefined;
}>;
export declare const tasaAsistenciaSchema: z.ZodObject<{
    participacionId: z.ZodNumber;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    participacionId: number;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    participacionId: number;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}>;
export declare const alertasInasistenciasSchema: z.ZodObject<{
    umbral: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    actividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    soloActivas: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
}, "strip", z.ZodTypeAny, {
    soloActivas: boolean;
    umbral: number;
    actividadId?: number | undefined;
}, {
    actividadId?: unknown;
    soloActivas?: unknown;
    umbral?: unknown;
}>;
export type CreateAsistenciaDto = z.infer<typeof createAsistenciaSchema>;
export type RegistroAsistenciaMasivaDto = z.infer<typeof registroAsistenciaMasivaSchema>;
export type UpdateAsistenciaDto = z.infer<typeof updateAsistenciaSchema>;
export type AsistenciaQueryDto = z.infer<typeof asistenciaQuerySchema>;
export type ReporteAsistenciasDto = z.infer<typeof reporteAsistenciasSchema>;
export type TasaAsistenciaDto = z.infer<typeof tasaAsistenciaSchema>;
export type AlertasInasistenciasDto = z.infer<typeof alertasInasistenciasSchema>;
//# sourceMappingURL=asistencia.dto.d.ts.map