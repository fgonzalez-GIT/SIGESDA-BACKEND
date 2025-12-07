import { z } from 'zod';
export declare const createActividadAulaSchema: z.ZodEffects<z.ZodObject<{
    actividadId: z.ZodNumber;
    aulaId: z.ZodNumber;
    fechaAsignacion: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    fechaDesasignacion: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    activa: z.ZodDefault<z.ZodBoolean>;
    prioridad: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    actividadId: number;
    activa: boolean;
    aulaId: number;
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
    fechaAsignacion?: string | Date | undefined;
    prioridad?: number | undefined;
}, {
    actividadId: number;
    aulaId: number;
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
    fechaAsignacion?: string | Date | undefined;
    activa?: boolean | undefined;
    prioridad?: number | undefined;
}>, {
    actividadId: number;
    activa: boolean;
    aulaId: number;
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
    fechaAsignacion?: string | Date | undefined;
    prioridad?: number | undefined;
}, {
    actividadId: number;
    aulaId: number;
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
    fechaAsignacion?: string | Date | undefined;
    activa?: boolean | undefined;
    prioridad?: number | undefined;
}>;
export declare const updateActividadAulaSchema: z.ZodObject<{
    prioridad: z.ZodOptional<z.ZodNumber>;
    fechaDesasignacion: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    activa: z.ZodOptional<z.ZodBoolean>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
    activa?: boolean | undefined;
    prioridad?: number | undefined;
}, {
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
    activa?: boolean | undefined;
    prioridad?: number | undefined;
}>;
export declare const asignarMultiplesAulasSchema: z.ZodObject<{
    actividadId: z.ZodNumber;
    aulas: z.ZodArray<z.ZodObject<{
        aulaId: z.ZodNumber;
        prioridad: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        aulaId: number;
        observaciones?: string | null | undefined;
        prioridad?: number | undefined;
    }, {
        aulaId: number;
        observaciones?: string | null | undefined;
        prioridad?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    actividadId: number;
    aulas: {
        aulaId: number;
        observaciones?: string | null | undefined;
        prioridad?: number | undefined;
    }[];
}, {
    actividadId: number;
    aulas: {
        aulaId: number;
        observaciones?: string | null | undefined;
        prioridad?: number | undefined;
    }[];
}>;
export declare const cambiarAulaSchema: z.ZodObject<{
    nuevaAulaId: z.ZodNumber;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    nuevaAulaId: number;
    observaciones?: string | null | undefined;
}, {
    nuevaAulaId: number;
    observaciones?: string | null | undefined;
}>;
export declare const queryActividadesAulasSchema: z.ZodObject<{
    actividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    aulaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    activa: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    incluirRelaciones: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    incluirRelaciones: boolean;
    actividadId?: number | undefined;
    activa?: boolean | undefined;
    aulaId?: number | undefined;
}, {
    page?: unknown;
    limit?: unknown;
    actividadId?: unknown;
    activa?: unknown;
    aulaId?: unknown;
    incluirRelaciones?: unknown;
}>;
export declare const desasignarAulaSchema: z.ZodObject<{
    fechaDesasignacion: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | undefined;
}, {
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | undefined;
}>;
export declare const verificarDisponibilidadSchema: z.ZodObject<{
    actividadId: z.ZodNumber;
    aulaId: z.ZodNumber;
    excluirAsignacionId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    actividadId: number;
    aulaId: number;
    excluirAsignacionId?: number | undefined;
}, {
    actividadId: number;
    aulaId: number;
    excluirAsignacionId?: number | undefined;
}>;
export type CreateActividadAulaDto = z.infer<typeof createActividadAulaSchema>;
export type UpdateActividadAulaDto = z.infer<typeof updateActividadAulaSchema>;
export type AsignarMultiplesAulasDto = z.infer<typeof asignarMultiplesAulasSchema>;
export type CambiarAulaDto = z.infer<typeof cambiarAulaSchema>;
export type QueryActividadesAulasDto = z.infer<typeof queryActividadesAulasSchema>;
export type DesasignarAulaDto = z.infer<typeof desasignarAulaSchema>;
export type VerificarDisponibilidadDto = z.infer<typeof verificarDisponibilidadSchema>;
export interface ConflictoHorario {
    tipo: 'ACTIVIDAD' | 'RESERVA' | 'SECCION';
    id: number;
    nombre: string;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
    aulaId: number;
    aulaNombre: string;
}
export interface DisponibilidadResponse {
    disponible: boolean;
    conflictos?: ConflictoHorario[];
    capacidadSuficiente?: boolean;
    participantesActuales?: number;
    capacidadAula?: number;
    observaciones?: string[];
}
//# sourceMappingURL=actividad-aula.dto.d.ts.map