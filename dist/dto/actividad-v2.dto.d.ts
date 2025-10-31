import { z } from 'zod';
declare const horarioInlineSchema: z.ZodEffects<z.ZodObject<{
    diaSemanaId: z.ZodNumber;
    horaInicio: z.ZodString;
    horaFin: z.ZodString;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
}, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    activo?: boolean | undefined;
}>, {
    activo: boolean;
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
}, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    activo?: boolean | undefined;
}>;
declare const docenteInlineSchema: z.ZodObject<{
    docenteId: z.ZodNumber;
    rolDocenteId: z.ZodNumber;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    docenteId: number;
    rolDocenteId: number;
    observaciones?: string | null | undefined;
}, {
    docenteId: number;
    rolDocenteId: number;
    observaciones?: string | null | undefined;
}>;
declare const reservaAulaInlineSchema: z.ZodObject<{
    diaSemanaId: z.ZodNumber;
    horaInicio: z.ZodString;
    horaFin: z.ZodString;
    aulaId: z.ZodString;
    fechaVigenciaDesde: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    fechaVigenciaHasta: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
}, "strip", z.ZodTypeAny, {
    aulaId: string;
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    fechaVigenciaDesde: string | Date;
    fechaVigenciaHasta?: string | Date | null | undefined;
}, {
    aulaId: string;
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    fechaVigenciaDesde: string | Date;
    fechaVigenciaHasta?: string | Date | null | undefined;
}>;
export declare const createActividadSchema: z.ZodEffects<z.ZodObject<{
    codigoActividad: z.ZodString;
    nombre: z.ZodString;
    tipoActividadId: z.ZodNumber;
    categoriaId: z.ZodNumber;
    estadoId: z.ZodDefault<z.ZodNumber>;
    descripcion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fechaDesde: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    fechaHasta: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    cupoMaximo: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    costo: z.ZodDefault<z.ZodNumber>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
} & {
    horarios: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        diaSemanaId: z.ZodNumber;
        horaInicio: z.ZodString;
        horaFin: z.ZodString;
        activo: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        activo: boolean;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    }, {
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        activo?: boolean | undefined;
    }>, {
        activo: boolean;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    }, {
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        activo?: boolean | undefined;
    }>, "many">>>;
    docentes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        docenteId: z.ZodNumber;
        rolDocenteId: z.ZodNumber;
        observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        docenteId: number;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }, {
        docenteId: number;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }>, "many">>>;
    reservasAulas: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        diaSemanaId: z.ZodNumber;
        horaInicio: z.ZodString;
        horaFin: z.ZodString;
        aulaId: z.ZodString;
        fechaVigenciaDesde: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        fechaVigenciaHasta: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    }, "strip", z.ZodTypeAny, {
        aulaId: string;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        fechaVigenciaDesde: string | Date;
        fechaVigenciaHasta?: string | Date | null | undefined;
    }, {
        aulaId: string;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        fechaVigenciaDesde: string | Date;
        fechaVigenciaHasta?: string | Date | null | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    categoriaId: number;
    fechaDesde: string | Date;
    codigoActividad: string;
    tipoActividadId: number;
    estadoId: number;
    costo: number;
    horarios: {
        activo: boolean;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    }[];
    docentes: {
        docenteId: number;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }[];
    reservasAulas: {
        aulaId: string;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        fechaVigenciaDesde: string | Date;
        fechaVigenciaHasta?: string | Date | null | undefined;
    }[];
    fechaHasta?: string | Date | null | undefined;
    observaciones?: string | null | undefined;
    descripcion?: string | null | undefined;
    cupoMaximo?: number | null | undefined;
}, {
    nombre: string;
    categoriaId: number;
    fechaDesde: string | Date;
    codigoActividad: string;
    tipoActividadId: number;
    fechaHasta?: string | Date | null | undefined;
    observaciones?: string | null | undefined;
    descripcion?: string | null | undefined;
    estadoId?: number | undefined;
    cupoMaximo?: number | null | undefined;
    costo?: number | undefined;
    horarios?: {
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        activo?: boolean | undefined;
    }[] | undefined;
    docentes?: {
        docenteId: number;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }[] | undefined;
    reservasAulas?: {
        aulaId: string;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        fechaVigenciaDesde: string | Date;
        fechaVigenciaHasta?: string | Date | null | undefined;
    }[] | undefined;
}>, {
    nombre: string;
    categoriaId: number;
    fechaDesde: string | Date;
    codigoActividad: string;
    tipoActividadId: number;
    estadoId: number;
    costo: number;
    horarios: {
        activo: boolean;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    }[];
    docentes: {
        docenteId: number;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }[];
    reservasAulas: {
        aulaId: string;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        fechaVigenciaDesde: string | Date;
        fechaVigenciaHasta?: string | Date | null | undefined;
    }[];
    fechaHasta?: string | Date | null | undefined;
    observaciones?: string | null | undefined;
    descripcion?: string | null | undefined;
    cupoMaximo?: number | null | undefined;
}, {
    nombre: string;
    categoriaId: number;
    fechaDesde: string | Date;
    codigoActividad: string;
    tipoActividadId: number;
    fechaHasta?: string | Date | null | undefined;
    observaciones?: string | null | undefined;
    descripcion?: string | null | undefined;
    estadoId?: number | undefined;
    cupoMaximo?: number | null | undefined;
    costo?: number | undefined;
    horarios?: {
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        activo?: boolean | undefined;
    }[] | undefined;
    docentes?: {
        docenteId: number;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }[] | undefined;
    reservasAulas?: {
        aulaId: string;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        fechaVigenciaDesde: string | Date;
        fechaVigenciaHasta?: string | Date | null | undefined;
    }[] | undefined;
}>;
export declare const updateActividadSchema: z.ZodEffects<z.ZodObject<{
    codigoActividad: z.ZodOptional<z.ZodString>;
    nombre: z.ZodOptional<z.ZodString>;
    tipoActividadId: z.ZodOptional<z.ZodNumber>;
    categoriaId: z.ZodOptional<z.ZodNumber>;
    estadoId: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    descripcion: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    fechaDesde: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    fechaHasta: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>>;
    cupoMaximo: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    costo: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    observaciones: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    nombre?: string | undefined;
    categoriaId?: number | undefined;
    fechaDesde?: string | Date | undefined;
    fechaHasta?: string | Date | null | undefined;
    observaciones?: string | null | undefined;
    descripcion?: string | null | undefined;
    codigoActividad?: string | undefined;
    tipoActividadId?: number | undefined;
    estadoId?: number | undefined;
    cupoMaximo?: number | null | undefined;
    costo?: number | undefined;
}, {
    nombre?: string | undefined;
    categoriaId?: number | undefined;
    fechaDesde?: string | Date | undefined;
    fechaHasta?: string | Date | null | undefined;
    observaciones?: string | null | undefined;
    descripcion?: string | null | undefined;
    codigoActividad?: string | undefined;
    tipoActividadId?: number | undefined;
    estadoId?: number | undefined;
    cupoMaximo?: number | null | undefined;
    costo?: number | undefined;
}>, {
    nombre?: string | undefined;
    categoriaId?: number | undefined;
    fechaDesde?: string | Date | undefined;
    fechaHasta?: string | Date | null | undefined;
    observaciones?: string | null | undefined;
    descripcion?: string | null | undefined;
    codigoActividad?: string | undefined;
    tipoActividadId?: number | undefined;
    estadoId?: number | undefined;
    cupoMaximo?: number | null | undefined;
    costo?: number | undefined;
}, {
    nombre?: string | undefined;
    categoriaId?: number | undefined;
    fechaDesde?: string | Date | undefined;
    fechaHasta?: string | Date | null | undefined;
    observaciones?: string | null | undefined;
    descripcion?: string | null | undefined;
    codigoActividad?: string | undefined;
    tipoActividadId?: number | undefined;
    estadoId?: number | undefined;
    cupoMaximo?: number | null | undefined;
    costo?: number | undefined;
}>;
export declare const queryActividadesSchema: z.ZodObject<{
    tipoActividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    categoriaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    estadoId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    diaSemanaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    docenteId: z.ZodOptional<z.ZodString>;
    aulaId: z.ZodOptional<z.ZodString>;
    conCupo: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    incluirRelaciones: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    costoDesde: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    costoHasta: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
    vigentes: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    orderBy: z.ZodDefault<z.ZodEnum<["nombre", "codigo", "fechaDesde", "costo", "cupoMaximo", "created_at"]>>;
    orderDir: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    orderBy: "nombre" | "fechaDesde" | "codigo" | "cupoMaximo" | "costo" | "created_at";
    page: number;
    limit: number;
    incluirRelaciones: boolean;
    orderDir: "asc" | "desc";
    categoriaId?: number | undefined;
    search?: string | undefined;
    aulaId?: string | undefined;
    docenteId?: string | undefined;
    tipoActividadId?: number | undefined;
    estadoId?: number | undefined;
    diaSemanaId?: number | undefined;
    conCupo?: boolean | undefined;
    costoDesde?: number | undefined;
    costoHasta?: number | undefined;
    vigentes?: boolean | undefined;
}, {
    categoriaId?: unknown;
    orderBy?: "nombre" | "fechaDesde" | "codigo" | "cupoMaximo" | "costo" | "created_at" | undefined;
    search?: string | undefined;
    page?: unknown;
    limit?: unknown;
    aulaId?: string | undefined;
    docenteId?: string | undefined;
    tipoActividadId?: unknown;
    estadoId?: unknown;
    diaSemanaId?: unknown;
    conCupo?: unknown;
    incluirRelaciones?: unknown;
    costoDesde?: unknown;
    costoHasta?: unknown;
    vigentes?: unknown;
    orderDir?: "asc" | "desc" | undefined;
}>;
export declare const duplicarActividadSchema: z.ZodEffects<z.ZodObject<{
    nuevoCodigoActividad: z.ZodString;
    nuevoNombre: z.ZodString;
    nuevaFechaDesde: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    nuevaFechaHasta: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    copiarHorarios: z.ZodDefault<z.ZodBoolean>;
    copiarDocentes: z.ZodDefault<z.ZodBoolean>;
    copiarReservasAulas: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    nuevoCodigoActividad: string;
    nuevoNombre: string;
    nuevaFechaDesde: string | Date;
    copiarHorarios: boolean;
    copiarDocentes: boolean;
    copiarReservasAulas: boolean;
    nuevaFechaHasta?: string | Date | null | undefined;
}, {
    nuevoCodigoActividad: string;
    nuevoNombre: string;
    nuevaFechaDesde: string | Date;
    nuevaFechaHasta?: string | Date | null | undefined;
    copiarHorarios?: boolean | undefined;
    copiarDocentes?: boolean | undefined;
    copiarReservasAulas?: boolean | undefined;
}>, {
    nuevoCodigoActividad: string;
    nuevoNombre: string;
    nuevaFechaDesde: string | Date;
    copiarHorarios: boolean;
    copiarDocentes: boolean;
    copiarReservasAulas: boolean;
    nuevaFechaHasta?: string | Date | null | undefined;
}, {
    nuevoCodigoActividad: string;
    nuevoNombre: string;
    nuevaFechaDesde: string | Date;
    nuevaFechaHasta?: string | Date | null | undefined;
    copiarHorarios?: boolean | undefined;
    copiarDocentes?: boolean | undefined;
    copiarReservasAulas?: boolean | undefined;
}>;
export declare const cambiarEstadoActividadSchema: z.ZodObject<{
    nuevoEstadoId: z.ZodNumber;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    nuevoEstadoId: number;
    observaciones?: string | null | undefined;
}, {
    nuevoEstadoId: number;
    observaciones?: string | null | undefined;
}>;
export declare const estadisticasActividadSchema: z.ZodObject<{
    incluirParticipaciones: z.ZodDefault<z.ZodBoolean>;
    incluirDocentes: z.ZodDefault<z.ZodBoolean>;
    incluirHorarios: z.ZodDefault<z.ZodBoolean>;
    incluirReservasAulas: z.ZodDefault<z.ZodBoolean>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    incluirParticipaciones: boolean;
    incluirDocentes: boolean;
    incluirHorarios: boolean;
    incluirReservasAulas: boolean;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    incluirParticipaciones?: boolean | undefined;
    incluirDocentes?: boolean | undefined;
    incluirHorarios?: boolean | undefined;
    incluirReservasAulas?: boolean | undefined;
}>;
export declare const reporteOcupacionSchema: z.ZodObject<{
    diaSemanaId: z.ZodOptional<z.ZodNumber>;
    aulaId: z.ZodOptional<z.ZodString>;
    docenteId: z.ZodOptional<z.ZodString>;
    fechaReferencia: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    aulaId?: string | undefined;
    docenteId?: string | undefined;
    diaSemanaId?: number | undefined;
    fechaReferencia?: string | undefined;
}, {
    aulaId?: string | undefined;
    docenteId?: string | undefined;
    diaSemanaId?: number | undefined;
    fechaReferencia?: string | undefined;
}>;
export type CreateActividadDto = z.infer<typeof createActividadSchema>;
export type UpdateActividadDto = z.infer<typeof updateActividadSchema>;
export type QueryActividadesDto = z.infer<typeof queryActividadesSchema>;
export type DuplicarActividadDto = z.infer<typeof duplicarActividadSchema>;
export type CambiarEstadoActividadDto = z.infer<typeof cambiarEstadoActividadSchema>;
export type EstadisticasActividadDto = z.infer<typeof estadisticasActividadSchema>;
export type ReporteOcupacionDto = z.infer<typeof reporteOcupacionSchema>;
export type HorarioInlineDto = z.infer<typeof horarioInlineSchema>;
export type DocenteInlineDto = z.infer<typeof docenteInlineSchema>;
export type ReservaAulaInlineDto = z.infer<typeof reservaAulaInlineSchema>;
export {};
//# sourceMappingURL=actividad-v2.dto.d.ts.map