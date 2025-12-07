import { z } from 'zod';
export declare const createCategoriaEquipamientoSchema: z.ZodObject<{
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
export declare const updateCategoriaEquipamientoSchema: z.ZodObject<{
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
export type CreateCategoriaEquipamientoDto = z.infer<typeof createCategoriaEquipamientoSchema>;
export type UpdateCategoriaEquipamientoDto = z.infer<typeof updateCategoriaEquipamientoSchema>;
export declare const reorderCategoriaEquipamientoSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export type ReorderCategoriaEquipamientoDto = z.infer<typeof reorderCategoriaEquipamientoSchema>;
//# sourceMappingURL=categorias-equipamiento.dto.d.ts.map