import { z } from 'zod';
export declare const createEstadoAulaSchema: z.ZodObject<{
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
export declare const updateEstadoAulaSchema: z.ZodObject<{
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
export type CreateEstadoAulaDto = z.infer<typeof createEstadoAulaSchema>;
export type UpdateEstadoAulaDto = z.infer<typeof updateEstadoAulaSchema>;
export declare const reorderEstadoAulaSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export type ReorderEstadoAulaDto = z.infer<typeof reorderEstadoAulaSchema>;
//# sourceMappingURL=estados-aula.dto.d.ts.map