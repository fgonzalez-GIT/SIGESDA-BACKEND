import { z } from 'zod';

// ============================================================================
// ESTADOS DE EQUIPAMIENTO
// ============================================================================

export const createEstadoEquipamientoSchema = z.object({
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

export const updateEstadoEquipamientoSchema = createEstadoEquipamientoSchema.partial();

export type CreateEstadoEquipamientoDto = z.infer<typeof createEstadoEquipamientoSchema>;
export type UpdateEstadoEquipamientoDto = z.infer<typeof updateEstadoEquipamientoSchema>;

// ============================================================================
// REORDENAR ESTADOS DE EQUIPAMIENTO
// ============================================================================

export const reorderEstadoEquipamientoSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'Se requiere al menos un ID')
});

export type ReorderEstadoEquipamientoDto = z.infer<typeof reorderEstadoEquipamientoSchema>;
