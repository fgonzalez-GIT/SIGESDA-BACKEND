import { z } from 'zod';

// ======================================================================
// DTOs para Gestión de Tipos de Persona
// ======================================================================

/**
 * Schema para crear un nuevo tipo de persona
 */
export const createTipoPersonaSchema = z.object({
  codigo: z.string()
    .min(2, 'Código debe tener al menos 2 caracteres')
    .max(50, 'Código debe tener máximo 50 caracteres')
    .regex(/^[A-Z_]+$/, 'Código debe ser en MAYÚSCULAS y guiones bajos (ej: TIPO_NUEVO)'),
  nombre: z.string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre debe tener máximo 100 caracteres'),
  descripcion: z.string()
    .max(500, 'Descripción debe tener máximo 500 caracteres')
    .optional(),
  activo: z.boolean().default(true),
  orden: z.number().int().min(0).default(0),

  // Configuración de campos requeridos (opcional)
  requiereCategoriaId: z.boolean().default(false).optional(),
  requiereEspecialidadId: z.boolean().default(false).optional(),
  requiereCuit: z.boolean().default(false).optional(),
  requiereRazonSocial: z.boolean().default(false).optional()
});

/**
 * Schema para actualizar un tipo de persona existente
 */
export const updateTipoPersonaSchema = z.object({
  nombre: z.string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre debe tener máximo 100 caracteres')
    .optional(),
  descripcion: z.string()
    .max(500, 'Descripción debe tener máximo 500 caracteres')
    .optional()
    .nullable(),
  activo: z.boolean().optional(),
  orden: z.number().int().min(0).optional(),
  requiereCategoriaId: z.boolean().optional(),
  requiereEspecialidadId: z.boolean().optional(),
  requiereCuit: z.boolean().optional(),
  requiereRazonSocial: z.boolean().optional()
});

/**
 * Schema para activar/desactivar un tipo de persona
 */
export const toggleActivoSchema = z.object({
  activo: z.boolean({
    required_error: 'El campo activo es requerido',
    invalid_type_error: 'El campo activo debe ser boolean'
  })
});

// ======================================================================
// DTOs para Gestión de Especialidades de Docentes
// ======================================================================

/**
 * Schema para crear una nueva especialidad docente
 */
export const createEspecialidadSchema = z.object({
  codigo: z.string()
    .min(2, 'Código debe tener al menos 2 caracteres')
    .max(50, 'Código debe tener máximo 50 caracteres')
    .regex(/^[A-Z_]+$/, 'Código debe ser en MAYÚSCULAS y guiones bajos (ej: ESPECIALIDAD_NUEVA)'),
  nombre: z.string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre debe tener máximo 100 caracteres'),
  descripcion: z.string()
    .max(500, 'Descripción debe tener máximo 500 caracteres')
    .optional(),
  activo: z.boolean().default(true),
  orden: z.number().int().min(0).default(0)
});

/**
 * Schema para actualizar una especialidad existente
 */
export const updateEspecialidadSchema = z.object({
  nombre: z.string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre debe tener máximo 100 caracteres')
    .optional(),
  descripcion: z.string()
    .max(500, 'Descripción debe tener máximo 500 caracteres')
    .optional()
    .nullable(),
  activo: z.boolean().optional(),
  orden: z.number().int().min(0).optional()
});

// ======================================================================
// Tipos TypeScript
// ======================================================================

export type CreateTipoPersonaDto = z.infer<typeof createTipoPersonaSchema>;
export type UpdateTipoPersonaDto = z.infer<typeof updateTipoPersonaSchema>;
export type ToggleActivoDto = z.infer<typeof toggleActivoSchema>;

export type CreateEspecialidadDto = z.infer<typeof createEspecialidadSchema>;
export type UpdateEspecialidadDto = z.infer<typeof updateEspecialidadSchema>;

// ======================================================================
// Constantes
// ======================================================================

/**
 * Tipos de persona del sistema que no se pueden eliminar
 */
export const TIPOS_SISTEMA_PROTEGIDOS = [
  'NO_SOCIO',
  'SOCIO',
  'DOCENTE',
  'PROVEEDOR'
] as const;

/**
 * Especialidades del sistema que no se pueden eliminar
 */
export const ESPECIALIDADES_SISTEMA_PROTEGIDAS = [
  'GENERAL'
] as const;
