import { z } from 'zod';
export declare const createCategoriaItemSchema: z.ZodObject<{
    codigo: z.ZodString;
    nombre: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    icono: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    orden: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    codigo: string;
    nombre: string;
    descripcion?: string | undefined;
    icono?: string | undefined;
    orden?: number | undefined;
    color?: string | undefined;
}, {
    codigo: string;
    nombre: string;
    descripcion?: string | undefined;
    icono?: string | undefined;
    orden?: number | undefined;
    color?: string | undefined;
}>;
export type CreateCategoriaItemDto = z.infer<typeof createCategoriaItemSchema>;
export declare const updateCategoriaItemSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodOptional<z.ZodString>;
    icono: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    orden: z.ZodOptional<z.ZodNumber>;
    activo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    icono?: string | undefined;
    orden?: number | undefined;
    color?: string | undefined;
}, {
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    icono?: string | undefined;
    orden?: number | undefined;
    color?: string | undefined;
}>;
export type UpdateCategoriaItemDto = z.infer<typeof updateCategoriaItemSchema>;
export declare const reorderCategoriasSchema: z.ZodObject<{
    ordenamiento: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        orden: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        orden: number;
        id: number;
    }, {
        orden: number;
        id: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ordenamiento: {
        orden: number;
        id: number;
    }[];
}, {
    ordenamiento: {
        orden: number;
        id: number;
    }[];
}>;
export type ReorderCategoriasDto = z.infer<typeof reorderCategoriasSchema>;
export declare const createTipoItemCuotaSchema: z.ZodEffects<z.ZodObject<{
    codigo: z.ZodString;
    nombre: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    categoriaItemId: z.ZodNumber;
    esCalculado: z.ZodDefault<z.ZodBoolean>;
    formula: z.ZodOptional<z.ZodAny>;
    orden: z.ZodOptional<z.ZodNumber>;
    configurable: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    codigo: string;
    nombre: string;
    categoriaItemId: number;
    esCalculado: boolean;
    configurable: boolean;
    descripcion?: string | undefined;
    orden?: number | undefined;
    formula?: any;
}, {
    codigo: string;
    nombre: string;
    categoriaItemId: number;
    descripcion?: string | undefined;
    orden?: number | undefined;
    esCalculado?: boolean | undefined;
    formula?: any;
    configurable?: boolean | undefined;
}>, {
    codigo: string;
    nombre: string;
    categoriaItemId: number;
    esCalculado: boolean;
    configurable: boolean;
    descripcion?: string | undefined;
    orden?: number | undefined;
    formula?: any;
}, {
    codigo: string;
    nombre: string;
    categoriaItemId: number;
    descripcion?: string | undefined;
    orden?: number | undefined;
    esCalculado?: boolean | undefined;
    formula?: any;
    configurable?: boolean | undefined;
}>;
export type CreateTipoItemCuotaDto = z.infer<typeof createTipoItemCuotaSchema>;
export declare const updateTipoItemCuotaSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodOptional<z.ZodString>;
    categoriaItemId: z.ZodOptional<z.ZodNumber>;
    esCalculado: z.ZodOptional<z.ZodBoolean>;
    formula: z.ZodOptional<z.ZodAny>;
    orden: z.ZodOptional<z.ZodNumber>;
    configurable: z.ZodOptional<z.ZodBoolean>;
    activo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    orden?: number | undefined;
    categoriaItemId?: number | undefined;
    esCalculado?: boolean | undefined;
    formula?: any;
    configurable?: boolean | undefined;
}, {
    activo?: boolean | undefined;
    nombre?: string | undefined;
    descripcion?: string | undefined;
    orden?: number | undefined;
    categoriaItemId?: number | undefined;
    esCalculado?: boolean | undefined;
    formula?: any;
    configurable?: boolean | undefined;
}>;
export type UpdateTipoItemCuotaDto = z.infer<typeof updateTipoItemCuotaSchema>;
export declare const updateFormulaSchema: z.ZodObject<{
    formula: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    formula?: any;
}, {
    formula?: any;
}>;
export type UpdateFormulaDto = z.infer<typeof updateFormulaSchema>;
export declare const cloneTipoItemSchema: z.ZodObject<{
    nuevoCodigo: z.ZodString;
    nuevoNombre: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nuevoNombre: string;
    nuevoCodigo: string;
}, {
    nuevoNombre: string;
    nuevoCodigo: string;
}>;
export type CloneTipoItemDto = z.infer<typeof cloneTipoItemSchema>;
export declare const reorderTiposItemSchema: z.ZodObject<{
    ordenamiento: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        orden: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        orden: number;
        id: number;
    }, {
        orden: number;
        id: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ordenamiento: {
        orden: number;
        id: number;
    }[];
}, {
    ordenamiento: {
        orden: number;
        id: number;
    }[];
}>;
export type ReorderTiposItemDto = z.infer<typeof reorderTiposItemSchema>;
export declare const addManualItemSchema: z.ZodObject<{
    cuotaId: z.ZodNumber;
    tipoItemCodigo: z.ZodString;
    concepto: z.ZodOptional<z.ZodString>;
    monto: z.ZodEffects<z.ZodNumber, number, number>;
    cantidad: z.ZodDefault<z.ZodNumber>;
    porcentaje: z.ZodOptional<z.ZodNumber>;
    observaciones: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    cantidad: number;
    monto: number;
    cuotaId: number;
    tipoItemCodigo: string;
    observaciones?: string | undefined;
    concepto?: string | undefined;
    porcentaje?: number | undefined;
    metadata?: any;
}, {
    monto: number;
    cuotaId: number;
    tipoItemCodigo: string;
    observaciones?: string | undefined;
    concepto?: string | undefined;
    cantidad?: number | undefined;
    porcentaje?: number | undefined;
    metadata?: any;
}>;
export type AddManualItemDto = z.infer<typeof addManualItemSchema>;
export declare const updateItemCuotaSchema: z.ZodObject<{
    monto: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    cantidad: z.ZodOptional<z.ZodNumber>;
    porcentaje: z.ZodOptional<z.ZodNumber>;
    concepto: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | undefined;
    concepto?: string | undefined;
    cantidad?: number | undefined;
    monto?: number | undefined;
    porcentaje?: number | undefined;
    metadata?: any;
}, {
    observaciones?: string | undefined;
    concepto?: string | undefined;
    cantidad?: number | undefined;
    monto?: number | undefined;
    porcentaje?: number | undefined;
    metadata?: any;
}>;
export type UpdateItemCuotaDto = z.infer<typeof updateItemCuotaSchema>;
export declare const regenerarItemsSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        tipoItemId: z.ZodNumber;
        concepto: z.ZodString;
        monto: z.ZodNumber;
        cantidad: z.ZodDefault<z.ZodNumber>;
        porcentaje: z.ZodOptional<z.ZodNumber>;
        esAutomatico: z.ZodDefault<z.ZodBoolean>;
        esEditable: z.ZodDefault<z.ZodBoolean>;
        observaciones: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        concepto: string;
        cantidad: number;
        monto: number;
        tipoItemId: number;
        esAutomatico: boolean;
        esEditable: boolean;
        observaciones?: string | undefined;
        porcentaje?: number | undefined;
        metadata?: any;
    }, {
        concepto: string;
        monto: number;
        tipoItemId: number;
        observaciones?: string | undefined;
        cantidad?: number | undefined;
        porcentaje?: number | undefined;
        esAutomatico?: boolean | undefined;
        esEditable?: boolean | undefined;
        metadata?: any;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        concepto: string;
        cantidad: number;
        monto: number;
        tipoItemId: number;
        esAutomatico: boolean;
        esEditable: boolean;
        observaciones?: string | undefined;
        porcentaje?: number | undefined;
        metadata?: any;
    }[];
}, {
    items: {
        concepto: string;
        monto: number;
        tipoItemId: number;
        observaciones?: string | undefined;
        cantidad?: number | undefined;
        porcentaje?: number | undefined;
        esAutomatico?: boolean | undefined;
        esEditable?: boolean | undefined;
        metadata?: any;
    }[];
}>;
export type RegenerarItemsDto = z.infer<typeof regenerarItemsSchema>;
export declare const aplicarDescuentoGlobalSchema: z.ZodObject<{
    porcentaje: z.ZodNumber;
    concepto: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    porcentaje: number;
    concepto?: string | undefined;
}, {
    porcentaje: number;
    concepto?: string | undefined;
}>;
export type AplicarDescuentoGlobalDto = z.infer<typeof aplicarDescuentoGlobalSchema>;
export declare const queryItemsSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    offset: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type QueryItemsDto = z.infer<typeof queryItemsSchema>;
//# sourceMappingURL=item-cuota.dto.d.ts.map