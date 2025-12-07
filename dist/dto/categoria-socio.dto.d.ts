import { z } from 'zod';
export declare const createCategoriaSocioSchema: z.ZodObject<{
    codigo: z.ZodEffects<z.ZodString, string, string>;
    nombre: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    montoCuota: z.ZodNumber;
    descuento: z.ZodDefault<z.ZodNumber>;
    activa: z.ZodDefault<z.ZodBoolean>;
    orden: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    codigo: string;
    nombre: string;
    orden: number;
    descuento: number;
    activa: boolean;
    montoCuota: number;
    descripcion?: string | undefined;
}, {
    codigo: string;
    nombre: string;
    montoCuota: number;
    descripcion?: string | undefined;
    orden?: number | undefined;
    descuento?: number | undefined;
    activa?: boolean | undefined;
}>;
export type CreateCategoriaSocioDto = z.infer<typeof createCategoriaSocioSchema>;
export declare const updateCategoriaSocioSchema: z.ZodObject<{
    codigo: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    nombre: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodOptional<z.ZodString>;
    montoCuota: z.ZodOptional<z.ZodNumber>;
    descuento: z.ZodOptional<z.ZodNumber>;
    activa: z.ZodOptional<z.ZodBoolean>;
    orden: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    codigo?: string | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    orden?: number | undefined;
    descuento?: number | undefined;
    activa?: boolean | undefined;
    montoCuota?: number | undefined;
}, {
    codigo?: string | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    orden?: number | undefined;
    descuento?: number | undefined;
    activa?: boolean | undefined;
    montoCuota?: number | undefined;
}>;
export type UpdateCategoriaSocioDto = z.infer<typeof updateCategoriaSocioSchema>;
export declare const categoriaSocioQuerySchema: z.ZodObject<{
    includeInactive: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    includeInactive?: boolean | undefined;
}, {
    search?: string | undefined;
    includeInactive?: unknown;
}>;
export type CategoriaSocioQueryDto = z.infer<typeof categoriaSocioQuerySchema>;
//# sourceMappingURL=categoria-socio.dto.d.ts.map