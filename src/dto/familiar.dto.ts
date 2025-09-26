import { z } from 'zod';
import { TipoParentesco } from '@prisma/client';

// Create familiar schema
export const createFamiliarSchema = z.object({
  socioId: z.string().cuid('ID de socio inválido'),
  familiarId: z.string().cuid('ID de familiar inválido'),
  parentesco: z.nativeEnum(TipoParentesco, {
    errorMap: () => ({ message: 'Tipo de parentesco inválido' })
  })
}).refine(
  (data) => data.socioId !== data.familiarId,
  {
    message: 'Una persona no puede ser familiar de sí misma',
    path: ['familiarId']
  }
);

// Update familiar schema
export const updateFamiliarSchema = z.object({
  parentesco: z.nativeEnum(TipoParentesco, {
    errorMap: () => ({ message: 'Tipo de parentesco inválido' })
  }).optional()
});

// Query filters
export const familiarQuerySchema = z.object({
  socioId: z.string().cuid().optional(),
  familiarId: z.string().cuid().optional(),
  parentesco: z.nativeEnum(TipoParentesco).optional(),
  includeInactivos: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(false)),
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10))
});

// Bulk operations schemas
export const createBulkFamiliaresSchema = z.object({
  familiares: z.array(createFamiliarSchema).min(1, 'Debe proporcionar al menos una relación familiar')
});

export const deleteBulkFamiliaresSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'Debe proporcionar al menos un ID')
});

// Search schema for advanced filtering
export const familiarSearchSchema = z.object({
  search: z.string().min(1, 'Término de búsqueda requerido'),
  searchBy: z.enum(['nombre', 'dni', 'email', 'all']).default('all'),
  parentesco: z.nativeEnum(TipoParentesco).optional(),
  includeInactivos: z.boolean().default(false)
});

export type CreateFamiliarDto = z.infer<typeof createFamiliarSchema>;
export type UpdateFamiliarDto = z.infer<typeof updateFamiliarSchema>;
export type FamiliarQueryDto = z.infer<typeof familiarQuerySchema>;
export type CreateBulkFamiliaresDto = z.infer<typeof createBulkFamiliaresSchema>;
export type DeleteBulkFamiliaresDto = z.infer<typeof deleteBulkFamiliaresSchema>;
export type FamiliarSearchDto = z.infer<typeof familiarSearchSchema>;