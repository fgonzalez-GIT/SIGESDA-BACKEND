import { z } from 'zod';
import { TipoParentesco } from '@prisma/client';

// Create familiar schema
export const createFamiliarSchema = z.object({
  socioId: z.number().int().positive('ID de socio inválido'),
  familiarId: z.number().int().positive('ID de familiar inválido'),
  parentesco: z.nativeEnum(TipoParentesco, {
    errorMap: () => ({ message: 'Tipo de parentesco inválido' })
  }),
  descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  permisoResponsableFinanciero: z.boolean().default(false),
  permisoContactoEmergencia: z.boolean().default(false),
  permisoAutorizadoRetiro: z.boolean().default(false),
  descuento: z.number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .default(0),
  activo: z.boolean().default(true),
  grupoFamiliarId: z.number().int().positive().optional().nullable()
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
  }).optional(),
  descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().nullable(),
  permisoResponsableFinanciero: z.boolean().optional(),
  permisoContactoEmergencia: z.boolean().optional(),
  permisoAutorizadoRetiro: z.boolean().optional(),
  descuento: z.number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .optional(),
  activo: z.boolean().optional(),
  grupoFamiliarId: z.number().int().positive().optional().nullable()
});

// Query filters
export const familiarQuerySchema = z.object({
  socioId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  familiarId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  parentesco: z.nativeEnum(TipoParentesco).optional(),
  grupoFamiliarId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  includeInactivos: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(false)),
  soloActivos: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(true)),
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
  ids: z.array(z.number().int().positive()).min(1, 'Debe proporcionar al menos un ID')
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