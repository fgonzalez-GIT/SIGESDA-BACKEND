import { z } from 'zod';
export declare const createTipoActividadSchema: z.ZodObject<{
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
export declare const updateTipoActividadSchema: z.ZodObject<{
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
export type CreateTipoActividadDto = z.infer<typeof createTipoActividadSchema>;
export type UpdateTipoActividadDto = z.infer<typeof updateTipoActividadSchema>;
export declare const createCategoriaActividadSchema: z.ZodObject<{
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
export declare const updateCategoriaActividadSchema: z.ZodObject<{
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
export type CreateCategoriaActividadDto = z.infer<typeof createCategoriaActividadSchema>;
export type UpdateCategoriaActividadDto = z.infer<typeof updateCategoriaActividadSchema>;
export declare const createEstadoActividadSchema: z.ZodObject<{
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
export declare const updateEstadoActividadSchema: z.ZodObject<{
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
export type CreateEstadoActividadDto = z.infer<typeof createEstadoActividadSchema>;
export type UpdateEstadoActividadDto = z.infer<typeof updateEstadoActividadSchema>;
export declare const diaSemanaSchema: z.ZodObject<{
    id: z.ZodNumber;
    codigo: z.ZodString;
    nombre: z.ZodString;
    orden: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    codigo: string;
    nombre: string;
    orden: number;
    id: number;
}, {
    codigo: string;
    nombre: string;
    orden: number;
    id: number;
}>;
export type DiaSemanaDto = z.infer<typeof diaSemanaSchema>;
export declare const createRolDocenteSchema: z.ZodObject<{
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
export declare const updateRolDocenteSchema: z.ZodObject<{
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
export type CreateRolDocenteDto = z.infer<typeof createRolDocenteSchema>;
export type UpdateRolDocenteDto = z.infer<typeof updateRolDocenteSchema>;
export declare const queryCatalogosSchema: z.ZodObject<{
    activo: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    activo?: boolean | undefined;
}, {
    search?: string | undefined;
    activo?: unknown;
    page?: unknown;
    limit?: unknown;
}>;
export type QueryCatalogosDto = z.infer<typeof queryCatalogosSchema>;
export declare const queryTiposCatalogoSchema: z.ZodObject<{
    includeInactive: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    search: z.ZodOptional<z.ZodString>;
    orderBy: z.ZodDefault<z.ZodEnum<["codigo", "nombre", "orden", "created_at"]>>;
    orderDir: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    orderBy: "codigo" | "nombre" | "orden" | "created_at";
    orderDir: "asc" | "desc";
    includeInactive: boolean;
    search?: string | undefined;
}, {
    orderBy?: "codigo" | "nombre" | "orden" | "created_at" | undefined;
    search?: string | undefined;
    orderDir?: "asc" | "desc" | undefined;
    includeInactive?: unknown;
}>;
export type QueryTiposCatalogoDto = z.infer<typeof queryTiposCatalogoSchema>;
export declare const reorderCatalogoSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export type ReorderCatalogoDto = z.infer<typeof reorderCatalogoSchema>;
//# sourceMappingURL=catalogos-actividades.dto.d.ts.map