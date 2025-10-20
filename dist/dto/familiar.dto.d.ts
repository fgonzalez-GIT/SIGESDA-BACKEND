import { z } from 'zod';
export declare const createFamiliarSchema: z.ZodEffects<z.ZodObject<{
    socioId: z.ZodString;
    familiarId: z.ZodString;
    parentesco: z.ZodNativeEnum<{
        HIJO: "HIJO";
        HIJA: "HIJA";
        CONYUGE: "CONYUGE";
        PADRE: "PADRE";
        MADRE: "MADRE";
        HERMANO: "HERMANO";
        HERMANA: "HERMANA";
        OTRO: "OTRO";
    }>;
}, "strip", z.ZodTypeAny, {
    socioId: string;
    familiarId: string;
    parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
}, {
    socioId: string;
    familiarId: string;
    parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
}>, {
    socioId: string;
    familiarId: string;
    parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
}, {
    socioId: string;
    familiarId: string;
    parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
}>;
export declare const updateFamiliarSchema: z.ZodObject<{
    parentesco: z.ZodOptional<z.ZodNativeEnum<{
        HIJO: "HIJO";
        HIJA: "HIJA";
        CONYUGE: "CONYUGE";
        PADRE: "PADRE";
        MADRE: "MADRE";
        HERMANO: "HERMANO";
        HERMANA: "HERMANA";
        OTRO: "OTRO";
    }>>;
}, "strip", z.ZodTypeAny, {
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | undefined;
}, {
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | undefined;
}>;
export declare const familiarQuerySchema: z.ZodObject<{
    socioId: z.ZodOptional<z.ZodString>;
    familiarId: z.ZodOptional<z.ZodString>;
    parentesco: z.ZodOptional<z.ZodNativeEnum<{
        HIJO: "HIJO";
        HIJA: "HIJA";
        CONYUGE: "CONYUGE";
        PADRE: "PADRE";
        MADRE: "MADRE";
        HERMANO: "HERMANO";
        HERMANA: "HERMANA";
        OTRO: "OTRO";
    }>>;
    includeInactivos: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    includeInactivos: boolean;
    socioId?: string | undefined;
    familiarId?: string | undefined;
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | undefined;
}, {
    page?: unknown;
    limit?: unknown;
    socioId?: string | undefined;
    familiarId?: string | undefined;
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | undefined;
    includeInactivos?: unknown;
}>;
export declare const createBulkFamiliaresSchema: z.ZodObject<{
    familiares: z.ZodArray<z.ZodEffects<z.ZodObject<{
        socioId: z.ZodString;
        familiarId: z.ZodString;
        parentesco: z.ZodNativeEnum<{
            HIJO: "HIJO";
            HIJA: "HIJA";
            CONYUGE: "CONYUGE";
            PADRE: "PADRE";
            MADRE: "MADRE";
            HERMANO: "HERMANO";
            HERMANA: "HERMANA";
            OTRO: "OTRO";
        }>;
    }, "strip", z.ZodTypeAny, {
        socioId: string;
        familiarId: string;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
    }, {
        socioId: string;
        familiarId: string;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
    }>, {
        socioId: string;
        familiarId: string;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
    }, {
        socioId: string;
        familiarId: string;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    familiares: {
        socioId: string;
        familiarId: string;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
    }[];
}, {
    familiares: {
        socioId: string;
        familiarId: string;
        parentesco: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO";
    }[];
}>;
export declare const deleteBulkFamiliaresSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    ids: string[];
}, {
    ids: string[];
}>;
export declare const familiarSearchSchema: z.ZodObject<{
    search: z.ZodString;
    searchBy: z.ZodDefault<z.ZodEnum<["nombre", "dni", "email", "all"]>>;
    parentesco: z.ZodOptional<z.ZodNativeEnum<{
        HIJO: "HIJO";
        HIJA: "HIJA";
        CONYUGE: "CONYUGE";
        PADRE: "PADRE";
        MADRE: "MADRE";
        HERMANO: "HERMANO";
        HERMANA: "HERMANA";
        OTRO: "OTRO";
    }>>;
    includeInactivos: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    search: string;
    includeInactivos: boolean;
    searchBy: "nombre" | "dni" | "email" | "all";
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | undefined;
}, {
    search: string;
    parentesco?: "HIJO" | "HIJA" | "CONYUGE" | "PADRE" | "MADRE" | "HERMANO" | "HERMANA" | "OTRO" | undefined;
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