import { z } from 'zod';
declare const horarioSchema: z.ZodEffects<z.ZodObject<{
    diaSemana: z.ZodNativeEnum<any>;
    horaInicio: z.ZodString;
    horaFin: z.ZodString;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
}, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
}>, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
}, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
}>;
export declare const createActividadSchema: z.ZodObject<{
    docenteIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    horarios: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        diaSemana: z.ZodNativeEnum<any>;
        horaInicio: z.ZodString;
        horaFin: z.ZodString;
        activo: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        [x: string]: any;
        diaSemana?: unknown;
        horaInicio?: unknown;
        horaFin?: unknown;
        activo?: unknown;
    }, {
        [x: string]: any;
        diaSemana?: unknown;
        horaInicio?: unknown;
        horaFin?: unknown;
        activo?: unknown;
    }>, {
        [x: string]: any;
        diaSemana?: unknown;
        horaInicio?: unknown;
        horaFin?: unknown;
        activo?: unknown;
    }, {
        [x: string]: any;
        diaSemana?: unknown;
        horaInicio?: unknown;
        horaFin?: unknown;
        activo?: unknown;
    }>, "many">>>;
    nombre: z.ZodString;
    tipo: z.ZodNativeEnum<any>;
    descripcion: z.ZodOptional<z.ZodString>;
    precio: z.ZodDefault<z.ZodNumber>;
    duracion: z.ZodOptional<z.ZodNumber>;
    capacidadMaxima: z.ZodOptional<z.ZodNumber>;
    activa: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    docenteIds?: unknown;
    horarios?: unknown;
    nombre?: unknown;
    tipo?: unknown;
    descripcion?: unknown;
    precio?: unknown;
    duracion?: unknown;
    capacidadMaxima?: unknown;
    activa?: unknown;
}, {
    [x: string]: any;
    docenteIds?: unknown;
    horarios?: unknown;
    nombre?: unknown;
    tipo?: unknown;
    descripcion?: unknown;
    precio?: unknown;
    duracion?: unknown;
    capacidadMaxima?: unknown;
    activa?: unknown;
}>;
export declare const updateActividadSchema: z.ZodObject<{
    docenteIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    horarios: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        diaSemana: z.ZodNativeEnum<any>;
        horaInicio: z.ZodString;
        horaFin: z.ZodString;
        activo: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        [x: string]: any;
        diaSemana?: unknown;
        horaInicio?: unknown;
        horaFin?: unknown;
        activo?: unknown;
    }, {
        [x: string]: any;
        diaSemana?: unknown;
        horaInicio?: unknown;
        horaFin?: unknown;
        activo?: unknown;
    }>, {
        [x: string]: any;
        diaSemana?: unknown;
        horaInicio?: unknown;
        horaFin?: unknown;
        activo?: unknown;
    }, {
        [x: string]: any;
        diaSemana?: unknown;
        horaInicio?: unknown;
        horaFin?: unknown;
        activo?: unknown;
    }>, "many">>;
    nombre: z.ZodOptional<z.ZodString>;
    tipo: z.ZodOptional<z.ZodNativeEnum<any>>;
    descripcion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    precio: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    duracion: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    capacidadMaxima: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    activa: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    docenteIds?: unknown;
    horarios?: unknown;
    nombre?: unknown;
    tipo?: unknown;
    descripcion?: unknown;
    precio?: unknown;
    duracion?: unknown;
    capacidadMaxima?: unknown;
    activa?: unknown;
}, {
    [x: string]: any;
    docenteIds?: unknown;
    horarios?: unknown;
    nombre?: unknown;
    tipo?: unknown;
    descripcion?: unknown;
    precio?: unknown;
    duracion?: unknown;
    capacidadMaxima?: unknown;
    activa?: unknown;
}>;
export declare const actividadQuerySchema: z.ZodObject<{
    tipo: z.ZodOptional<z.ZodNativeEnum<any>>;
    activa: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    conDocentes: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    precioDesde: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    precioHasta: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    tipo?: unknown;
    activa?: unknown;
    conDocentes?: unknown;
    precioDesde?: unknown;
    precioHasta?: unknown;
    search?: unknown;
    page?: unknown;
    limit?: unknown;
}, {
    [x: string]: any;
    tipo?: unknown;
    activa?: unknown;
    conDocentes?: unknown;
    precioDesde?: unknown;
    precioHasta?: unknown;
    search?: unknown;
    page?: unknown;
    limit?: unknown;
}>;
export declare const asignarDocenteSchema: z.ZodObject<{
    docenteId: z.ZodString;
    actividadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    docenteId: string;
    actividadId: string;
}, {
    docenteId: string;
    actividadId: string;
}>;
export declare const estadisticasActividadSchema: z.ZodObject<{
    incluirParticipaciones: z.ZodDefault<z.ZodBoolean>;
    incluirReservas: z.ZodDefault<z.ZodBoolean>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    incluirParticipaciones: boolean;
    incluirReservas: boolean;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    incluirParticipaciones?: boolean | undefined;
    incluirReservas?: boolean | undefined;
}>;
export declare const createHorarioSchema: z.ZodEffects<z.ZodObject<{
    diaSemana: z.ZodNativeEnum<any>;
    horaInicio: z.ZodString;
    horaFin: z.ZodString;
    activo: z.ZodDefault<z.ZodBoolean>;
} & {
    actividadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
    actividadId?: unknown;
}, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
    actividadId?: unknown;
}>, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
    actividadId?: unknown;
}, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
    actividadId?: unknown;
}>;
export declare const updateHorarioSchema: z.ZodObject<{
    diaSemana: z.ZodOptional<z.ZodNativeEnum<any>>;
    horaInicio: z.ZodOptional<z.ZodString>;
    horaFin: z.ZodOptional<z.ZodString>;
    activo: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
}, {
    [x: string]: any;
    diaSemana?: unknown;
    horaInicio?: unknown;
    horaFin?: unknown;
    activo?: unknown;
}>;
export declare const queryPorDiaSchema: z.ZodObject<{
    dia: z.ZodNativeEnum<any>;
    soloActivas: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    dia?: unknown;
    soloActivas?: unknown;
}, {
    [x: string]: any;
    dia?: unknown;
    soloActivas?: unknown;
}>;
export type HorarioDto = z.infer<typeof horarioSchema>;
export type CreateHorarioDto = z.infer<typeof createHorarioSchema>;
export type UpdateHorarioDto = z.infer<typeof updateHorarioSchema>;
export type QueryPorDiaDto = z.infer<typeof queryPorDiaSchema>;
export type CreateActividadDto = z.infer<typeof createActividadSchema>;
export type UpdateActividadDto = z.infer<typeof updateActividadSchema>;
export type ActividadQueryDto = z.infer<typeof actividadQuerySchema>;
export type AsignarDocenteDto = z.infer<typeof asignarDocenteSchema>;
export type EstadisticasActividadDto = z.infer<typeof estadisticasActividadSchema>;
export {};
//# sourceMappingURL=actividad.dto.d.ts.map