import { z } from 'zod';
export declare const createFamiliarSchema: z.ZodEffects<z.ZodObject<{
    socioId: z.ZodNumber;
    familiarId: z.ZodNumber;
    parentesco: z.ZodNativeEnum<{
        HIJO: "HIJO";
        HIJA: "HIJA";
        CONYUGE: "CONYUGE";
        ESPOSA: "ESPOSA";
        ESPOSO: "ESPOSO";
        PADRE: "PADRE";
        MADRE: "MADRE";
        HERMANO: "HERMANO";
        HERMANA: "HERMANA";
        OTRO: "OTRO";
        ABUELO: "ABUELO";
        ABUELA: "ABUELA";
        NIETO: "NIETO";
        NIETA: "NIETA";
        TIO: "TIO";
        TIA: "TIA";
        SOBRINO: "SOBRINO";
        SOBRINA: "SOBRINA";
        PRIMO: "PRIMO";
        PRIMA: "PRIMA";
    }>;
    descripcion: z.ZodOptional<z.ZodString>;
    permisoResponsableFinanciero: z.ZodDefault<z.ZodBoolean>;
    permisoContactoEmergencia: z.ZodDefault<z.ZodBoolean>;
    permisoAutorizadoRetiro: z.ZodDefault<z.ZodBoolean>;
    descuento: z.ZodDefault<z.ZodNumber>;
    activo: z.ZodDefault<z.ZodBoolean>;
    grupoFamiliarId: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    socioId: number;
    familiarId: number;
    parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
    permisoResponsableFinanciero: boolean;
    permisoContactoEmergencia: boolean;
    permisoAutorizadoRetiro: boolean;
    descuento: number;
    descripcion?: string | undefined;
    grupoFamiliarId?: number | null | undefined;
}, {
    socioId: number;
    familiarId: number;
    parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
    activo?: boolean | undefined;
    descripcion?: string | undefined;
    permisoResponsableFinanciero?: boolean | undefined;
    permisoContactoEmergencia?: boolean | undefined;
    permisoAutorizadoRetiro?: boolean | undefined;
    descuento?: number | undefined;
    grupoFamiliarId?: number | null | undefined;
}>, {
    activo: boolean;
    socioId: number;
    familiarId: number;
    parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
    permisoResponsableFinanciero: boolean;
    permisoContactoEmergencia: boolean;
    permisoAutorizadoRetiro: boolean;
    descuento: number;
    descripcion?: string | undefined;
    grupoFamiliarId?: number | null | undefined;
}, {
    socioId: number;
    familiarId: number;
    parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
    activo?: boolean | undefined;
    descripcion?: string | undefined;
    permisoResponsableFinanciero?: boolean | undefined;
    permisoContactoEmergencia?: boolean | undefined;
    permisoAutorizadoRetiro?: boolean | undefined;
    descuento?: number | undefined;
    grupoFamiliarId?: number | null | undefined;
}>;
export declare const updateFamiliarSchema: z.ZodObject<{
    parentesco: z.ZodOptional<z.ZodNativeEnum<{
        HIJO: "HIJO";
        HIJA: "HIJA";
        CONYUGE: "CONYUGE";
        ESPOSA: "ESPOSA";
        ESPOSO: "ESPOSO";
        PADRE: "PADRE";
        MADRE: "MADRE";
        HERMANO: "HERMANO";
        HERMANA: "HERMANA";
        OTRO: "OTRO";
        ABUELO: "ABUELO";
        ABUELA: "ABUELA";
        NIETO: "NIETO";
        NIETA: "NIETA";
        TIO: "TIO";
        TIA: "TIA";
        SOBRINO: "SOBRINO";
        SOBRINA: "SOBRINA";
        PRIMO: "PRIMO";
        PRIMA: "PRIMA";
    }>>;
    descripcion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    permisoResponsableFinanciero: z.ZodOptional<z.ZodBoolean>;
    permisoContactoEmergencia: z.ZodOptional<z.ZodBoolean>;
    permisoAutorizadoRetiro: z.ZodOptional<z.ZodBoolean>;
    descuento: z.ZodOptional<z.ZodNumber>;
    activo: z.ZodOptional<z.ZodBoolean>;
    grupoFamiliarId: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    activo?: boolean | undefined;
    descripcion?: string | null | undefined;
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA" | undefined;
    permisoResponsableFinanciero?: boolean | undefined;
    permisoContactoEmergencia?: boolean | undefined;
    permisoAutorizadoRetiro?: boolean | undefined;
    descuento?: number | undefined;
    grupoFamiliarId?: number | null | undefined;
}, {
    activo?: boolean | undefined;
    descripcion?: string | null | undefined;
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA" | undefined;
    permisoResponsableFinanciero?: boolean | undefined;
    permisoContactoEmergencia?: boolean | undefined;
    permisoAutorizadoRetiro?: boolean | undefined;
    descuento?: number | undefined;
    grupoFamiliarId?: number | null | undefined;
}>;
export declare const familiarQuerySchema: z.ZodObject<{
    socioId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    familiarId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    parentesco: z.ZodOptional<z.ZodNativeEnum<{
        HIJO: "HIJO";
        HIJA: "HIJA";
        CONYUGE: "CONYUGE";
        ESPOSA: "ESPOSA";
        ESPOSO: "ESPOSO";
        PADRE: "PADRE";
        MADRE: "MADRE";
        HERMANO: "HERMANO";
        HERMANA: "HERMANA";
        OTRO: "OTRO";
        ABUELO: "ABUELO";
        ABUELA: "ABUELA";
        NIETO: "NIETO";
        NIETA: "NIETA";
        TIO: "TIO";
        TIA: "TIA";
        SOBRINO: "SOBRINO";
        SOBRINA: "SOBRINA";
        PRIMO: "PRIMO";
        PRIMA: "PRIMA";
    }>>;
    grupoFamiliarId: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    includeInactivos: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    soloActivos: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    soloActivos: boolean;
    page: number;
    limit: number;
    includeInactivos: boolean;
    socioId?: number | undefined;
    familiarId?: number | undefined;
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA" | undefined;
    grupoFamiliarId?: number | undefined;
}, {
    soloActivos?: unknown;
    page?: unknown;
    limit?: unknown;
    socioId?: unknown;
    familiarId?: unknown;
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA" | undefined;
    grupoFamiliarId?: unknown;
    includeInactivos?: unknown;
}>;
export declare const createBulkFamiliaresSchema: z.ZodObject<{
    familiares: z.ZodArray<z.ZodEffects<z.ZodObject<{
        socioId: z.ZodNumber;
        familiarId: z.ZodNumber;
        parentesco: z.ZodNativeEnum<{
            HIJO: "HIJO";
            HIJA: "HIJA";
            CONYUGE: "CONYUGE";
            ESPOSA: "ESPOSA";
            ESPOSO: "ESPOSO";
            PADRE: "PADRE";
            MADRE: "MADRE";
            HERMANO: "HERMANO";
            HERMANA: "HERMANA";
            OTRO: "OTRO";
            ABUELO: "ABUELO";
            ABUELA: "ABUELA";
            NIETO: "NIETO";
            NIETA: "NIETA";
            TIO: "TIO";
            TIA: "TIA";
            SOBRINO: "SOBRINO";
            SOBRINA: "SOBRINA";
            PRIMO: "PRIMO";
            PRIMA: "PRIMA";
        }>;
        descripcion: z.ZodOptional<z.ZodString>;
        permisoResponsableFinanciero: z.ZodDefault<z.ZodBoolean>;
        permisoContactoEmergencia: z.ZodDefault<z.ZodBoolean>;
        permisoAutorizadoRetiro: z.ZodDefault<z.ZodBoolean>;
        descuento: z.ZodDefault<z.ZodNumber>;
        activo: z.ZodDefault<z.ZodBoolean>;
        grupoFamiliarId: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        activo: boolean;
        socioId: number;
        familiarId: number;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
        permisoResponsableFinanciero: boolean;
        permisoContactoEmergencia: boolean;
        permisoAutorizadoRetiro: boolean;
        descuento: number;
        descripcion?: string | undefined;
        grupoFamiliarId?: number | null | undefined;
    }, {
        socioId: number;
        familiarId: number;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
        activo?: boolean | undefined;
        descripcion?: string | undefined;
        permisoResponsableFinanciero?: boolean | undefined;
        permisoContactoEmergencia?: boolean | undefined;
        permisoAutorizadoRetiro?: boolean | undefined;
        descuento?: number | undefined;
        grupoFamiliarId?: number | null | undefined;
    }>, {
        activo: boolean;
        socioId: number;
        familiarId: number;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
        permisoResponsableFinanciero: boolean;
        permisoContactoEmergencia: boolean;
        permisoAutorizadoRetiro: boolean;
        descuento: number;
        descripcion?: string | undefined;
        grupoFamiliarId?: number | null | undefined;
    }, {
        socioId: number;
        familiarId: number;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
        activo?: boolean | undefined;
        descripcion?: string | undefined;
        permisoResponsableFinanciero?: boolean | undefined;
        permisoContactoEmergencia?: boolean | undefined;
        permisoAutorizadoRetiro?: boolean | undefined;
        descuento?: number | undefined;
        grupoFamiliarId?: number | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    familiares: {
        activo: boolean;
        socioId: number;
        familiarId: number;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
        permisoResponsableFinanciero: boolean;
        permisoContactoEmergencia: boolean;
        permisoAutorizadoRetiro: boolean;
        descuento: number;
        descripcion?: string | undefined;
        grupoFamiliarId?: number | null | undefined;
    }[];
}, {
    familiares: {
        socioId: number;
        familiarId: number;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA";
        activo?: boolean | undefined;
        descripcion?: string | undefined;
        permisoResponsableFinanciero?: boolean | undefined;
        permisoContactoEmergencia?: boolean | undefined;
        permisoAutorizadoRetiro?: boolean | undefined;
        descuento?: number | undefined;
        grupoFamiliarId?: number | null | undefined;
    }[];
}>;
export declare const deleteBulkFamiliaresSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export declare const familiarSearchSchema: z.ZodObject<{
    search: z.ZodString;
    searchBy: z.ZodDefault<z.ZodEnum<["nombre", "dni", "email", "all"]>>;
    parentesco: z.ZodOptional<z.ZodNativeEnum<{
        HIJO: "HIJO";
        HIJA: "HIJA";
        CONYUGE: "CONYUGE";
        ESPOSA: "ESPOSA";
        ESPOSO: "ESPOSO";
        PADRE: "PADRE";
        MADRE: "MADRE";
        HERMANO: "HERMANO";
        HERMANA: "HERMANA";
        OTRO: "OTRO";
        ABUELO: "ABUELO";
        ABUELA: "ABUELA";
        NIETO: "NIETO";
        NIETA: "NIETA";
        TIO: "TIO";
        TIA: "TIA";
        SOBRINO: "SOBRINO";
        SOBRINA: "SOBRINA";
        PRIMO: "PRIMO";
        PRIMA: "PRIMA";
    }>>;
    includeInactivos: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    search: string;
    includeInactivos: boolean;
    searchBy: "nombre" | "dni" | "email" | "all";
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA" | undefined;
}, {
    search: string;
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "ESPOSA" | "ESPOSO" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | "ABUELO" | "ABUELA" | "NIETO" | "NIETA" | "TIO" | "TIA" | "SOBRINO" | "SOBRINA" | "PRIMO" | "PRIMA" | undefined;
    includeInactivos?: boolean | undefined;
    searchBy?: "nombre" | "dni" | "email" | "all" | undefined;
}>;
export type CreateFamiliarDto = z.infer<typeof createFamiliarSchema>;
export type UpdateFamiliarDto = z.infer<typeof updateFamiliarSchema>;
export type FamiliarQueryDto = z.infer<typeof familiarQuerySchema>;
export type CreateBulkFamiliaresDto = z.infer<typeof createBulkFamiliaresSchema>;
export type DeleteBulkFamiliaresDto = z.infer<typeof deleteBulkFamiliaresSchema>;
export type FamiliarSearchDto = z.infer<typeof familiarSearchSchema>;
//# sourceMappingURL=familiar.dto.d.ts.map