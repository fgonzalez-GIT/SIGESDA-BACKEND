import { z } from 'zod';
export declare const createParticipacionSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    personaId: z.ZodNumber;
    actividadId: z.ZodNumber;
    fechaInicio: z.ZodDate;
    fechaFin: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    precioEspecial: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, number | null | undefined, unknown>;
    activa: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    activa: boolean;
    personaId: number;
    actividadId: number;
    fechaInicio: Date;
    observaciones?: string | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: number | null | undefined;
}, {
    personaId: number;
    actividadId: number;
    fechaInicio: Date;
    activa?: boolean | undefined;
    observaciones?: string | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: unknown;
}>, {
    activa: boolean;
    personaId: number;
    actividadId: number;
    fechaInicio: Date;
    observaciones?: string | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: number | null | undefined;
}, {
    personaId: number;
    actividadId: number;
    fechaInicio: Date;
    activa?: boolean | undefined;
    observaciones?: string | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: unknown;
}>, {
    activa: boolean;
    personaId: number;
    actividadId: number;
    fechaInicio: Date;
    observaciones?: string | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: number | null | undefined;
}, {
    personaId: number;
    actividadId: number;
    fechaInicio: Date;
    activa?: boolean | undefined;
    observaciones?: string | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: unknown;
}>;
export declare const updateParticipacionSchema: z.ZodEffects<z.ZodObject<{
    fechaInicio: z.ZodOptional<z.ZodDate>;
    fechaFin: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    precioEspecial: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, number | null | undefined, unknown>;
    activa: z.ZodOptional<z.ZodBoolean>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    activa?: boolean | undefined;
    observaciones?: string | undefined;
    fechaInicio?: Date | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: number | null | undefined;
}, {
    activa?: boolean | undefined;
    observaciones?: string | undefined;
    fechaInicio?: Date | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: unknown;
}>, {
    activa?: boolean | undefined;
    observaciones?: string | undefined;
    fechaInicio?: Date | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: number | null | undefined;
}, {
    activa?: boolean | undefined;
    observaciones?: string | undefined;
    fechaInicio?: Date | undefined;
    fechaFin?: Date | null | undefined;
    precioEspecial?: unknown;
}>;
export declare const participacionQuerySchema: z.ZodObject<{
    personaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    actividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    activa: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    fechaDesde: z.ZodOptional<z.ZodDate>;
    fechaHasta: z.ZodOptional<z.ZodDate>;
    conPrecioEspecial: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    sortBy: z.ZodDefault<z.ZodEnum<["fechaInicio", "fechaFin", "persona", "actividad", "createdAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "persona" | "createdAt" | "fechaInicio" | "fechaFin" | "actividad";
    sortOrder: "asc" | "desc";
    activa?: boolean | undefined;
    fechaDesde?: Date | undefined;
    fechaHasta?: Date | undefined;
    personaId?: number | undefined;
    search?: string | undefined;
    actividadId?: number | undefined;
    conPrecioEspecial?: boolean | undefined;
}, {
    activa?: unknown;
    fechaDesde?: Date | undefined;
    fechaHasta?: Date | undefined;
    personaId?: unknown;
    search?: string | undefined;
    page?: unknown;
    limit?: unknown;
    actividadId?: unknown;
    conPrecioEspecial?: unknown;
    sortBy?: "persona" | "createdAt" | "fechaInicio" | "fechaFin" | "actividad" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const inscripcionMasivaSchema: z.ZodObject<{
    personaId: z.ZodNumber;
    actividades: z.ZodArray<z.ZodObject<{
        actividadId: z.ZodNumber;
        fechaInicio: z.ZodDate;
        fechaFin: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
        precioEspecial: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        actividadId: number;
        fechaInicio: Date;
        observaciones?: string | undefined;
        fechaFin?: Date | null | undefined;
        precioEspecial?: number | null | undefined;
    }, {
        actividadId: number;
        fechaInicio: Date;
        observaciones?: string | undefined;
        fechaFin?: Date | null | undefined;
        precioEspecial?: number | null | undefined;
    }>, "many">;
    aplicarDescuentoFamiliar: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    personaId: number;
    actividades: {
        actividadId: number;
        fechaInicio: Date;
        observaciones?: string | undefined;
        fechaFin?: Date | null | undefined;
        precioEspecial?: number | null | undefined;
    }[];
    aplicarDescuentoFamiliar: boolean;
}, {
    personaId: number;
    actividades: {
        actividadId: number;
        fechaInicio: Date;
        observaciones?: string | undefined;
        fechaFin?: Date | null | undefined;
        precioEspecial?: number | null | undefined;
    }[];
    aplicarDescuentoFamiliar?: boolean | undefined;
}>;
export declare const inscripcionMultiplePersonasSchema: z.ZodObject<{
    actividadId: z.ZodNumber;
    personas: z.ZodArray<z.ZodObject<{
        personaId: z.ZodNumber;
        fechaInicio: z.ZodDate;
        precioEspecial: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        personaId: number;
        fechaInicio: Date;
        observaciones?: string | undefined;
        precioEspecial?: number | null | undefined;
    }, {
        personaId: number;
        fechaInicio: Date;
        observaciones?: string | undefined;
        precioEspecial?: number | null | undefined;
    }>, "many">;
    fechaInicioComun: z.ZodOptional<z.ZodDate>;
    precioEspecialComun: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    observacionesComunes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    personas: {
        personaId: number;
        fechaInicio: Date;
        observaciones?: string | undefined;
        precioEspecial?: number | null | undefined;
    }[];
    actividadId: number;
    fechaInicioComun?: Date | undefined;
    precioEspecialComun?: number | null | undefined;
    observacionesComunes?: string | undefined;
}, {
    personas: {
        personaId: number;
        fechaInicio: Date;
        observaciones?: string | undefined;
        precioEspecial?: number | null | undefined;
    }[];
    actividadId: number;
    fechaInicioComun?: Date | undefined;
    precioEspecialComun?: number | null | undefined;
    observacionesComunes?: string | undefined;
}>;
export declare const desincripcionSchema: z.ZodObject<{
    fechaFin: z.ZodOptional<z.ZodDate>;
    motivoDesincripcion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fechaFin?: Date | undefined;
    motivoDesincripcion?: string | undefined;
}, {
    fechaFin?: Date | undefined;
    motivoDesincripcion?: string | undefined;
}>;
export declare const estadisticasParticipacionSchema: z.ZodObject<{
    fechaDesde: z.ZodOptional<z.ZodDate>;
    fechaHasta: z.ZodOptional<z.ZodDate>;
    agruparPor: z.ZodDefault<z.ZodEnum<["mes", "actividad", "persona", "tipo_actividad"]>>;
    soloActivas: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    agruparPor: "persona" | "actividad" | "mes" | "tipo_actividad";
    soloActivas: boolean;
    fechaDesde?: Date | undefined;
    fechaHasta?: Date | undefined;
}, {
    fechaDesde?: Date | undefined;
    fechaHasta?: Date | undefined;
    agruparPor?: "persona" | "actividad" | "mes" | "tipo_actividad" | undefined;
    soloActivas?: boolean | undefined;
}>;
export declare const reporteInasistenciasSchema: z.ZodObject<{
    actividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    personaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    fechaDesde: z.ZodDate;
    fechaHasta: z.ZodDate;
    umbralInasistencias: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    fechaDesde: Date;
    fechaHasta: Date;
    umbralInasistencias: number;
    personaId?: number | undefined;
    actividadId?: number | undefined;
}, {
    fechaDesde: Date;
    fechaHasta: Date;
    personaId?: unknown;
    actividadId?: unknown;
    umbralInasistencias?: number | undefined;
}>;
export declare const verificarCuposSchema: z.ZodObject<{
    actividadId: z.ZodNumber;
    fechaConsulta: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    actividadId: number;
    fechaConsulta: Date;
}, {
    actividadId: number;
    fechaConsulta?: Date | undefined;
}>;
export declare const transferirParticipacionSchema: z.ZodObject<{
    nuevaActividadId: z.ZodNumber;
    fechaTransferencia: z.ZodDefault<z.ZodDate>;
    conservarFechaInicio: z.ZodDefault<z.ZodBoolean>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nuevaActividadId: number;
    fechaTransferencia: Date;
    conservarFechaInicio: boolean;
    observaciones?: string | undefined;
}, {
    nuevaActividadId: number;
    observaciones?: string | undefined;
    fechaTransferencia?: Date | undefined;
    conservarFechaInicio?: boolean | undefined;
}>;
export declare enum EstadoParticipacion {
    ACTIVA = "ACTIVA",
    FINALIZADA = "FINALIZADA",
    SUSPENDIDA = "SUSPENDIDA"
}
export declare const determinarEstado: (participacion: {
    activa: boolean;
    fechaFin: Date | null;
}) => EstadoParticipacion;
export declare const calcularDuracionParticipacion: (fechaInicio: Date, fechaFin?: Date | null) => number;
export declare const validarSolapamientoParticipaciones: (nuevaParticipacion: {
    personaId: string;
    actividadId: number;
    fechaInicio: Date;
    fechaFin?: Date | null;
}, participacionesExistentes: Array<{
    id: number;
    personaId: string;
    actividadId: number;
    fechaInicio: Date;
    fechaFin: Date | null;
    activa: boolean;
}>) => {
    valido: boolean;
    conflictos: string[];
};
export type CreateParticipacionDto = z.infer<typeof createParticipacionSchema>;
export type UpdateParticipacionDto = z.infer<typeof updateParticipacionSchema>;
export type ParticipacionQueryDto = z.infer<typeof participacionQuerySchema>;
export type InscripcionMasivaDto = z.infer<typeof inscripcionMasivaSchema>;
export type InscripcionMultiplePersonasDto = z.infer<typeof inscripcionMultiplePersonasSchema>;
export type DesincripcionDto = z.infer<typeof desincripcionSchema>;
export type EstadisticasParticipacionDto = z.infer<typeof estadisticasParticipacionSchema>;
export type ReporteInasistenciasDto = z.infer<typeof reporteInasistenciasSchema>;
export type VerificarCuposDto = z.infer<typeof verificarCuposSchema>;
export type TransferirParticipacionDto = z.infer<typeof transferirParticipacionSchema>;
//# sourceMappingURL=participacion.dto.d.ts.map