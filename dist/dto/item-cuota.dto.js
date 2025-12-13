"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryItemsSchema = exports.aplicarDescuentoGlobalSchema = exports.regenerarItemsSchema = exports.updateItemCuotaSchema = exports.addManualItemSchema = exports.reorderTiposItemSchema = exports.cloneTipoItemSchema = exports.updateFormulaSchema = exports.updateTipoItemCuotaSchema = exports.createTipoItemCuotaSchema = exports.reorderCategoriasSchema = exports.updateCategoriaItemSchema = exports.createCategoriaItemSchema = void 0;
const zod_1 = require("zod");
exports.createCategoriaItemSchema = zod_1.z.object({
    codigo: zod_1.z.string()
        .min(2, 'El código debe tener al menos 2 caracteres')
        .max(50, 'El código no puede exceder 50 caracteres')
        .regex(/^[A-Z0-9_]+$/, 'El código debe contener solo letras mayúsculas, números y guiones bajos'),
    nombre: zod_1.z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: zod_1.z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional(),
    icono: zod_1.z.string()
        .max(10, 'El ícono no puede exceder 10 caracteres')
        .optional(),
    color: zod_1.z.string()
        .max(20, 'El color no puede exceder 20 caracteres')
        .regex(/^(#[0-9A-Fa-f]{6}|[a-z]+)$/, 'El color debe ser un hex válido (#RRGGBB) o nombre de color')
        .optional(),
    orden: zod_1.z.number()
        .int('El orden debe ser un número entero')
        .min(0, 'El orden no puede ser negativo')
        .optional()
});
exports.updateCategoriaItemSchema = zod_1.z.object({
    nombre: zod_1.z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .optional(),
    descripcion: zod_1.z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional(),
    icono: zod_1.z.string()
        .max(10, 'El ícono no puede exceder 10 caracteres')
        .optional(),
    color: zod_1.z.string()
        .max(20, 'El color no puede exceder 20 caracteres')
        .regex(/^(#[0-9A-Fa-f]{6}|[a-z]+)$/, 'El color debe ser un hex válido (#RRGGBB) o nombre de color')
        .optional(),
    orden: zod_1.z.number()
        .int('El orden debe ser un número entero')
        .min(0, 'El orden no puede ser negativo')
        .optional(),
    activo: zod_1.z.boolean().optional()
});
exports.reorderCategoriasSchema = zod_1.z.object({
    ordenamiento: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.number().int().positive('ID inválido'),
        orden: zod_1.z.number().int().min(0, 'El orden no puede ser negativo')
    })).min(1, 'Debe especificar al menos una categoría')
});
exports.createTipoItemCuotaSchema = zod_1.z.object({
    codigo: zod_1.z.string()
        .min(2, 'El código debe tener al menos 2 caracteres')
        .max(100, 'El código no puede exceder 100 caracteres')
        .regex(/^[A-Z0-9_]+$/, 'El código debe contener solo letras mayúsculas, números y guiones bajos'),
    nombre: zod_1.z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(200, 'El nombre no puede exceder 200 caracteres'),
    descripcion: zod_1.z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional(),
    categoriaItemId: zod_1.z.number()
        .int('ID de categoría inválido')
        .positive('ID de categoría debe ser positivo'),
    esCalculado: zod_1.z.boolean()
        .default(true),
    formula: zod_1.z.any().optional(),
    orden: zod_1.z.number()
        .int('El orden debe ser un número entero')
        .min(0, 'El orden no puede ser negativo')
        .optional(),
    configurable: zod_1.z.boolean()
        .default(true)
}).refine((data) => {
    if (data.esCalculado && !data.formula) {
        return false;
    }
    return true;
}, {
    message: 'Los tipos calculados deben tener una fórmula',
    path: ['formula']
});
exports.updateTipoItemCuotaSchema = zod_1.z.object({
    nombre: zod_1.z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(200, 'El nombre no puede exceder 200 caracteres')
        .optional(),
    descripcion: zod_1.z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional(),
    categoriaItemId: zod_1.z.number()
        .int('ID de categoría inválido')
        .positive('ID de categoría debe ser positivo')
        .optional(),
    esCalculado: zod_1.z.boolean().optional(),
    formula: zod_1.z.any().optional(),
    orden: zod_1.z.number()
        .int('El orden debe ser un número entero')
        .min(0, 'El orden no puede ser negativo')
        .optional(),
    configurable: zod_1.z.boolean().optional(),
    activo: zod_1.z.boolean().optional()
});
exports.updateFormulaSchema = zod_1.z.object({
    formula: zod_1.z.any()
});
exports.cloneTipoItemSchema = zod_1.z.object({
    nuevoCodigo: zod_1.z.string()
        .min(2, 'El código debe tener al menos 2 caracteres')
        .max(100, 'El código no puede exceder 100 caracteres')
        .regex(/^[A-Z0-9_]+$/, 'El código debe contener solo letras mayúsculas, números y guiones bajos'),
    nuevoNombre: zod_1.z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(200, 'El nombre no puede exceder 200 caracteres')
});
exports.reorderTiposItemSchema = zod_1.z.object({
    ordenamiento: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.number().int().positive('ID inválido'),
        orden: zod_1.z.number().int().min(0, 'El orden no puede ser negativo')
    })).min(1, 'Debe especificar al menos un tipo de ítem')
});
exports.addManualItemSchema = zod_1.z.object({
    cuotaId: zod_1.z.number()
        .int('ID de cuota inválido')
        .positive('ID de cuota debe ser positivo'),
    tipoItemCodigo: zod_1.z.string()
        .min(2, 'Código de tipo de ítem inválido'),
    concepto: zod_1.z.string()
        .max(200, 'El concepto no puede exceder 200 caracteres')
        .optional(),
    monto: zod_1.z.number()
        .refine((val) => val !== 0, 'El monto no puede ser cero'),
    cantidad: zod_1.z.number()
        .positive('La cantidad debe ser mayor a cero')
        .default(1),
    porcentaje: zod_1.z.number()
        .min(-100, 'El porcentaje debe ser mayor o igual a -100')
        .max(100, 'El porcentaje debe ser menor o igual a 100')
        .optional(),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional(),
    metadata: zod_1.z.any().optional()
});
exports.updateItemCuotaSchema = zod_1.z.object({
    monto: zod_1.z.number()
        .refine((val) => val !== 0, 'El monto no puede ser cero')
        .optional(),
    cantidad: zod_1.z.number()
        .positive('La cantidad debe ser mayor a cero')
        .optional(),
    porcentaje: zod_1.z.number()
        .min(-100, 'El porcentaje debe ser mayor o igual a -100')
        .max(100, 'El porcentaje debe ser menor o igual a 100')
        .optional(),
    concepto: zod_1.z.string()
        .max(200, 'El concepto no puede exceder 200 caracteres')
        .optional(),
    observaciones: zod_1.z.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional(),
    metadata: zod_1.z.any().optional()
});
exports.regenerarItemsSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        tipoItemId: zod_1.z.number().int().positive('ID de tipo de ítem inválido'),
        concepto: zod_1.z.string().max(200, 'El concepto no puede exceder 200 caracteres'),
        monto: zod_1.z.number(),
        cantidad: zod_1.z.number().positive('La cantidad debe ser mayor a cero').default(1),
        porcentaje: zod_1.z.number().min(-100).max(100).optional(),
        esAutomatico: zod_1.z.boolean().default(true),
        esEditable: zod_1.z.boolean().default(false),
        observaciones: zod_1.z.string().max(500).optional(),
        metadata: zod_1.z.any().optional()
    })).min(1, 'Debe especificar al menos un ítem')
});
exports.aplicarDescuentoGlobalSchema = zod_1.z.object({
    porcentaje: zod_1.z.number()
        .positive('El porcentaje debe ser mayor a 0')
        .max(100, 'El porcentaje no puede exceder 100'),
    concepto: zod_1.z.string()
        .max(200, 'El concepto no puede exceder 200 caracteres')
        .optional()
});
exports.queryItemsSchema = zod_1.z.object({
    limit: zod_1.z.number().int().positive().max(100).default(20).optional(),
    offset: zod_1.z.number().int().min(0).default(0).optional()
});
//# sourceMappingURL=item-cuota.dto.js.map