import { z } from 'zod';

// ============================================================================
// ESTADOS DE RESERVAS
// ============================================================================

export const createEstadoReservaSchema = z.object({
  codigo: z.string()
    .min(1, 'El código es requerido')
    .max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z_]+$/, 'El código debe estar en mayúsculas y usar guiones bajos'),
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  activo: z.boolean().default(true),
  orden: z.number().int().nonnegative().default(0)
});

export const updateEstadoReservaSchema = createEstadoReservaSchema.partial();

export type CreateEstadoReservaDto = z.infer<typeof createEstadoReservaSchema>;
export type UpdateEstadoReservaDto = z.infer<typeof updateEstadoReservaSchema>;

// ============================================================================
// QUERIES Y FILTROS PARA CATÁLOGO DE ESTADOS DE RESERVAS
// ============================================================================

export const queryEstadosReservasSchema = z.object({
  activo: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  search: z.string().max(100).optional(),
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 50 : parsed;
  }, z.number().int().positive().max(100).default(50)),
  includeInactive: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(false)),
  orderBy: z.enum(['codigo', 'nombre', 'orden', 'created_at']).default('orden'),
  orderDir: z.enum(['asc', 'desc']).default('asc')
});

export type QueryEstadosReservasDto = z.infer<typeof queryEstadosReservasSchema>;

// ============================================================================
// REORDER SCHEMA
// ============================================================================

export const reorderEstadosReservasSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'Debe proporcionar al menos un ID')
});

export type ReorderEstadosReservasDto = z.infer<typeof reorderEstadosReservasSchema>;
