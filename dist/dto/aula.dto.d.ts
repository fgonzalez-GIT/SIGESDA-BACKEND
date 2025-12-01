import { z } from 'zod';
export declare const createAulaSchema: z.ZodEffects<z.ZodObject<{
    nombre: z.ZodString;
    capacidad: z.ZodEffects<z.ZodNumber, number, unknown>;
    ubicacion: z.ZodOptional<z.ZodString>;
    tipoAulaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    estadoAulaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    descripcion: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodOptional<z.ZodString>;
    activa: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    equipamientos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        equipamientoId: z.ZodNumber;
        cantidad: z.ZodDefault<z.ZodNumber>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        equipamientoId: number;
        cantidad: number;
        observaciones?: string | undefined;
    }, {
        equipamientoId: number;
        observaciones?: string | undefined;
        cantidad?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    activa: boolean;
    capacidad: number;
    observaciones?: string | undefined;
    descripcion?: string | undefined;
    ubicacion?: string | undefined;
    tipoAulaId?: number | undefined;
    estadoAulaId?: number | undefined;
    equipamientos?: {
        equipamientoId: number;
        cantidad: number;
        observaciones?: string | undefined;
    }[] | undefined;
}, {
    nombre: string;
    observaciones?: string | undefined;
    descripcion?: string | undefined;
    activa?: unknown;
    capacidad?: unknown;
    ubicacion?: string | undefined;
    tipoAulaId?: unknown;
    estadoAulaId?: unknown;
    equipamientos?: {
        equipamientoId: number;
        observaciones?: string | undefined;
        cantidad?: number | undefined;
    }[] | undefined;
}>, {
    nombre: string;
    activa: boolean;
    capacidad: number;
    observaciones?: string | undefined;
    descripcion?: string | undefined;
    ubicacion?: string | undefined;
    tipoAulaId?: number | undefined;
    estadoAulaId?: number | undefined;
    equipamientos?: {
        equipamientoId: number;
        cantidad: number;
        observaciones?: string | undefined;
    }[] | undefined;
}, unknown>;
export declare const updateAulaSchema: z.ZodEffects<z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    capacidad: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    ubicacion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tipoAulaId: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>>;
    estadoAulaId: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>>;
    descripcion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    observaciones: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    activa: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>>;
    equipamientos: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        equipamientoId: z.ZodNumber;
        cantidad: z.ZodDefault<z.ZodNumber>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        equipamientoId: number;
        cantidad: number;
        observaciones?: string | undefined;
    }, {
        equipamientoId: number;
        observaciones?: string | undefined;
        cantidad?: number | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    activa?: boolean | undefined;
    capacidad?: number | undefined;
    ubicacion?: string | undefined;
    tipoAulaId?: number | undefined;
    estadoAulaId?: number | undefined;
    equipamientos?: {
        equipamientoId: number;
        cantidad: number;
        observaciones?: string | undefined;
    }[] | undefined;
}, {
    observaciones?: string | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    activa?: unknown;
    capacidad?: unknown;
    ubicacion?: string | undefined;
    tipoAulaId?: unknown;
    estadoAulaId?: unknown;
    equipamientos?: {
        equipamientoId: number;
        observaciones?: string | undefined;
        cantidad?: number | undefined;
    }[] | undefined;
}>, {
    observaciones?: string | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    activa?: boolean | undefined;
    capacidad?: number | undefined;
    ubicacion?: string | undefined;
    tipoAulaId?: number | undefined;
    estadoAulaId?: number | undefined;
    equipamientos?: {
        equipamientoId: number;
        cantidad: number;
        observaciones?: string | undefined;
    }[] | undefined;
}, unknown>;
export declare const aulaQuerySchema: z.ZodObject<{
    activa: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    tipoAulaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    estadoAulaId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    capacidadMinima: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    capacidadMaxima: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    conEquipamiento: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    activa?: boolean | undefined;
    capacidadMaxima?: number | undefined;
    tipoAulaId?: number | undefined;
    estadoAulaId?: number | undefined;
    capacidadMinima?: number | undefined;
    conEquipamiento?: boolean | undefined;
}, {
    search?: string | undefined;
    page?: unknown;
    limit?: unknown;
    activa?: unknown;
    capacidadMaxima?: unknown;
    tipoAulaId?: unknown;
    estadoAulaId?: unknown;
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