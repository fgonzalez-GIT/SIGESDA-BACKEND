import { z } from 'zod';
export declare enum TipoConfiguracion {
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    JSON = "JSON"
}
export declare const createConfiguracionSchema: z.ZodEffects<z.ZodObject<{
    clave: z.ZodString;
    valor: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    tipo: z.ZodDefault<z.ZodNativeEnum<typeof TipoConfiguracion>>;
}, "strip", z.ZodTypeAny, {
    tipo: TipoConfiguracion;
    valor: string;
    clave: string;
    descripcion?: string | undefined;
}, {
    valor: string;
    clave: string;
    tipo?: TipoConfiguracion | undefined;
    descripcion?: string | undefined;
}>, {
    tipo: TipoConfiguracion;
    valor: string;
    clave: string;
    descripcion?: string | undefined;
}, {
    valor: string;
    clave: string;
    tipo?: TipoConfiguracion | undefined;
    descripcion?: string | undefined;
}>;
export declare const updateConfiguracionSchema: z.ZodEffects<z.ZodObject<{
    valor: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodOptional<z.ZodString>;
    tipo: z.ZodOptional<z.ZodNativeEnum<typeof TipoConfiguracion>>;
}, "strip", z.ZodTypeAny, {
    tipo?: TipoConfiguracion | undefined;
    valor?: string | undefined;
    descripcion?: string | undefined;
}, {
    tipo?: TipoConfiguracion | undefined;
    valor?: string | undefined;
    descripcion?: string | undefined;
}>, {
    tipo?: TipoConfiguracion | undefined;
    valor?: string | undefined;
    descripcion?: string | undefined;
}, {
    tipo?: TipoConfiguracion | undefined;
    valor?: string | undefined;
    descripcion?: string | undefined;
}>;
export declare const configuracionQuerySchema: z.ZodObject<{
    tipo: z.ZodOptional<z.ZodNativeEnum<typeof TipoConfiguracion>>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    tipo?: TipoConfiguracion | undefined;
    search?: string | undefined;
}, {
    tipo?: TipoConfiguracion | undefined;
    search?: string | undefined;
    page?: unknown;
    limit?: unknown;
}>;
export declare const configuracionCategoriaSchema: z.ZodObject<{
    categoria: z.ZodString;
    incluirDescripciones: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    categoria: string;
    incluirDescripciones: boolean;
}, {
    categoria: string;
    incluirDescripciones?: boolean | undefined;
}>;
export declare const importarConfiguracionesSchema: z.ZodObject<{
    configuraciones: z.ZodArray<z.ZodObject<{
        clave: z.ZodString;
        valor: z.ZodString;
        descripcion: z.ZodOptional<z.ZodString>;
        tipo: z.ZodDefault<z.ZodNativeEnum<typeof TipoConfiguracion>>;
    }, "strip", z.ZodTypeAny, {
        tipo: TipoConfiguracion;
        valor: string;
        clave: string;
        descripcion?: string | undefined;
    }, {
        valor: string;
        clave: string;
        tipo?: TipoConfiguracion | undefined;
        descripcion?: string | undefined;
    }>, "many">;
    sobrescribir: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    configuraciones: {
        tipo: TipoConfiguracion;
        valor: string;
        clave: string;
        descripcion?: string | undefined;
    }[];
    sobrescribir: boolean;
}, {
    configuraciones: {
        valor: string;
        clave: string;
        tipo?: TipoConfiguracion | undefined;
        descripcion?: string | undefined;
    }[];
    sobrescribir?: boolean | undefined;
}>;
export type ValorConfiguracion = {
    STRING: string;
    NUMBER: number;
    BOOLEAN: boolean;
    JSON: any;
};
export declare const parsearValor: <T extends keyof ValorConfiguracion>(valor: string, tipo: T) => ValorConfiguracion[T];
export declare const CLAVES_SISTEMA: {
    readonly CUOTA_SOCIO_ACTIVO: "CUOTA_SOCIO_ACTIVO";
    readonly CUOTA_SOCIO_ESTUDIANTE: "CUOTA_SOCIO_ESTUDIANTE";
    readonly CUOTA_SOCIO_FAMILIAR: "CUOTA_SOCIO_FAMILIAR";
    readonly CUOTA_SOCIO_JUBILADO: "CUOTA_SOCIO_JUBILADO";
    readonly NOMBRE_ASOCIACION: "NOMBRE_ASOCIACION";
    readonly EMAIL_CONTACTO: "EMAIL_CONTACTO";
    readonly TELEFONO_CONTACTO: "TELEFONO_CONTACTO";
    readonly DIRECCION_ASOCIACION: "DIRECCION_ASOCIACION";
    readonly DIAS_VENCIMIENTO_CUOTA: "DIAS_VENCIMIENTO_CUOTA";
    readonly DESCUENTO_FAMILIAR: "DESCUENTO_FAMILIAR";
    readonly ACTIVIDADES_GRATIS_SOCIOS: "ACTIVIDADES_GRATIS_SOCIOS";
    readonly BACKUP_AUTOMATICO: "BACKUP_AUTOMATICO";
    readonly ENVIO_RECORDATORIOS: "ENVIO_RECORDATORIOS";
    readonly FORMATO_RECIBO: "FORMATO_RECIBO";
};
export type CreateConfiguracionDto = z.infer<typeof createConfiguracionSchema>;
export type UpdateConfiguracionDto = z.infer<typeof updateConfiguracionSchema>;
export type ConfiguracionQueryDto = z.infer<typeof configuracionQuerySchema>;
export type ConfiguracionCategoriaDto = z.infer<typeof configuracionCategoriaSchema>;
export type ImportarConfiguracionesDto = z.infer<typeof importarConfiguracionesSchema>;
//# sourceMappingURL=configuracion.dto.d.ts.map