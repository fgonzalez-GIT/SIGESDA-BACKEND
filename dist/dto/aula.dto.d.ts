import { z } from 'zod';
export declare const createAulaSchema: z.ZodObject<{
    nombre: z.ZodString;
    capacidad: z.ZodEffects<z.ZodNumber, number, unknown>;
    ubicacion: z.ZodOptional<z.ZodString>;
    equipamiento: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    activa: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    tipo: z.ZodOptional<z.ZodString>;
    estado: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    activa: boolean;
    capacidad: number;
    tipo?: string | undefined;
    estado?: string | undefined;
    observaciones?: string | undefined;
    descripcion?: string | undefined;
    ubicacion?: string | undefined;
    equipamiento?: string | undefined;
}, {
    nombre: string;
    tipo?: string | undefined;
    activa?: unknown;
    estado?: string | undefined;
    observaciones?: string | undefined;
    descripcion?: string | undefined;
    capacidad?: unknown;
    ubicacion?: string | undefined;
    equipamiento?: unknown;
}>;
export declare const updateAulaSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    capacidad: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    ubicacion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    equipamiento: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>>;
    activa: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>>;
    tipo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    estado: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    observaciones: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    descripcion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    tipo?: string | undefined;
    nombre?: string | undefined;
    activa?: boolean | undefined;
    estado?: string | undefined;
    observaciones?: string | undefined;
    descripcion?: string | undefined;
    capacidad?: number | undefined;
    ubicacion?: string | undefined;
    equipamiento?: string | undefined;
}, {
    tipo?: string | undefined;
    nombre?: string | undefined;
    activa?: unknown;
    estado?: string | undefined;
    observaciones?: string | undefined;
    descripcion?: string | undefined;
    capacidad?: unknown;
    ubicacion?: string | undefined;
    equipamiento?: unknown;
}>;
export declare const aulaQuerySchema: z.ZodObject<{
    activa: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    capacidadMinima: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    capacidadMaxima: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    conEquipamiento: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    activa?: boolean | undefined;
    search?: string | undefined;
    capacidadMaxima?: number | undefined;
    capacidadMinima?: number | undefined;
    conEquipamiento?: boolean | undefined;
}, {
    activa?: unknown;
    search?: string | undefined;
    page?: unknown;
    limit?: unknown;
    capacidadMaxima?: unknown;
    capacidadMinima?: unknown;
    conEquipamiento?: unknown;
}>;
export declare const disponibilidadAulaSchema: z.ZodEffects<z.ZodObject<{
    fechaInicio: z.ZodString;
    fechaFin: z.ZodString;
    excluirReservaId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fechaInicio: string;
    fechaFin: string;
    excluirReservaId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    excluirReservaId?: string | undefined;
}>, {
    fechaInicio: string;
    fechaFin: string;
    excluirReservaId?: string | undefined;
}, {
    fechaInicio: string;
    fechaFin: string;
    excluirReservaId?: string | undefined;
}>;
export declare const estadisticasAulaSchema: z.ZodObject<{
    incluirReservas: z.ZodDefault<z.ZodBoolean>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    incluirReservas: boolean;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    incluirReservas?: boolean | undefined;
}>;
export type CreateAulaDto = z.infer<typeof createAulaSchema>;
export type UpdateAulaDto = z.infer<typeof updateAulaSchema>;
export type AulaQueryDto = z.infer<typeof aulaQuerySchema>;
export type DisponibilidadAulaDto = z.infer<typeof disponibilidadAulaSchema>;
export type EstadisticasAulaDto = z.infer<typeof estadisticasAulaSchema>;
//# sourceMappingURL=aula.dto.d.ts.map