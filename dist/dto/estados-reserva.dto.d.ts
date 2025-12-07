import { z } from 'zod';
export declare const createEstadoReservaSchema: z.ZodObject<{
    codigo: z.ZodString;
    nombre: z.ZodString;
    descripcion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    activo: z.ZodDefault<z.ZodBoolean>;
    orden: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    codigo: string;
    nombre: string;
    orden: number;
    descripcion?: string | null | undefined;
}, {
    codigo: string;
    nombre: string;
    activo?: boolean | undefined;
    descripcion?: string | null | undefined;
    orden?: number | undefined;
}>;
export declare const updateEstadoReservaSchema: z.ZodObject<{
    codigo: z.ZodOptional<z.ZodString>;
    nombre: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    activo: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    orden: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    activo?: boolean | undefined;
    codigo?: string | undefined;
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    orden?: number | undefined;
}, {
    activo?: boolean | undefined;
    codigo?: string | undefined;
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    orden?: number | undefined;
}>;
export type CreateEstadoReservaDto = z.infer<typeof createEstadoReservaSchema>;
export type UpdateEstadoReservaDto = z.infer<typeof updateEstadoReservaSchema>;
export declare const queryEstadosReservasSchema: z.ZodObject<{
    activo: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    includeInactive: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    orderBy: z.ZodDefault<z.ZodEnum<["codigo", "nombre", "orden", "created_at"]>>;
    orderDir: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    orderBy: "codigo" | "nombre" | "orden" | "created_at";
    page: number;
    limit: number;
    orderDir: "asc" | "desc";
    includeInactive: boolean;
    search?: string | undefined;
    activo?: boolean | undefined;
}, {
    orderBy?: "codigo" | "nombre" | "orden" | "created_at" | undefined;
    search?: string | undefined;
    activo?: unknown;
    page?: unknown;
    limit?: unknown;
    orderDir?: "asc" | "desc" | undefined;
    includeInactive?: unknown;
}>;
export type QueryEstadosReservasDto = z.infer<typeof queryEstadosReservasSchema>;
export declare const reorderEstadosReservasSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export type ReorderEstadosReservasDto = z.infer<typeof reorderEstadosReservasSchema>;
//# sourceMappingURL=estados-reserva.dto.d.ts.map