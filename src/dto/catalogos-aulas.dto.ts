import { z } from 'zod';

// ============================================================================
// TIPOS DE AULAS
// ============================================================================

export const createTipoAulaSchema = z.object({
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

export const updateTipoAulaSchema = createTipoAulaSchema.partial();

export type CreateTipoAulaDto = z.infer<typeof createTipoAulaSchema>;
export type UpdateTipoAulaDto = z.infer<typeof updateTipoAulaSchema>;

// ============================================================================
// ESTADOS DE AULAS
// ============================================================================

export const createEstadoAulaSchema = z.object({
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

export const updateEstadoAulaSchema = createEstadoAulaSchema.partial();

export type CreateEstadoAulaDto = z.infer<typeof createEstadoAulaSchema>;
export type UpdateEstadoAulaDto = z.infer<typeof updateEstadoAulaSchema>;

// ============================================================================
// QUERIES Y FILTROS PARA CATÁLOGOS DE AULAS
// ============================================================================

export const queryCatalogosAulasSchema = z.object({
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
  }, z.number().int().positive().max(100).default(50))
});

export type QueryCatalogosAulasDto = z.infer<typeof queryCatalogosAulasSchema>;

// ============================================================================
// QUERY ESPECÍFICO (con includeInactive y ordenamiento)
// ============================================================================

export const queryTiposAulasCatalogoSchema = z.object({
  includeInactive: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(false)),
  search: z.string().max(100).optional(),
  orderBy: z.enum(['codigo', 'nombre', 'orden', 'created_at']).default('orden'),
  orderDir: z.enum(['asc', 'desc']).default('asc')
});

export type QueryTiposAulasCatalogoDto = z.infer<typeof queryTiposAulasCatalogoSchema>;

// ============================================================================
// REORDER SCHEMA
// ============================================================================

export const reorderCatalogoAulasSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'Debe proporcionar al menos un ID')
});

export type ReorderCatalogoAulasDto = z.infer<typeof reorderCatalogoAulasSchema>;
