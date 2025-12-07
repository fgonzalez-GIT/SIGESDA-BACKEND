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
    razonSocialId: z.ZodOptional<z.ZodNumber>;
    observaciones: z.ZodOptional<z.ZodString>;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    tipoPersonaId?: number | undefined;
    tipoPersonaCodigo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    observaciones?: string | undefined;
    categoriaId?: number | undefined;
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
    especialidadId?: number | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocialId?: number | undefined;
}, {
    tipoPersonaId?: number | undefined;
    tipoPersonaCodigo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    observaciones?: string | undefined;
    activo?: boolean | undefined;
    categoriaId?: number | undefined;
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
    especialidadId?: number | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocialId?: number | undefined;
}>, {
    activo: boolean;
    tipoPersonaId?: number | undefined;
    tipoPersonaCodigo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    observaciones?: string | undefined;
    categoriaId?: number | undefined;
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
    especialidadId?: number | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocialId?: number | undefined;
}, {
    tipoPersonaId?: number | undefined;
    tipoPersonaCodigo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    observaciones?: string | undefined;
    activo?: boolean | undefined;
    categoriaId?: number | undefined;
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
    especialidadId?: number | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocialId?: number | undefined;
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
    razonSocialId: z.ZodOptional<z.ZodNumber>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | undefined;
    activo?: boolean | undefined;
    categoriaId?: number | undefined;
    fechaIngreso?: string | undefined;
    fechaBaja?: string | undefined;
    motivoBaja?: string | undefined;
    especialidadId?: number | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocialId?: number | undefined;
    fechaDesasignacion?: string | undefined;
}, {
    observaciones?: string | undefined;
    activo?: boolean | undefined;
    categoriaId?: number | undefined;
    fechaIngreso?: string | undefined;
    fechaBaja?: string | undefined;
    motivoBaja?: string | undefined;
    especialidadId?: number | undefined;
    honorariosPorHora?: number | undefined;
    cuit?: string | undefined;
    razonSocialId?: number | undefined;
    fechaDesasignacion?: string | undefined;
}>;
export type CreatePersonaTipoDto = z.infer<typeof createPersonaTipoSchema>;
export type UpdatePersonaTipoDto = z.infer<typeof updatePersonaTipoSchema>;
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
    razonSocialId: number;
}
//# sourceMappingURL=persona-tipo.dto.d.ts.map