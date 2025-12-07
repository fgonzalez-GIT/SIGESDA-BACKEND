import { z } from 'zod';
export declare const createContactoPersonaSchema: z.ZodObject<{
    tipoContactoId: z.ZodNumber;
    valor: z.ZodString;
    principal: z.ZodDefault<z.ZodBoolean>;
    observaciones: z.ZodOptional<z.ZodString>;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    tipoContactoId: number;
    valor: string;
    principal: boolean;
    observaciones?: string | undefined;
}, {
    tipoContactoId: number;
    valor: string;
    observaciones?: string | undefined;
    activo?: boolean | undefined;
    principal?: boolean | undefined;
}>;
export declare const updateContactoPersonaSchema: z.ZodObject<{
    tipoContactoId: z.ZodOptional<z.ZodNumber>;
    valor: z.ZodOptional<z.ZodString>;
    principal: z.ZodOptional<z.ZodBoolean>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    activo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    activo?: boolean | undefined;
    tipoContactoId?: number | undefined;
    valor?: string | undefined;
    principal?: boolean | undefined;
}, {
    observaciones?: string | null | undefined;
    activo?: boolean | undefined;
    tipoContactoId?: number | undefined;
    valor?: string | undefined;
    principal?: boolean | undefined;
}>;
export declare const createTipoContactoSchema: z.ZodObject<{
    codigo: z.ZodString;
    nombre: z.ZodString;
    descripcion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    icono: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pattern: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, string | null | undefined, string | null | undefined>;
    activo: z.ZodDefault<z.ZodBoolean>;
    orden: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    codigo: string;
    nombre: string;
    orden: number;
    descripcion?: string | null | undefined;
    icono?: string | null | undefined;
    pattern?: string | null | undefined;
}, {
    codigo: string;
    nombre: string;
    activo?: boolean | undefined;
    descripcion?: string | null | undefined;
    icono?: string | null | undefined;
    pattern?: string | null | undefined;
    orden?: number | undefined;
}>;
export declare const updateTipoContactoSchema: z.ZodObject<{
    codigo: z.ZodOptional<z.ZodString>;
    nombre: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    icono: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    pattern: z.ZodOptional<z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, string | null | undefined, string | null | undefined>>;
    activo: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    orden: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    activo?: boolean | undefined;
    codigo?: string | undefined;
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    icono?: string | null | undefined;
    pattern?: string | null | undefined;
    orden?: number | undefined;
}, {
    activo?: boolean | undefined;
    codigo?: string | undefined;
    nombre?: string | undefined;
    descripcion?: string | null | undefined;
    icono?: string | null | undefined;
    pattern?: string | null | undefined;
    orden?: number | undefined;
}>;
export declare const getTiposContactoSchema: z.ZodObject<{
    soloActivos: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    ordenarPor: z.ZodOptional<z.ZodDefault<z.ZodEnum<["orden", "nombre", "codigo"]>>>;
}, "strip", z.ZodTypeAny, {
    soloActivos?: boolean | undefined;
    ordenarPor?: "codigo" | "nombre" | "orden" | undefined;
}, {
    soloActivos?: boolean | undefined;
    ordenarPor?: "codigo" | "nombre" | "orden" | undefined;
}>;
export type CreateContactoPersonaDto = z.infer<typeof createContactoPersonaSchema>;
export type UpdateContactoPersonaDto = z.infer<typeof updateContactoPersonaSchema>;
export type CreateTipoContactoDto = z.infer<typeof createTipoContactoSchema>;
export type UpdateTipoContactoDto = z.infer<typeof updateTipoContactoSchema>;
export type GetTiposContactoDto = z.infer<typeof getTiposContactoSchema>;
//# sourceMappingURL=contacto.dto.d.ts.map