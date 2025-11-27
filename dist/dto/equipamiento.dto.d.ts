import { z } from 'zod';
export declare const createEquipamientoSchema: z.ZodObject<{
    codigo: z.ZodOptional<z.ZodString>;
    nombre: z.ZodString;
    categoriaEquipamientoId: z.ZodEffects<z.ZodNumber, number, unknown>;
    descripcion: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodOptional<z.ZodString>;
    activo: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    nombre: string;
    categoriaEquipamientoId: number;
    observaciones?: string | undefined;
    descripcion?: string | undefined;
    codigo?: string | undefined;
}, {
    nombre: string;
    observaciones?: string | undefined;
    activo?: unknown;
    descripcion?: string | undefined;
    codigo?: string | undefined;
    categoriaEquipamientoId?: unknown;
}>;
export declare const updateEquipamientoSchema: z.ZodEffects<z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    categoriaEquipamientoId: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, unknown>>;
    descripcion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    observaciones: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    activo: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | undefined;
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    categoriaEquipamientoId?: number | undefined;
}, {
    observaciones?: string | undefined;
    activo?: unknown;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    categoriaEquipamientoId?: unknown;
}>, {
    observaciones?: string | undefined;
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    categoriaEquipamientoId?: number | undefined;
}, {
    observaciones?: string | undefined;
    activo?: unknown;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    categoriaEquipamientoId?: unknown;
}>;
export declare const equipamientoQuerySchema: z.ZodObject<{
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
export declare const asignarEquipamientoAulaSchema: z.ZodObject<{
    equipamientoId: z.ZodEffects<z.ZodNumber, number, unknown>;
    cantidad: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    equipamientoId: number;
    cantidad: number;
    observaciones?: string | undefined;
}, {
    observaciones?: string | undefined;
    equipamientoId?: unknown;
    cantidad?: unknown;
}>;
export declare const actualizarCantidadEquipamientoSchema: z.ZodObject<{
    cantidad: z.ZodEffects<z.ZodNumber, number, unknown>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cantidad: number;
    observaciones?: string | undefined;
}, {
    observaciones?: string | undefined;
    cantidad?: unknown;
}>;
export declare const equipamientosAulaQuerySchema: z.ZodObject<{
    incluirInactivos: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
}, "strip", z.ZodTypeAny, {
    incluirInactivos: boolean;
}, {
    incluirInactivos?: unknown;
}>;
export type CreateEquipamientoDto = z.infer<typeof createEquipamientoSchema>;
export type UpdateEquipamientoDto = z.infer<typeof updateEquipamientoSchema>;
export type EquipamientoQueryDto = z.infer<typeof equipamientoQuerySchema>;
export type AsignarEquipamientoAulaDto = z.infer<typeof asignarEquipamientoAulaSchema>;
export type ActualizarCantidadEquipamientoDto = z.infer<typeof actualizarCantidadEquipamientoSchema>;
export type EquipamientosAulaQueryDto = z.infer<typeof equipamientosAulaQuerySchema>;
//# sourceMappingURL=equipamiento.dto.d.ts.map