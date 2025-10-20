import { z } from 'zod';
export declare const createDocenteActividadSchema: z.ZodEffects<z.ZodObject<{
    actividadId: z.ZodNumber;
    docenteId: z.ZodString;
    rolDocenteId: z.ZodNumber;
    fechaAsignacion: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    fechaDesasignacion: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    activo: z.ZodDefault<z.ZodBoolean>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    docenteId: string;
    rolDocenteId: number;
    actividadId: number;
    observaciones?: string | null | undefined;
    fechaAsignacion?: string | Date | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
}, {
    docenteId: string;
    rolDocenteId: number;
    actividadId: number;
    observaciones?: string | null | undefined;
    activo?: boolean | undefined;
    fechaAsignacion?: string | Date | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
}>, {
    activo: boolean;
    docenteId: string;
    rolDocenteId: number;
    actividadId: number;
    observaciones?: string | null | undefined;
    fechaAsignacion?: string | Date | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
}, {
    docenteId: string;
    rolDocenteId: number;
    actividadId: number;
    observaciones?: string | null | undefined;
    activo?: boolean | undefined;
    fechaAsignacion?: string | Date | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
}>;
export declare const updateDocenteActividadSchema: z.ZodObject<{
    rolDocenteId: z.ZodOptional<z.ZodNumber>;
    fechaDesasignacion: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    activo: z.ZodOptional<z.ZodBoolean>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    activo?: boolean | undefined;
    rolDocenteId?: number | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
}, {
    observaciones?: string | null | undefined;
    activo?: boolean | undefined;
    rolDocenteId?: number | undefined;
    fechaDesasignacion?: string | Date | null | undefined;
}>;
export declare const asignarMultiplesDocentesSchema: z.ZodObject<{
    actividadId: z.ZodNumber;
    docentes: z.ZodArray<z.ZodObject<{
        docenteId: z.ZodString;
        rolDocenteId: z.ZodNumber;
        observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        docenteId: string;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }, {
        docenteId: string;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    docentes: {
        docenteId: string;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }[];
    actividadId: number;
}, {
    docentes: {
        docenteId: string;
        rolDocenteId: number;
        observaciones?: string | null | undefined;
    }[];
    actividadId: number;
}>;
export declare const cambiarRolDocenteSchema: z.ZodObject<{
    nuevoRolDocenteId: z.ZodNumber;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    nuevoRolDocenteId: number;
    observaciones?: string | null | undefined;
}, {
    nuevoRolDocenteId: number;
    observaciones?: string | null | undefined;
}>;
export declare const queryDocentesActividadesSchema: z.ZodObject<{
    actividadId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    docenteId: z.ZodOptional<z.ZodString>;
    rolDocenteId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    activo: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    incluirRelaciones: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    incluirRelaciones: boolean;
    activo?: boolean | undefined;
    docenteId?: string | undefined;
    rolDocenteId?: number | undefined;
    actividadId?: number | undefined;
}, {
    activo?: unknown;
    page?: unknown;
    limit?: unknown;
    docenteId?: string | undefined;
    rolDocenteId?: unknown;
    incluirRelaciones?: unknown;
    actividadId?: unknown;
}>;
export declare const desasignarDocenteSchema: z.ZodObject<{
    fechaDesasignacion: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | undefined;
}, {
    observaciones?: string | null | undefined;
    fechaDesasignacion?: string | Date | undefined;
}>;
export type CreateDocenteActividadDto = z.infer<typeof createDocenteActividadSchema>;
export type UpdateDocenteActividadDto = z.infer<typeof updateDocenteActividadSchema>;
export type AsignarMultiplesDocentesDto = z.infer<typeof asignarMultiplesDocentesSchema>;
export type CambiarRolDocenteDto = z.infer<typeof cambiarRolDocenteSchema>;
export type QueryDocentesActividadesDto = z.infer<typeof queryDocentesActividadesSchema>;
export type DesasignarDocenteDto = z.infer<typeof desasignarDocenteSchema>;
//# sourceMappingURL=docente-actividad.dto.d.ts.map