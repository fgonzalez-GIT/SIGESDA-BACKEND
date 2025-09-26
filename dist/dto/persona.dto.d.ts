import { z } from 'zod';
export declare const createPersonaSchema: z.ZodDiscriminatedUnion<"tipo", [z.ZodObject<{
    tipo: z.ZodLiteral<"SOCIO">;
    categoria: z.ZodNativeEnum<{
        ACTIVO: "ACTIVO";
        ESTUDIANTE: "ESTUDIANTE";
        FAMILIAR: "FAMILIAR";
        JUBILADO: "JUBILADO";
    }>;
    fechaIngreso: z.ZodOptional<z.ZodString>;
    numeroSocio: z.ZodOptional<z.ZodNumber>;
    nombre: z.ZodString;
    apellido: z.ZodString;
    dni: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    telefono: z.ZodOptional<z.ZodString>;
    direccion: z.ZodOptional<z.ZodString>;
    fechaNacimiento: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo: "SOCIO";
    nombre: string;
    apellido: string;
    dni: string;
    categoria: "ACTIVO" | "ESTUDIANTE" | "FAMILIAR" | "JUBILADO";
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
}, {
    tipo: "SOCIO";
    nombre: string;
    apellido: string;
    dni: string;
    categoria: "ACTIVO" | "ESTUDIANTE" | "FAMILIAR" | "JUBILADO";
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    numeroSocio?: number | undefined;
    fechaIngreso?: string | undefined;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"NO_SOCIO">;
    nombre: z.ZodString;
    apellido: z.ZodString;
    dni: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    telefono: z.ZodOptional<z.ZodString>;
    direccion: z.ZodOptional<z.ZodString>;
    fechaNacimiento: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo: "NO_SOCIO";
    nombre: string;
    apellido: string;
    dni: string;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
}, {
    tipo: "NO_SOCIO";
    nombre: string;
    apellido: string;
    dni: string;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"DOCENTE">;
    especialidad: z.ZodString;
    honorariosPorHora: z.ZodOptional<z.ZodNumber>;
    nombre: z.ZodString;
    apellido: z.ZodString;
    dni: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    telefono: z.ZodOptional<z.ZodString>;
    direccion: z.ZodOptional<z.ZodString>;
    fechaNacimiento: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo: "DOCENTE";
    nombre: string;
    apellido: string;
    dni: string;
    especialidad: string;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    honorariosPorHora?: number | undefined;
}, {
    tipo: "DOCENTE";
    nombre: string;
    apellido: string;
    dni: string;
    especialidad: string;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    honorariosPorHora?: number | undefined;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"PROVEEDOR">;
    cuit: z.ZodString;
    razonSocial: z.ZodString;
    nombre: z.ZodString;
    apellido: z.ZodString;
    dni: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    telefono: z.ZodOptional<z.ZodString>;
    direccion: z.ZodOptional<z.ZodString>;
    fechaNacimiento: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo: "PROVEEDOR";
    nombre: string;
    apellido: string;
    dni: string;
    cuit: string;
    razonSocial: string;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
}, {
    tipo: "PROVEEDOR";
    nombre: string;
    apellido: string;
    dni: string;
    cuit: string;
    razonSocial: string;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
}>]>;
export declare const updatePersonaSchema: z.ZodDiscriminatedUnion<"tipo", [z.ZodObject<{
    categoria: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVO: "ACTIVO";
        ESTUDIANTE: "ESTUDIANTE";
        FAMILIAR: "FAMILIAR";
        JUBILADO: "JUBILADO";
    }>>;
    fechaIngreso: z.ZodOptional<z.ZodString>;
    fechaBaja: z.ZodOptional<z.ZodString>;
    motivoBaja: z.ZodOptional<z.ZodString>;
    nombre: z.ZodOptional<z.ZodString>;
    apellido: z.ZodOptional<z.ZodString>;
    dni: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    telefono: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    direccion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fechaNacimiento: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tipo: z.ZodLiteral<"SOCIO">;
}, "strip", z.ZodTypeAny, {
    tipo: "SOCIO";
    nombre?: string | undefined;
    apellido?: string | undefined;
    dni?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    categoria?: "ACTIVO" | "ESTUDIANTE" | "FAMILIAR" | "JUBILADO" | undefined;
    fechaIngreso?: string | undefined;
    fechaBaja?: string | undefined;
    motivoBaja?: string | undefined;
}, {
    tipo: "SOCIO";
    nombre?: string | undefined;
    apellido?: string | undefined;
    dni?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    categoria?: "ACTIVO" | "ESTUDIANTE" | "FAMILIAR" | "JUBILADO" | undefined;
    fechaIngreso?: string | undefined;
    fechaBaja?: string | undefined;
    motivoBaja?: string | undefined;
}>, z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    apellido: z.ZodOptional<z.ZodString>;
    dni: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    telefono: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    direccion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fechaNacimiento: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tipo: z.ZodLiteral<"NO_SOCIO">;
}, "strip", z.ZodTypeAny, {
    tipo: "NO_SOCIO";
    nombre?: string | undefined;
    apellido?: string | undefined;
    dni?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
}, {
    tipo: "NO_SOCIO";
    nombre?: string | undefined;
    apellido?: string | undefined;
    dni?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
}>, z.ZodObject<{
    especialidad: z.ZodOptional<z.ZodString>;
    honorariosPorHora: z.ZodOptional<z.ZodNumber>;
    nombre: z.ZodOptional<z.ZodString>;
    apellido: z.ZodOptional<z.ZodString>;
    dni: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    telefono: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    direccion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fechaNacimiento: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tipo: z.ZodLiteral<"DOCENTE">;
}, "strip", z.ZodTypeAny, {
    tipo: "DOCENTE";
    nombre?: string | undefined;
    apellido?: string | undefined;
    dni?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    especialidad?: string | undefined;
    honorariosPorHora?: number | undefined;
}, {
    tipo: "DOCENTE";
    nombre?: string | undefined;
    apellido?: string | undefined;
    dni?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    especialidad?: string | undefined;
    honorariosPorHora?: number | undefined;
}>, z.ZodObject<{
    cuit: z.ZodOptional<z.ZodString>;
    razonSocial: z.ZodOptional<z.ZodString>;
    nombre: z.ZodOptional<z.ZodString>;
    apellido: z.ZodOptional<z.ZodString>;
    dni: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    telefono: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    direccion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fechaNacimiento: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tipo: z.ZodLiteral<"PROVEEDOR">;
}, "strip", z.ZodTypeAny, {
    tipo: "PROVEEDOR";
    nombre?: string | undefined;
    apellido?: string | undefined;
    dni?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    cuit?: string | undefined;
    razonSocial?: string | undefined;
}, {
    tipo: "PROVEEDOR";
    nombre?: string | undefined;
    apellido?: string | undefined;
    dni?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    direccion?: string | undefined;
    fechaNacimiento?: string | undefined;
    cuit?: string | undefined;
    razonSocial?: string | undefined;
}>]>;
export declare const personaQuerySchema: z.ZodObject<{
    tipo: z.ZodOptional<z.ZodNativeEnum<{
        SOCIO: "SOCIO";
        NO_SOCIO: "NO_SOCIO";
        DOCENTE: "DOCENTE";
        PROVEEDOR: "PROVEEDOR";
    }>>;
    categoria: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVO: "ACTIVO";
        ESTUDIANTE: "ESTUDIANTE";
        FAMILIAR: "FAMILIAR";
        JUBILADO: "JUBILADO";
    }>>;
    activo: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    tipo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    categoria?: "ACTIVO" | "ESTUDIANTE" | "FAMILIAR" | "JUBILADO" | undefined;
    activo?: boolean | undefined;
    search?: string | undefined;
}, {
    tipo?: "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR" | undefined;
    categoria?: "ACTIVO" | "ESTUDIANTE" | "FAMILIAR" | "JUBILADO" | undefined;
    activo?: unknown;
    search?: string | undefined;
    page?: unknown;
    limit?: unknown;
}>;
export type CreatePersonaDto = z.infer<typeof createPersonaSchema>;
export type UpdatePersonaDto = z.infer<typeof updatePersonaSchema>;
export type PersonaQueryDto = z.infer<typeof personaQuerySchema>;
//# sourceMappingURL=persona.dto.d.ts.map