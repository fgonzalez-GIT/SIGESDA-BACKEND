import { z } from 'zod';
export declare const createEstadoEquipamientoSchema: z.ZodObject<{
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
export declare const updateEstadoEquipamientoSchema: z.ZodObject<{
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
export type CreateEstadoEquipamientoDto = z.infer<typeof createEstadoEquipamientoSchema>;
export type UpdateEstadoEquipamientoDto = z.infer<typeof updateEstadoEquipamientoSchema>;
export declare const reorderEstadoEquipamientoSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export type ReorderEstadoEquipamientoDto = z.infer<typeof reorderEstadoEquipamientoSchema>;
//# sourceMappingURL=estados-equipamiento.dto.d.ts.map