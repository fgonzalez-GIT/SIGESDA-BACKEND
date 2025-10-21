import { z } from 'zod';

// ============================================================================
// TIPOS DE ACTIVIDADES
// ============================================================================

export const createTipoActividadSchema = z.object({
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

export const updateTipoActividadSchema = createTipoActividadSchema.partial();

export type CreateTipoActividadDto = z.infer<typeof createTipoActividadSchema>;
export type UpdateTipoActividadDto = z.infer<typeof updateTipoActividadSchema>;

// ============================================================================
// CATEGORÍAS DE ACTIVIDADES
// ============================================================================

export const createCategoriaActividadSchema = z.object({
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

export const updateCategoriaActividadSchema = createCategoriaActividadSchema.partial();

export type CreateCategoriaActividadDto = z.infer<typeof createCategoriaActividadSchema>;
export type UpdateCategoriaActividadDto = z.infer<typeof updateCategoriaActividadSchema>;

// ============================================================================
// ESTADOS DE ACTIVIDADES
// ============================================================================

export const createEstadoActividadSchema = z.object({
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

export const updateEstadoActividadSchema = createEstadoActividadSchema.partial();

export type CreateEstadoActividadDto = z.infer<typeof createEstadoActividadSchema>;
export type UpdateEstadoActividadDto = z.infer<typeof updateEstadoActividadSchema>;

// ============================================================================
// DÍAS DE LA SEMANA (SOLO LECTURA - NO SE CREAN)
// ============================================================================

export const diaSemanaSchema = z.object({
  id: z.number().int().positive(),
  codigo: z.string().max(20),
  nombre: z.string().max(50),
  orden: z.number().int()
});

export type DiaSemanaDto = z.infer<typeof diaSemanaSchema>;

// ============================================================================
// ROLES DE DOCENTES
// ============================================================================

export const createRolDocenteSchema = z.object({
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

export const updateRolDocenteSchema = createRolDocenteSchema.partial();

export type CreateRolDocenteDto = z.infer<typeof createRolDocenteSchema>;
export type UpdateRolDocenteDto = z.infer<typeof updateRolDocenteSchema>;

// ============================================================================
// QUERIES Y FILTROS PARA CATÁLOGOS
// ============================================================================

export const queryCatalogosSchema = z.object({
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

export type QueryCatalogosDto = z.infer<typeof queryCatalogosSchema>;

// ============================================================================
// QUERY ESPECÍFICO PARA TIPOS Y CATEGORÍAS (con includeInactive)
// ============================================================================

export const queryTiposCatalogoSchema = z.object({
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

export type QueryTiposCatalogoDto = z.infer<typeof queryTiposCatalogoSchema>;

// ============================================================================
// REORDER SCHEMA
// ============================================================================

export const reorderCatalogoSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'Debe proporcionar al menos un ID')
});

export type ReorderCatalogoDto = z.infer<typeof reorderCatalogoSchema>;
