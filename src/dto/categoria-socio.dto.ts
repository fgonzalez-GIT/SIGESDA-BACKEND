import { z } from 'zod';

// DTO para crear categoría de socio
export const createCategoriaSocioSchema = z.object({
  codigo: z.string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(30, 'El código no puede exceder 30 caracteres')
    .regex(/^[A-Z_]+$/, 'El código solo puede contener mayúsculas y guiones bajos')
    .transform(val => val.toUpperCase()),
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  descripcion: z.string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional(),
  montoCuota: z.number()
    .min(0, 'El monto debe ser mayor o igual a 0')
    .max(1000000, 'El monto no puede exceder $1,000,000'),
  descuento: z.number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .default(0),
  activa: z.boolean().default(true),
  orden: z.number().int().min(0).default(0)
});

export type CreateCategoriaSocioDto = z.infer<typeof createCategoriaSocioSchema>;

// DTO para actualizar categoría de socio
export const updateCategoriaSocioSchema = z.object({
  codigo: z.string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(30, 'El código no puede exceder 30 caracteres')
    .regex(/^[A-Z_]+$/, 'El código solo puede contener mayúsculas y guiones bajos')
    .transform(val => val.toUpperCase())
    .optional(),
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .optional(),
  descripcion: z.string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional(),
  montoCuota: z.number()
    .min(0, 'El monto debe ser mayor o igual a 0')
    .max(1000000, 'El monto no puede exceder $1,000,000')
    .optional(),
  descuento: z.number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .optional(),
  activa: z.boolean().optional(),
  orden: z.number().int().min(0).optional()
});

export type UpdateCategoriaSocioDto = z.infer<typeof updateCategoriaSocioSchema>;

// DTO para query de categorías
export const categoriaSocioQuerySchema = z.object({
  includeInactive: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  search: z.string().optional()
});

export type CategoriaSocioQueryDto = z.infer<typeof categoriaSocioQuerySchema>;
