import { z } from 'zod';
declare const horarioSchema: z.ZodEffects<z.ZodObject<{
    diaSemana: z.ZodNativeEnum<{
        LUNES: "LUNES";
        MARTES: "MARTES";
        MIERCOLES: "MIERCOLES";
        JUEVES: "JUEVES";
        VIERNES: "VIERNES";
        SABADO: "SABADO";
        DOMINGO: "DOMINGO";
    }>;
    horaInicio: z.ZodString;
    horaFin: z.ZodString;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    horaInicio: string;
    horaFin: string;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
}, {
    horaInicio: string;
    horaFin: string;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    activo?: boolean | undefined;
}>, {
    activo: boolean;
    horaInicio: string;
    horaFin: string;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
}, {
    horaInicio: string;
    horaFin: string;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    activo?: boolean | undefined;
}>;
export declare const createActividadSchema: z.ZodObject<{
    docenteIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    horarios: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        diaSemana: z.ZodNativeEnum<{
            LUNES: "LUNES";
            MARTES: "MARTES";
            MIERCOLES: "MIERCOLES";
            JUEVES: "JUEVES";
            VIERNES: "VIERNES";
            SABADO: "SABADO";
            DOMINGO: "DOMINGO";
        }>;
        horaInicio: z.ZodString;
        horaFin: z.ZodString;
        activo: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    }, {
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
        activo?: boolean | undefined;
    }>, {
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    }, {
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
        activo?: boolean | undefined;
    }>, "many">>>;
    nombre: z.ZodString;
    tipo: z.ZodNativeEnum<{
        CORO: "CORO";
        CLASE_CANTO: "CLASE_CANTO";
        CLASE_INSTRUMENTO: "CLASE_INSTRUMENTO";
    }>;
    descripcion: z.ZodOptional<z.ZodString>;
    precio: z.ZodDefault<z.ZodNumber>;
    duracion: z.ZodOptional<z.ZodNumber>;
    capacidadMaxima: z.ZodOptional<z.ZodNumber>;
    activa: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    tipo: "CORO" | "CLASE_CANTO" | "CLASE_INSTRUMENTO";
    nombre: string;
    activa: boolean;
    precio: number;
    horarios: {
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    }[];
    docenteIds: string[];
    descripcion?: string | undefined;
    duracion?: number | undefined;
    capacidadMaxima?: number | undefined;
}, {
    tipo: "CORO" | "CLASE_CANTO" | "CLASE_INSTRUMENTO";
    nombre: string;
    activa?: boolean | undefined;
    descripcion?: string | undefined;
    precio?: number | undefined;
    duracion?: number | undefined;
    capacidadMaxima?: number | undefined;
    horarios?: {
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
        activo?: boolean | undefined;
    }[] | undefined;
    docenteIds?: string[] | undefined;
}>;
export declare const updateActividadSchema: z.ZodObject<{
    docenteIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    horarios: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        diaSemana: z.ZodNativeEnum<{
            LUNES: "LUNES";
            MARTES: "MARTES";
            MIERCOLES: "MIERCOLES";
            JUEVES: "JUEVES";
            VIERNES: "VIERNES";
            SABADO: "SABADO";
            DOMINGO: "DOMINGO";
        }>;
        horaInicio: z.ZodString;
        horaFin: z.ZodString;
        activo: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    }, {
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
        activo?: boolean | undefined;
    }>, {
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    }, {
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
        activo?: boolean | undefined;
    }>, "many">>;
    nombre: z.ZodOptional<z.ZodString>;
    tipo: z.ZodOptional<z.ZodNativeEnum<{
        CORO: "CORO";
        CLASE_CANTO: "CLASE_CANTO";
        CLASE_INSTRUMENTO: "CLASE_INSTRUMENTO";
    }>>;
    descripcion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    precio: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    duracion: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    capacidadMaxima: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    activa: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    tipo?: "CORO" | "CLASE_CANTO" | "CLASE_INSTRUMENTO" | undefined;
    nombre?: string | undefined;
    activa?: boolean | undefined;
    descripcion?: string | undefined;
    precio?: number | undefined;
    duracion?: number | undefined;
    capacidadMaxima?: number | undefined;
    horarios?: {
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    }[] | undefined;
    docenteIds?: string[] | undefined;
}, {
    tipo?: "CORO" | "CLASE_CANTO" | "CLASE_INSTRUMENTO" | undefined;
    nombre?: string | undefined;
    activa?: boolean | undefined;
    descripcion?: string | undefined;
    precio?: number | undefined;
    duracion?: number | undefined;
    capacidadMaxima?: number | undefined;
    horarios?: {
        horaInicio: string;
        horaFin: string;
        diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
        activo?: boolean | undefined;
    }[] | undefined;
    docenteIds?: string[] | undefined;
}>;
export declare const actividadQuerySchema: z.ZodObject<{
    tipo: z.ZodOptional<z.ZodNativeEnum<{
        CORO: "CORO";
        CLASE_CANTO: "CLASE_CANTO";
        CLASE_INSTRUMENTO: "CLASE_INSTRUMENTO";
    }>>;
    activa: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    conDocentes: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    precioDesde: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    precioHasta: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    tipo?: "CORO" | "CLASE_CANTO" | "CLASE_INSTRUMENTO" | undefined;
    activa?: boolean | undefined;
    search?: string | undefined;
    conDocentes?: boolean | undefined;
    precioDesde?: number | undefined;
    precioHasta?: number | undefined;
}, {
    tipo?: "CORO" | "CLASE_CANTO" | "CLASE_INSTRUMENTO" | undefined;
    activa?: unknown;
    search?: string | undefined;
    page?: unknown;
    limit?: unknown;
    conDocentes?: unknown;
    precioDesde?: unknown;
    precioHasta?: unknown;
}>;
export declare const asignarDocenteSchema: z.ZodObject<{
    docenteId: z.ZodString;
    actividadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    actividadId: string;
    docenteId: string;
}, {
    actividadId: string;
    docenteId: string;
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
    diaSemana: z.ZodNativeEnum<{
        LUNES: "LUNES";
        MARTES: "MARTES";
        MIERCOLES: "MIERCOLES";
        JUEVES: "JUEVES";
        VIERNES: "VIERNES";
        SABADO: "SABADO";
        DOMINGO: "DOMINGO";
    }>;
    horaInicio: z.ZodString;
    horaFin: z.ZodString;
    activo: z.ZodDefault<z.ZodBoolean>;
} & {
    actividadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    actividadId: string;
    horaInicio: string;
    horaFin: string;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
}, {
    actividadId: string;
    horaInicio: string;
    horaFin: string;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    activo?: boolean | undefined;
}>, {
    activo: boolean;
    actividadId: string;
    horaInicio: string;
    horaFin: string;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
}, {
    actividadId: string;
    horaInicio: string;
    horaFin: string;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
    activo?: boolean | undefined;
}>;
export declare const updateHorarioSchema: z.ZodObject<{
    diaSemana: z.ZodOptional<z.ZodNativeEnum<{
        LUNES: "LUNES";
        MARTES: "MARTES";
        MIERCOLES: "MIERCOLES";
        JUEVES: "JUEVES";
        VIERNES: "VIERNES";
        SABADO: "SABADO";
        DOMINGO: "DOMINGO";
    }>>;
    horaInicio: z.ZodOptional<z.ZodString>;
    horaFin: z.ZodOptional<z.ZodString>;
    activo: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    activo?: boolean | undefined;
    horaInicio?: string | undefined;
    horaFin?: string | undefined;
    diaSemana?: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO" | undefined;
}, {
    activo?: boolean | undefined;
    horaInicio?: string | undefined;
    horaFin?: string | undefined;
    diaSemana?: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO" | undefined;
}>;
export declare const queryPorDiaSchema: z.ZodObject<{
    dia: z.ZodNativeEnum<{
        LUNES: "LUNES";
        MARTES: "MARTES";
        MIERCOLES: "MIERCOLES";
        JUEVES: "JUEVES";
        VIERNES: "VIERNES";
        SABADO: "SABADO";
        DOMINGO: "DOMINGO";
    }>;
    soloActivas: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
}, "strip", z.ZodTypeAny, {
    soloActivas: boolean;
    dia: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
}, {
    dia: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
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