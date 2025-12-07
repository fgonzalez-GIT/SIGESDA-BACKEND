import { z } from 'zod';
export declare const createTipoAulaSchema: z.ZodObject<{
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
export declare const updateTipoAulaSchema: z.ZodObject<{
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
export type CreateTipoAulaDto = z.infer<typeof createTipoAulaSchema>;
export type UpdateTipoAulaDto = z.infer<typeof updateTipoAulaSchema>;
export declare const createEstadoAulaSchema: z.ZodObject<{
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
export declare const updateEstadoAulaSchema: z.ZodObject<{
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
export type CreateEstadoAulaDto = z.infer<typeof createEstadoAulaSchema>;
export type UpdateEstadoAulaDto = z.infer<typeof updateEstadoAulaSchema>;
export declare const queryCatalogosAulasSchema: z.ZodObject<{
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
export type QueryCatalogosAulasDto = z.infer<typeof queryCatalogosAulasSchema>;
export declare const queryTiposAulasCatalogoSchema: z.ZodObject<{
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
export type QueryTiposAulasCatalogoDto = z.infer<typeof queryTiposAulasCatalogoSchema>;
export declare const reorderCatalogoAulasSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export type ReorderCatalogoAulasDto = z.infer<typeof reorderCatalogoAulasSchema>;
//# sourceMappingURL=catalogos-aulas.dto.d.ts.map