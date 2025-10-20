import { z } from 'zod';
export declare const createReservaAulaActividadSchema: z.ZodEffects<z.ZodObject<{
    horarioId: z.ZodNumber;
    aulaId: z.ZodString;
    fechaVigenciaDesde: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    fechaVigenciaHasta: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    horarioId: number;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}, {
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    horarioId: number;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}>, {
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    horarioId: number;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}, {
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    horarioId: number;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}>;
export declare const updateReservaAulaActividadSchema: z.ZodObject<{
    fechaVigenciaHasta: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}, {
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}>;
export declare const reservarAulaParaActividadSchema: z.ZodEffects<z.ZodObject<{
    actividadId: z.ZodNumber;
    aulaId: z.ZodString;
    fechaVigenciaDesde: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    fechaVigenciaHasta: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    actividadId: number;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}, {
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    actividadId: number;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}>, {
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    actividadId: number;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}, {
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    actividadId: number;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}>;
export declare const cambiarAulaHorarioSchema: z.ZodEffects<z.ZodObject<{
    nuevaAulaId: z.ZodString;
    fechaVigenciaDesde: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    fechaVigenciaHasta: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    fechaVigenciaDesde: string | Date;
    nuevaAulaId: string;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}, {
    fechaVigenciaDesde: string | Date;
    nuevaAulaId: string;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}>, {
    fechaVigenciaDesde: string | Date;
    nuevaAulaId: string;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}, {
    fechaVigenciaDesde: string | Date;
    nuevaAulaId: string;
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | null | undefined;
}>;
export declare const queryReservasAulasActividadesSchema: z.ZodObject<{
    horarioId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    aulaId: z.ZodOptional<z.ZodString>;
    actividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    diaSemanaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    vigentes: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    incluirRelaciones: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    fechaReferencia: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    incluirRelaciones: boolean;
    diaSemanaId?: number | undefined;
    aulaId?: string | undefined;
    vigentes?: boolean | undefined;
    fechaReferencia?: string | undefined;
    horarioId?: number | undefined;
    actividadId?: number | undefined;
}, {
    page?: unknown;
    limit?: unknown;
    diaSemanaId?: unknown;
    aulaId?: string | undefined;
    incluirRelaciones?: unknown;
    vigentes?: unknown;
    fechaReferencia?: string | undefined;
    horarioId?: unknown;
    actividadId?: unknown;
}>;
export declare const verificarDisponibilidadAulaSchema: z.ZodEffects<z.ZodObject<{
    aulaId: z.ZodString;
    diaSemanaId: z.ZodNumber;
    horaInicio: z.ZodString;
    horaFin: z.ZodString;
    fechaVigenciaDesde: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    fechaVigenciaHasta: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    horarioExcluidoId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    fechaVigenciaHasta?: string | Date | null | undefined;
    horarioExcluidoId?: number | undefined;
}, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    fechaVigenciaHasta?: string | Date | null | undefined;
    horarioExcluidoId?: number | undefined;
}>, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    fechaVigenciaHasta?: string | Date | null | undefined;
    horarioExcluidoId?: number | undefined;
}, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    aulaId: string;
    fechaVigenciaDesde: string | Date;
    fechaVigenciaHasta?: string | Date | null | undefined;
    horarioExcluidoId?: number | undefined;
}>;
export declare const finalizarReservaAulaSchema: z.ZodObject<{
    fechaVigenciaHasta: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | undefined;
}, {
    observaciones?: string | null | undefined;
    fechaVigenciaHasta?: string | Date | undefined;
}>;
export type CreateReservaAulaActividadDto = z.infer<typeof createReservaAulaActividadSchema>;
export type UpdateReservaAulaActividadDto = z.infer<typeof updateReservaAulaActividadSchema>;
export type ReservarAulaParaActividadDto = z.infer<typeof reservarAulaParaActividadSchema>;
export type CambiarAulaHorarioDto = z.infer<typeof cambiarAulaHorarioSchema>;
export type QueryReservasAulasActividadesDto = z.infer<typeof queryReservasAulasActividadesSchema>;
export type VerificarDisponibilidadAulaDto = z.infer<typeof verificarDisponibilidadAulaSchema>;
export type FinalizarReservaAulaDto = z.infer<typeof finalizarReservaAulaSchema>;
//# sourceMappingURL=reserva-aula-actividad.dto.d.ts.map