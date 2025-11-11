import { z } from 'zod';
export declare const createTipoPersonaSchema: z.ZodObject<{
    codigo: z.ZodString;
    nombre: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    activo: z.ZodDefault<z.ZodBoolean>;
    orden: z.ZodDefault<z.ZodNumber>;
    requiereCategoriaId: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    requiereEspecialidadId: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    requiereCuit: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    requiereRazonSocial: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    nombre: string;
    codigo: string;
    orden: number;
    descripcion?: string | undefined;
    requiereCategoriaId?: boolean | undefined;
    requiereEspecialidadId?: boolean | undefined;
    requiereCuit?: boolean | undefined;
    requiereRazonSocial?: boolean | undefined;
}, {
    nombre: string;
    codigo: string;
    activo?: boolean | undefined;
    descripcion?: string | undefined;
    orden?: number | undefined;
    requiereCategoriaId?: boolean | undefined;
    requiereEspecialidadId?: boolean | undefined;
    requiereCuit?: boolean | undefined;
    requiereRazonSocial?: boolean | undefined;
}>;
export declare const updateTipoPersonaSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    activo: z.ZodOptional<z.ZodBoolean>;
    orden: z.ZodOptional<z.ZodNumber>;
    requiereCategoriaId: z.ZodOptional<z.ZodBoolean>;
    requiereEspecialidadId: z.ZodOptional<z.ZodBoolean>;
    requiereCuit: z.ZodOptional<z.ZodBoolean>;
    requiereRazonSocial: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    orden?: number | undefined;
    requiereCategoriaId?: boolean | undefined;
    requiereEspecialidadId?: boolean | undefined;
    requiereCuit?: boolean | undefined;
    requiereRazonSocial?: boolean | undefined;
}, {
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    orden?: number | undefined;
    requiereCategoriaId?: boolean | undefined;
    requiereEspecialidadId?: boolean | undefined;
    requiereCuit?: boolean | undefined;
    requiereRazonSocial?: boolean | undefined;
}>;
export declare const toggleActivoSchema: z.ZodObject<{
    activo: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
}, {
    activo: boolean;
}>;
export declare const createEspecialidadSchema: z.ZodObject<{
    codigo: z.ZodString;
    nombre: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    activo: z.ZodDefault<z.ZodBoolean>;
    orden: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    nombre: string;
    codigo: string;
    orden: number;
    descripcion?: string | undefined;
}, {
    nombre: string;
    codigo: string;
    activo?: boolean | undefined;
    descripcion?: string | undefined;
    orden?: number | undefined;
}>;
export declare const updateEspecialidadSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    activo: z.ZodOptional<z.ZodBoolean>;
    orden: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    orden?: number | undefined;
}, {
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    orden?: number | undefined;
}>;
export type CreateTipoPersonaDto = z.infer<typeof createTipoPersonaSchema>;
export type UpdateTipoPersonaDto = z.infer<typeof updateTipoPersonaSchema>;
export type ToggleActivoDto = z.infer<typeof toggleActivoSchema>;
export type CreateEspecialidadDto = z.infer<typeof createEspecialidadSchema>;
export type UpdateEspecialidadDto = z.infer<typeof updateEspecialidadSchema>;
export declare const TIPOS_SISTEMA_PROTEGIDOS: readonly ["NO_SOCIO", "SOCIO", "DOCENTE", "PROVEEDOR"];
export declare const ESPECIALIDADES_SISTEMA_PROTEGIDAS: readonly ["GENERAL"];
//# sourceMappingURL=catalogo.dto.d.ts.map