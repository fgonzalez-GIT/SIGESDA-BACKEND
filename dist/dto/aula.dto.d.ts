import { z } from 'zod';
export declare const createAulaSchema: z.ZodObject<{
    nombre: z.ZodString;
    capacidad: z.ZodNumber;
    ubicacion: z.ZodOptional<z.ZodString>;
    equipamiento: z.ZodOptional<z.ZodString>;
    activa: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    activa: boolean;
    capacidad: number;
    ubicacion?: string | undefined;
    equipamiento?: string | undefined;
}, {
    nombre: string;
    capacidad: number;
    activa?: boolean | undefined;
    ubicacion?: string | undefined;
    equipamiento?: string | undefined;
}>;
export declare const updateAulaSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    capacidad: z.ZodOptional<z.ZodNumber>;
    ubicacion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    equipamiento: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    activa: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    nombre?: string | undefined;
    activa?: boolean | undefined;
    capacidad?: number | undefined;
    ubicacion?: string | undefined;
    equipamiento?: string | undefined;
}, {
    nombre?: string | undefined;
    activa?: boolean | undefined;
    capacidad?: number | undefined;
    ubicacion?: string | undefined;
    equipamiento?: string | undefined;
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