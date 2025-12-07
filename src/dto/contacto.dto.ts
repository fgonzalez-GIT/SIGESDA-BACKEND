/**
 * DTOs para Contactos de Personas
 * Incluye validaciones para ContactoPersona y TipoContactoCatalogo
 */

import { z } from 'zod';

// ============================================================================
// DTOs: CONTACTO PERSONA
// ============================================================================

/**
 * DTO para crear un contacto de persona
 */
export const createContactoPersonaSchema = z.object({
  tipoContactoId: z.number().int().positive({
    message: 'El tipo de contacto es requerido y debe ser un número positivo'
  }),
  valor: z.string().min(1, 'El valor del contacto es requerido').max(200, 'El valor no puede exceder 200 caracteres'),
  principal: z.boolean().default(false),
  observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional(),
  activo: z.boolean().default(true)
});

/**
 * DTO para actualizar un contacto de persona
 */
export const updateContactoPersonaSchema = z.object({
  tipoContactoId: z.number().int().positive().optional(),
  valor: z.string().min(1).max(200).optional(),
  principal: z.boolean().optional(),
  observaciones: z.string().max(500).optional().nullable(),
  activo: z.boolean().optional()
});

// ============================================================================
// DTOs: TIPO CONTACTO CATÁLOGO (Admin)
// ============================================================================

/**
 * DTO para crear un tipo de contacto en el catálogo
 */
export const createTipoContactoSchema = z.object({
  codigo: z.string()
    .min(1, 'El código es requerido')
    .max(50, 'El código no puede exceder 50 caracteres')
    .toUpperCase()
    .regex(/^[A-Z_]+$/, 'El código debe contener solo letras mayúsculas y guiones bajos'),
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  icono: z.string()
    .max(50, 'El icono no puede exceder 50 caracteres')
    .optional()
    .nullable(),
  pattern: z.string()
    .max(500, 'El patrón de validación no puede exceder 500 caracteres')
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true; // Si es null/undefined, es válido
        try {
          new RegExp(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'El patrón debe ser una expresión regular válida' }
    ),
  activo: z.boolean().default(true),
  orden: z.number().int().min(0, 'El orden debe ser un número positivo o cero').default(0)
});

/**
 * DTO para actualizar un tipo de contacto en el catálogo
 */
export const updateTipoContactoSchema = createTipoContactoSchema.partial();

/**
 * DTO para consultar tipos de contacto
 */
export const getTiposContactoSchema = z.object({
  soloActivos: z.boolean().default(true).optional(),
  ordenarPor: z.enum(['orden', 'nombre', 'codigo']).default('orden').optional()
});

// ============================================================================
// TYPES
// ============================================================================

export type CreateContactoPersonaDto = z.infer<typeof createContactoPersonaSchema>;
export type UpdateContactoPersonaDto = z.infer<typeof updateContactoPersonaSchema>;
export type CreateTipoContactoDto = z.infer<typeof createTipoContactoSchema>;
export type UpdateTipoContactoDto = z.infer<typeof updateTipoContactoSchema>;
export type GetTiposContactoDto = z.infer<typeof getTiposContactoSchema>;
