import { z } from 'zod';
export declare const TipoExencionEnum: z.ZodEnum<["TOTAL", "PARCIAL"]>;
export declare const MotivoExencionEnum: z.ZodEnum<["BECA", "SOCIO_FUNDADOR", "SOCIO_HONORARIO", "SITUACION_ECONOMICA", "SITUACION_SALUD", "INTERCAMBIO_SERVICIOS", "PROMOCION", "FAMILIAR_DOCENTE", "OTRO"]>;
export declare const EstadoExencionEnum: z.ZodEnum<["PENDIENTE_APROBACION", "APROBADA", "RECHAZADA", "VIGENTE", "VENCIDA", "REVOCADA"]>;
export declare const createExencionCuotaSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    personaId: z.ZodNumber;
    tipoExencion: z.ZodEnum<["TOTAL", "PARCIAL"]>;
    motivoExencion: z.ZodEnum<["BECA", "SOCIO_FUNDADOR", "SOCIO_HONORARIO", "SITUACION_ECONOMICA", "SITUACION_SALUD", "INTERCAMBIO_SERVICIOS", "PROMOCION", "FAMILIAR_DOCENTE", "OTRO"]>;
    porcentajeExencion: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    fechaInicio: z.ZodDate;
    fechaFin: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    descripcion: z.ZodString;
    justificacion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    documentacionAdjunta: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    solicitadoPor: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    descripcion: string;
    personaId: number;
    fechaInicio: Date;
    tipoExencion: "TOTAL" | "PARCIAL";
    motivoExencion: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO";
    porcentajeExencion: number;
    observaciones?: string | null | undefined;
    fechaFin?: Date | null | undefined;
    justificacion?: string | null | undefined;
    documentacionAdjunta?: string | null | undefined;
    solicitadoPor?: string | null | undefined;
}, {
    descripcion: string;
    personaId: number;
    fechaInicio: Date;
    tipoExencion: "TOTAL" | "PARCIAL";
    motivoExencion: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO";
    observaciones?: string | null | undefined;
    fechaFin?: Date | null | undefined;
    porcentajeExencion?: number | undefined;
    justificacion?: string | null | undefined;
    documentacionAdjunta?: string | null | undefined;
    solicitadoPor?: string | null | undefined;
}>, {
    descripcion: string;
    personaId: number;
    fechaInicio: Date;
    tipoExencion: "TOTAL" | "PARCIAL";
    motivoExencion: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO";
    porcentajeExencion: number;
    observaciones?: string | null | undefined;
    fechaFin?: Date | null | undefined;
    justificacion?: string | null | undefined;
    documentacionAdjunta?: string | null | undefined;
    solicitadoPor?: string | null | undefined;
}, {
    descripcion: string;
    personaId: number;
    fechaInicio: Date;
    tipoExencion: "TOTAL" | "PARCIAL";
    motivoExencion: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO";
    observaciones?: string | null | undefined;
    fechaFin?: Date | null | undefined;
    porcentajeExencion?: number | undefined;
    justificacion?: string | null | undefined;
    documentacionAdjunta?: string | null | undefined;
    solicitadoPor?: string | null | undefined;
}>, {
    descripcion: string;
    personaId: number;
    fechaInicio: Date;
    tipoExencion: "TOTAL" | "PARCIAL";
    motivoExencion: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO";
    porcentajeExencion: number;
    observaciones?: string | null | undefined;
    fechaFin?: Date | null | undefined;
    justificacion?: string | null | undefined;
    documentacionAdjunta?: string | null | undefined;
    solicitadoPor?: string | null | undefined;
}, {
    descripcion: string;
    personaId: number;
    fechaInicio: Date;
    tipoExencion: "TOTAL" | "PARCIAL";
    motivoExencion: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO";
    observaciones?: string | null | undefined;
    fechaFin?: Date | null | undefined;
    porcentajeExencion?: number | undefined;
    justificacion?: string | null | undefined;
    documentacionAdjunta?: string | null | undefined;
    solicitadoPor?: string | null | undefined;
}>;
export type CreateExencionCuotaDto = z.infer<typeof createExencionCuotaSchema>;
export declare const updateExencionCuotaSchema: z.ZodObject<{
    tipoExencion: z.ZodOptional<z.ZodEnum<["TOTAL", "PARCIAL"]>>;
    motivoExencion: z.ZodOptional<z.ZodEnum<["BECA", "SOCIO_FUNDADOR", "SOCIO_HONORARIO", "SITUACION_ECONOMICA", "SITUACION_SALUD", "INTERCAMBIO_SERVICIOS", "PROMOCION", "FAMILIAR_DOCENTE", "OTRO"]>>;
    porcentajeExencion: z.ZodOptional<z.ZodNumber>;
    fechaInicio: z.ZodOptional<z.ZodDate>;
    fechaFin: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    descripcion: z.ZodOptional<z.ZodString>;
    justificacion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    documentacionAdjunta: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    descripcion?: string | undefined;
    fechaInicio?: Date | undefined;
    fechaFin?: Date | null | undefined;
    tipoExencion?: "TOTAL" | "PARCIAL" | undefined;
    motivoExencion?: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO" | undefined;
    porcentajeExencion?: number | undefined;
    justificacion?: string | null | undefined;
    documentacionAdjunta?: string | null | undefined;
}, {
    observaciones?: string | null | undefined;
    descripcion?: string | undefined;
    fechaInicio?: Date | undefined;
    fechaFin?: Date | null | undefined;
    tipoExencion?: "TOTAL" | "PARCIAL" | undefined;
    motivoExencion?: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO" | undefined;
    porcentajeExencion?: number | undefined;
    justificacion?: string | null | undefined;
    documentacionAdjunta?: string | null | undefined;
}>;
export type UpdateExencionCuotaDto = z.infer<typeof updateExencionCuotaSchema>;
export declare const aprobarExencionSchema: z.ZodObject<{
    aprobadoPor: z.ZodString;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    aprobadoPor: string;
    observaciones?: string | null | undefined;
}, {
    aprobadoPor: string;
    observaciones?: string | null | undefined;
}>;
export type AprobarExencionDto = z.infer<typeof aprobarExencionSchema>;
export declare const rechazarExencionSchema: z.ZodObject<{
    motivoRechazo: z.ZodString;
}, "strip", z.ZodTypeAny, {
    motivoRechazo: string;
}, {
    motivoRechazo: string;
}>;
export type RechazarExencionDto = z.infer<typeof rechazarExencionSchema>;
export declare const revocarExencionSchema: z.ZodObject<{
    motivoRevocacion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    motivoRevocacion: string;
}, {
    motivoRevocacion: string;
}>;
export type RevocarExencionDto = z.infer<typeof revocarExencionSchema>;
export declare const queryExencionCuotaSchema: z.ZodObject<{
    personaId: z.ZodOptional<z.ZodNumber>;
    tipoExencion: z.ZodOptional<z.ZodEnum<["TOTAL", "PARCIAL"]>>;
    motivoExencion: z.ZodOptional<z.ZodEnum<["BECA", "SOCIO_FUNDADOR", "SOCIO_HONORARIO", "SITUACION_ECONOMICA", "SITUACION_SALUD", "INTERCAMBIO_SERVICIOS", "PROMOCION", "FAMILIAR_DOCENTE", "OTRO"]>>;
    estado: z.ZodOptional<z.ZodEnum<["PENDIENTE_APROBACION", "APROBADA", "RECHAZADA", "VIGENTE", "VENCIDA", "REVOCADA"]>>;
    activa: z.ZodOptional<z.ZodBoolean>;
    fechaDesde: z.ZodOptional<z.ZodDate>;
    fechaHasta: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    personaId?: number | undefined;
    activa?: boolean | undefined;
    estado?: "PENDIENTE_APROBACION" | "APROBADA" | "RECHAZADA" | "VIGENTE" | "VENCIDA" | "REVOCADA" | undefined;
    tipoExencion?: "TOTAL" | "PARCIAL" | undefined;
    motivoExencion?: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO" | undefined;
    fechaDesde?: Date | undefined;
    fechaHasta?: Date | undefined;
}, {
    personaId?: number | undefined;
    activa?: boolean | undefined;
    estado?: "PENDIENTE_APROBACION" | "APROBADA" | "RECHAZADA" | "VIGENTE" | "VENCIDA" | "REVOCADA" | undefined;
    tipoExencion?: "TOTAL" | "PARCIAL" | undefined;
    motivoExencion?: "BECA" | "SOCIO_FUNDADOR" | "SOCIO_HONORARIO" | "SITUACION_ECONOMICA" | "SITUACION_SALUD" | "INTERCAMBIO_SERVICIOS" | "PROMOCION" | "FAMILIAR_DOCENTE" | "OTRO" | undefined;
    fechaDesde?: Date | undefined;
    fechaHasta?: Date | undefined;
}>;
export type QueryExencionCuotaDto = z.infer<typeof queryExencionCuotaSchema>;
//# sourceMappingURL=exencion-cuota.dto.d.ts.map