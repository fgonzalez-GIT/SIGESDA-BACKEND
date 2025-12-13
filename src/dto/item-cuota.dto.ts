import { z } from 'zod';

// ============================
// CATEGORÍA ITEM DTOs
// ============================

/**
 * DTO para crear categoría de ítem
 */
export const createCategoriaItemSchema = z.object({
  codigo: z.string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9_]+$/, 'El código debe contener solo letras mayúsculas, números y guiones bajos'),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  icono: z.string()
    .max(10, 'El ícono no puede exceder 10 caracteres')
    .optional(),
  color: z.string()
    .max(20, 'El color no puede exceder 20 caracteres')
    .regex(/^(#[0-9A-Fa-f]{6}|[a-z]+)$/, 'El color debe ser un hex válido (#RRGGBB) o nombre de color')
    .optional(),
  orden: z.number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .optional()
});

export type CreateCategoriaItemDto = z.infer<typeof createCategoriaItemSchema>;

/**
 * DTO para actualizar categoría de ítem
 */
export const updateCategoriaItemSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  icono: z.string()
    .max(10, 'El ícono no puede exceder 10 caracteres')
    .optional(),
  color: z.string()
    .max(20, 'El color no puede exceder 20 caracteres')
    .regex(/^(#[0-9A-Fa-f]{6}|[a-z]+)$/, 'El color debe ser un hex válido (#RRGGBB) o nombre de color')
    .optional(),
  orden: z.number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .optional(),
  activo: z.boolean().optional()
});

export type UpdateCategoriaItemDto = z.infer<typeof updateCategoriaItemSchema>;

/**
 * DTO para reordenar categorías
 */
export const reorderCategoriasSchema = z.object({
  ordenamiento: z.array(z.object({
    id: z.number().int().positive('ID inválido'),
    orden: z.number().int().min(0, 'El orden no puede ser negativo')
  })).min(1, 'Debe especificar al menos una categoría')
});

export type ReorderCategoriasDto = z.infer<typeof reorderCategoriasSchema>;

// ============================
// TIPO ITEM CUOTA DTOs
// ============================

/**
 * DTO para crear tipo de ítem de cuota
 */
export const createTipoItemCuotaSchema = z.object({
  codigo: z.string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(100, 'El código no puede exceder 100 caracteres')
    .regex(/^[A-Z0-9_]+$/, 'El código debe contener solo letras mayúsculas, números y guiones bajos'),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  categoriaItemId: z.number()
    .int('ID de categoría inválido')
    .positive('ID de categoría debe ser positivo'),
  esCalculado: z.boolean()
    .default(true),
  formula: z.any().optional(), // JSON object
  orden: z.number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .optional(),
  configurable: z.boolean()
    .default(true)
}).refine((data) => {
  // Si es calculado, debe tener fórmula
  if (data.esCalculado && !data.formula) {
    return false;
  }
  return true;
}, {
  message: 'Los tipos calculados deben tener una fórmula',
  path: ['formula']
});

export type CreateTipoItemCuotaDto = z.infer<typeof createTipoItemCuotaSchema>;

/**
 * DTO para actualizar tipo de ítem de cuota
 */
export const updateTipoItemCuotaSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional(),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  categoriaItemId: z.number()
    .int('ID de categoría inválido')
    .positive('ID de categoría debe ser positivo')
    .optional(),
  esCalculado: z.boolean().optional(),
  formula: z.any().optional(),
  orden: z.number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .optional(),
  configurable: z.boolean().optional(),
  activo: z.boolean().optional()
});

export type UpdateTipoItemCuotaDto = z.infer<typeof updateTipoItemCuotaSchema>;

/**
 * DTO para actualizar solo la fórmula
 */
export const updateFormulaSchema = z.object({
  formula: z.any()
});

export type UpdateFormulaDto = z.infer<typeof updateFormulaSchema>;

/**
 * DTO para clonar tipo de ítem
 */
export const cloneTipoItemSchema = z.object({
  nuevoCodigo: z.string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(100, 'El código no puede exceder 100 caracteres')
    .regex(/^[A-Z0-9_]+$/, 'El código debe contener solo letras mayúsculas, números y guiones bajos'),
  nuevoNombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
});

export type CloneTipoItemDto = z.infer<typeof cloneTipoItemSchema>;

/**
 * DTO para reordenar tipos de ítems
 */
export const reorderTiposItemSchema = z.object({
  ordenamiento: z.array(z.object({
    id: z.number().int().positive('ID inválido'),
    orden: z.number().int().min(0, 'El orden no puede ser negativo')
  })).min(1, 'Debe especificar al menos un tipo de ítem')
});

export type ReorderTiposItemDto = z.infer<typeof reorderTiposItemSchema>;

// ============================
// ITEM CUOTA DTOs
// ============================

/**
 * DTO para agregar ítem manual a cuota
 */
export const addManualItemSchema = z.object({
  cuotaId: z.number()
    .int('ID de cuota inválido')
    .positive('ID de cuota debe ser positivo'),
  tipoItemCodigo: z.string()
    .min(2, 'Código de tipo de ítem inválido'),
  concepto: z.string()
    .max(200, 'El concepto no puede exceder 200 caracteres')
    .optional(),
  monto: z.number()
    .refine((val) => val !== 0, 'El monto no puede ser cero'),
  cantidad: z.number()
    .positive('La cantidad debe ser mayor a cero')
    .default(1),
  porcentaje: z.number()
    .min(-100, 'El porcentaje debe ser mayor o igual a -100')
    .max(100, 'El porcentaje debe ser menor o igual a 100')
    .optional(),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional(),
  metadata: z.any().optional() // JSON object
});

export type AddManualItemDto = z.infer<typeof addManualItemSchema>;

/**
 * DTO para actualizar ítem editable
 */
export const updateItemCuotaSchema = z.object({
  monto: z.number()
    .refine((val) => val !== 0, 'El monto no puede ser cero')
    .optional(),
  cantidad: z.number()
    .positive('La cantidad debe ser mayor a cero')
    .optional(),
  porcentaje: z.number()
    .min(-100, 'El porcentaje debe ser mayor o igual a -100')
    .max(100, 'El porcentaje debe ser menor o igual a 100')
    .optional(),
  concepto: z.string()
    .max(200, 'El concepto no puede exceder 200 caracteres')
    .optional(),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional(),
  metadata: z.any().optional()
});

export type UpdateItemCuotaDto = z.infer<typeof updateItemCuotaSchema>;

/**
 * DTO para regenerar todos los ítems de una cuota
 */
export const regenerarItemsSchema = z.object({
  items: z.array(z.object({
    tipoItemId: z.number().int().positive('ID de tipo de ítem inválido'),
    concepto: z.string().max(200, 'El concepto no puede exceder 200 caracteres'),
    monto: z.number(),
    cantidad: z.number().positive('La cantidad debe ser mayor a cero').default(1),
    porcentaje: z.number().min(-100).max(100).optional(),
    esAutomatico: z.boolean().default(true),
    esEditable: z.boolean().default(false),
    observaciones: z.string().max(500).optional(),
    metadata: z.any().optional()
  })).min(1, 'Debe especificar al menos un ítem')
});

export type RegenerarItemsDto = z.infer<typeof regenerarItemsSchema>;

/**
 * DTO para aplicar descuento global
 */
export const aplicarDescuentoGlobalSchema = z.object({
  porcentaje: z.number()
    .positive('El porcentaje debe ser mayor a 0')
    .max(100, 'El porcentaje no puede exceder 100'),
  concepto: z.string()
    .max(200, 'El concepto no puede exceder 200 caracteres')
    .optional()
});

export type AplicarDescuentoGlobalDto = z.infer<typeof aplicarDescuentoGlobalSchema>;

/**
 * DTO para consultar ítems con filtros
 */
export const queryItemsSchema = z.object({
  limit: z.number().int().positive().max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional()
});

export type QueryItemsDto = z.infer<typeof queryItemsSchema>;
