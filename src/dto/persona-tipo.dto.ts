import { z } from 'zod';
import { TipoContacto } from '@prisma/client';

// ======================================================================
// DTOs para PersonaTipo
// ======================================================================

// Esquema base para datos de tipo persona
const personaTipoBaseSchema = z.object({
  tipoPersonaId: z.number().int().positive('ID de tipo de persona inválido').optional(),
  tipoPersonaCodigo: z.string().min(1, 'Código de tipo es requerido').optional(),
  observaciones: z.string().max(500).optional(),
  activo: z.boolean().default(true)
});

// Esquema para datos específicos de SOCIO
const socioDataSchema = z.object({
  categoriaId: z.number().int().positive('ID de categoría inválido'),
  numeroSocio: z.number().int().positive().optional(),
  fechaIngreso: z.string().datetime().optional(),
  fechaBaja: z.string().datetime().optional(),
  motivoBaja: z.string().max(200).optional()
});

// Esquema para datos específicos de DOCENTE
const docenteDataSchema = z.object({
  especialidadId: z.number().int().positive('ID de especialidad inválido'),
  honorariosPorHora: z.number().nonnegative('Honorarios deben ser 0 o mayor').optional()
});

// Esquema para datos específicos de PROVEEDOR
const proveedorDataSchema = z.object({
  cuit: z.string().min(11, 'CUIT debe tener 11 caracteres').max(11, 'CUIT debe tener 11 caracteres'),
  razonSocialId: z.number().int().positive('ID de razón social inválido')
});

// Schema para crear asignación de tipo
export const createPersonaTipoSchema = z.object({
  ...personaTipoBaseSchema.shape,
  // Uno de estos dos debe estar presente
  tipoPersonaId: z.number().int().positive().optional(),
  tipoPersonaCodigo: z.enum(['NO_SOCIO', 'SOCIO', 'DOCENTE', 'PROVEEDOR']).optional(),

  // Datos específicos por tipo (opcionales según el tipo)
  categoriaId: z.number().int().positive().optional(),
  numeroSocio: z.number().int().positive().optional(),
  fechaIngreso: z.string().datetime().optional(),

  especialidadId: z.number().int().positive().optional(),
  honorariosPorHora: z.number().nonnegative().optional(),

  cuit: z.string().length(11).optional(),
  razonSocialId: z.number().int().positive().optional()
}).refine((data) => {
  // Al menos uno de los dos identificadores debe estar presente
  return data.tipoPersonaId !== undefined || data.tipoPersonaCodigo !== undefined;
}, {
  message: 'Debe proporcionar tipoPersonaId o tipoPersonaCodigo'
});

// Schema para actualizar asignación de tipo
export const updatePersonaTipoSchema = z.object({
  activo: z.boolean().optional(),
  fechaDesasignacion: z.string().datetime().optional(),

  // Datos específicos por tipo
  categoriaId: z.number().int().positive().optional(),
  fechaIngreso: z.string().datetime().optional(),
  fechaBaja: z.string().datetime().optional(),
  motivoBaja: z.string().max(200).optional(),

  especialidadId: z.number().int().positive().optional(),
  honorariosPorHora: z.number().nonnegative().optional(),

  cuit: z.string().length(11).optional(),
  razonSocialId: z.number().int().positive().optional(),

  observaciones: z.string().max(500).optional()
});

// ======================================================================
// DTOs para ContactoPersona
// ======================================================================

export const createContactoPersonaSchema = z.object({
  tipoContacto: z.nativeEnum(TipoContacto, {
    errorMap: () => ({ message: 'Tipo de contacto inválido' })
  }),
  valor: z.string().min(1, 'El valor del contacto es requerido').max(200),
  principal: z.boolean().default(false),
  observaciones: z.string().max(500).optional(),
  activo: z.boolean().default(true)
});

export const updateContactoPersonaSchema = z.object({
  tipoContacto: z.nativeEnum(TipoContacto).optional(),
  valor: z.string().min(1).max(200).optional(),
  principal: z.boolean().optional(),
  observaciones: z.string().max(500).optional(),
  activo: z.boolean().optional()
});

// ======================================================================
// Tipos TypeScript
// ======================================================================

export type CreatePersonaTipoDto = z.infer<typeof createPersonaTipoSchema>;
export type UpdatePersonaTipoDto = z.infer<typeof updatePersonaTipoSchema>;
export type CreateContactoPersonaDto = z.infer<typeof createContactoPersonaSchema>;
export type UpdateContactoPersonaDto = z.infer<typeof updateContactoPersonaSchema>;

// ======================================================================
// Tipos de datos por tipo de persona (para validación)
// ======================================================================

export interface SocioData {
  categoriaId: number;
  numeroSocio?: number;
  fechaIngreso?: Date;
  fechaBaja?: Date;
  motivoBaja?: string;
}

export interface DocenteData {
  especialidadId: number;
  honorariosPorHora?: number;
}

export interface ProveedorData {
  cuit: string;
  razonSocialId: number;
}
