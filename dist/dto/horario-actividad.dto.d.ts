import { z } from 'zod';
export declare const createHorarioActividadSchema: z.ZodEffects<z.ZodObject<{
    actividadId: z.ZodNumber;
    diaSemanaId: z.ZodNumber;
    horaInicio: z.ZodString;
    horaFin: z.ZodString;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    actividadId: number;
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
}, {
    actividadId: number;
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    activo?: boolean | undefined;
}>, {
    activo: boolean;
    actividadId: number;
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
}, {
    actividadId: number;
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    activo?: boolean | undefined;
}>;
export declare const updateHorarioActividadSchema: z.ZodEffects<z.ZodObject<{
    activo: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    diaSemanaId: z.ZodOptional<z.ZodNumber>;
    horaInicio: z.ZodOptional<z.ZodString>;
    horaFin: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    activo?: boolean | undefined;
    diaSemanaId?: number | undefined;
    horaInicio?: string | undefined;
    horaFin?: string | undefined;
}, {
    activo?: boolean | undefined;
    diaSemanaId?: number | undefined;
    horaInicio?: string | undefined;
    horaFin?: string | undefined;
}>, {
    activo?: boolean | undefined;
    diaSemanaId?: number | undefined;
    horaInicio?: string | undefined;
    horaFin?: string | undefined;
}, {
    activo?: boolean | undefined;
    diaSemanaId?: number | undefined;
    horaInicio?: string | undefined;
    horaFin?: string | undefined;
}>;
export declare const createMultiplesHorariosSchema: z.ZodObject<{
    actividadId: z.ZodNumber;
    horarios: z.ZodArray<z.ZodEffects<z.ZodObject<Omit<{
        actividadId: z.ZodNumber;
        diaSemanaId: z.ZodNumber;
        horaInicio: z.ZodString;
        horaFin: z.ZodString;
        activo: z.ZodDefault<z.ZodBoolean>;
    }, "actividadId">, "strip", z.ZodTypeAny, {
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    actividadId: number;
    horarios: {
        activo: boolean;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    }[];
}, {
    actividadId: number;
    horarios: {
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
        activo?: boolean | undefined;
    }[];
}>;
export declare const queryHorariosSchema: z.ZodObject<{
    actividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    diaSemanaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    activo: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    activo?: boolean | undefined;
    actividadId?: number | undefined;
    diaSemanaId?: number | undefined;
}, {
    activo?: unknown;
    page?: unknown;
    limit?: unknown;
    actividadId?: unknown;
    diaSemanaId?: unknown;
}>;
export declare const queryActividadesPorDiaYHoraSchema: z.ZodObject<{
    diaSemanaId: z.ZodEffects<z.ZodNumber, number, unknown>;
    horaInicio: z.ZodOptional<z.ZodString>;
    horaFin: z.ZodOptional<z.ZodString>;
    soloActivas: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
}, "strip", z.ZodTypeAny, {
    diaSemanaId: number;
    soloActivas: boolean;
    horaInicio?: string | undefined;
    horaFin?: string | undefined;
}, {
    diaSemanaId?: unknown;
    horaInicio?: string | undefined;
    horaFin?: string | undefined;
    soloActivas?: unknown;
}>;
export declare const verificarConflictoHorarioSchema: z.ZodEffects<z.ZodObject<{
    actividadId: z.ZodOptional<z.ZodNumber>;
    diaSemanaId: z.ZodNumber;
    horaInicio: z.ZodString;
    horaFin: z.ZodString;
    aulaId: z.ZodOptional<z.ZodString>;
    docenteId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    actividadId?: number | undefined;
    docenteId?: string | undefined;
    aulaId?: string | undefined;
}, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    actividadId?: number | undefined;
    docenteId?: string | undefined;
    aulaId?: string | undefined;
}>, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    actividadId?: number | undefined;
    docenteId?: string | undefined;
    aulaId?: string | undefined;
}, {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    actividadId?: number | undefined;
    docenteId?: string | undefined;
    aulaId?: string | undefined;
}>;
export type CreateHorarioActividadDto = z.infer<typeof createHorarioActividadSchema>;
export type UpdateHorarioActividadDto = z.infer<typeof updateHorarioActividadSchema>;
export type CreateMultiplesHorariosDto = z.infer<typeof createMultiplesHorariosSchema>;
export type QueryHorariosDto = z.infer<typeof queryHorariosSchema>;
export type QueryActividadesPorDiaYHoraDto = z.infer<typeof queryActividadesPorDiaYHoraSchema>;
export type VerificarConflictoHorarioDto = z.infer<typeof verificarConflictoHorarioSchema>;
//# sourceMappingURL=horario-actividad.dto.d.ts.map