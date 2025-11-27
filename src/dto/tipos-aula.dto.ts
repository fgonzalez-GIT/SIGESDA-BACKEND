import { z } from 'zod';

// ============================================================================
// TIPOS DE AULA
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
// REORDENAR TIPOS DE AULA
// ============================================================================

export const reorderTipoAulaSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'Se requiere al menos un ID')
});

export type ReorderTipoAulaDto = z.infer<typeof reorderTipoAulaSchema>;
