import { z } from 'zod';
export declare const createPersonaTipoSchema: z.ZodEffects<z.ZodObject<{
    tipoPersonaId: z.ZodOptional<z.ZodNumber>;
    tipoPersonaCodigo: z.ZodOptional<z.ZodEnum<["NO_SOCIO", "SOCIO", "DOCENTE", "PROVEEDOR"]>>;
    categoriaId: z.ZodOptional<z.ZodNumber>;
    numeroSocio: z.ZodOptional<z.ZodNumber>;
    fechaIngreso: z.ZodOptional<z.ZodString>;
    especialidadId: z.ZodOptional<z.ZodNumber>;
    honorariosPorHora: z.ZodOptional<z.ZodNumber>;
    cuit: z.ZodOptional<z.ZodString>;
    razonSocial: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodOptional<z.ZodString>;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocial?: string | undefined;
    categoriaId?: number | undefined;
    observaciones?: string | undefined;
    tipoPersonaId?: number | undefined;
    tipoPersonaCodigo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    especialidadId?: number | undefined;
}, {
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocial?: string | undefined;
    categoriaId?: number | undefined;
    activo?: boolean | undefined;
    observaciones?: string | undefined;
    tipoPersonaId?: number | undefined;
    tipoPersonaCodigo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    especialidadId?: number | undefined;
}>, {
    activo: boolean;
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocial?: string | undefined;
    categoriaId?: number | undefined;
    observaciones?: string | undefined;
    tipoPersonaId?: number | undefined;
    tipoPersonaCodigo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    especialidadId?: number | undefined;
}, {
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocial?: string | undefined;
    categoriaId?: number | undefined;
    activo?: boolean | undefined;
    observaciones?: string | undefined;
    tipoPersonaId?: number | undefined;
    tipoPersonaCodigo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    especialidadId?: number | undefined;
}>;
export declare const updatePersonaTipoSchema: z.ZodObject<{
    activo: z.ZodOptional<z.ZodBoolean>;
    fechaDesasignacion: z.ZodOptional<z.ZodString>;
    categoriaId: z.ZodOptional<z.ZodNumber>;
    fechaIngreso: z.ZodOptional<z.ZodString>;
    fechaBaja: z.ZodOptional<z.ZodString>;
    motivoBaja: z.ZodOptional<z.ZodString>;
    especialidadId: z.ZodOptional<z.ZodNumber>;
    honorariosPorHora: z.ZodOptional<z.ZodNumber>;
    cuit: z.ZodOptional<z.ZodString>;
    razonSocial: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fechaIngreso?: string | undefined;
    fechaBaja?: string | undefined;
    motivoBaja?: string | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocial?: string | undefined;
    categoriaId?: number | undefined;
    activo?: boolean | undefined;
    observaciones?: string | undefined;
    especialidadId?: number | undefined;
    fechaDesasignacion?: string | undefined;
}, {
    fechaIngreso?: string | undefined;
    fechaBaja?: string | undefined;
    motivoBaja?: string | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocial?: string | undefined;
    categoriaId?: number | undefined;
    activo?: boolean | undefined;
    observaciones?: string | undefined;
    especialidadId?: number | undefined;
    fechaDesasignacion?: string | undefined;
}>;
export declare const createContactoPersonaSchema: z.ZodObject<{
    tipoContacto: z.ZodNativeEnum<any>;
    valor: z.ZodString;
    principal: z.ZodDefault<z.ZodBoolean>;
    observaciones: z.ZodOptional<z.ZodString>;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    tipoContacto?: unknown;
    valor?: unknown;
    principal?: unknown;
    observaciones?: unknown;
    activo?: unknown;
}, {
    [x: string]: any;
    tipoContacto?: unknown;
    valor?: unknown;
    principal?: unknown;
    observaciones?: unknown;
    activo?: unknown;
}>;
export declare const updateContactoPersonaSchema: z.ZodObject<{
    tipoContacto: z.ZodOptional<z.ZodNativeEnum<any>>;
    valor: z.ZodOptional<z.ZodString>;
    principal: z.ZodOptional<z.ZodBoolean>;
    observaciones: z.ZodOptional<z.ZodString>;
    activo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    tipoContacto?: unknown;
    valor?: unknown;
    principal?: unknown;
    observaciones?: unknown;
    activo?: unknown;
}, {
    [x: string]: any;
    tipoContacto?: unknown;
    valor?: unknown;
    principal?: unknown;
    observaciones?: unknown;
    activo?: unknown;
}>;
export type CreatePersonaTipoDto = z.infer<typeof createPersonaTipoSchema>;
export type UpdatePersonaTipoDto = z.infer<typeof updatePersonaTipoSchema>;
export type CreateContactoPersonaDto = z.infer<typeof createContactoPersonaSchema>;
export type UpdateContactoPersonaDto = z.infer<typeof updateContactoPersonaSchema>;
export interface SocioData {
    categoriaId: number;
    numeroSocio?: number;
    fechaIngreso?: Date;
    fechaBaja?: Date;
    motivoBaja?: string;
}
export interface DocenteData {
    especialidadId: number;
    honorariosPorHora?: number;
}
export interface ProveedorData {
    cuit: string;
    razonSocial: string;
}
//# sourceMappingURL=persona-tipo.dto.d.ts.map