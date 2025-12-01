import { z } from 'zod';
export declare const createTipoAulaSchema: z.ZodObject<{
    codigo: z.ZodString;
    nombre: z.ZodString;
    descripcion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    activo: z.ZodDefault<z.ZodBoolean>;
    orden: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    nombre: string;
    codigo: string;
    orden: number;
    descripcion?: string | null | undefined;
}, {
    nombre: string;
    codigo: string;
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
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    codigo?: string | undefined;
    orden?: number | undefined;
}, {
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    codigo?: string | undefined;
    orden?: number | undefined;
}>;
export type CreateTipoAulaDto = z.infer<typeof createTipoAulaSchema>;
export type UpdateTipoAulaDto = z.infer<typeof updateTipoAulaSchema>;
export declare const reorderTipoAulaSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export type ReorderTipoAulaDto = z.infer<typeof reorderTipoAulaSchema>;
//# sourceMappingURL=tipos-aula.dto.d.ts.map