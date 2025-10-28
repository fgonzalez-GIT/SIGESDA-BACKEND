import { z } from 'zod';
import { TipoPersona } from '../types/enums';

// Base persona schema
const personaBaseSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(50),
  apellido: z.string().min(1, 'Apellido es requerido').max(50),
  dni: z.string().min(7, 'DNI debe tener al menos 7 caracteres').max(8),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().max(20).optional(),
  direccion: z.string().max(200).optional(),
  fechaNacimiento: z.string().datetime().optional(),
  observaciones: z.string().max(500).optional()
});

// Create persona DTOs with discriminated unions
export const createPersonaSchema = z.preprocess(
  (data: any) => {
    if (data && typeof data.tipo === 'string') {
      return { ...data, tipo: data.tipo.toUpperCase() };
    }
    return data;
  },
  z.discriminatedUnion('tipo', [
    // SOCIO
    z.object({
      ...personaBaseSchema.shape,
      tipo: z.literal(TipoPersona.SOCIO),
      categoriaId: z.number().int().positive('ID de categoría inválido'),
      fechaIngreso: z.string().datetime().optional(),
      numeroSocio: z.number().int().positive().optional()
    }),

    // NO_SOCIO
    z.object({
      ...personaBaseSchema.shape,
      tipo: z.literal(TipoPersona.NO_SOCIO)
    }),

    // DOCENTE
    z.object({
      ...personaBaseSchema.shape,
      tipo: z.literal(TipoPersona.DOCENTE),
      especialidad: z.string().min(1, 'Especialidad es requerida').max(100),
      honorariosPorHora: z.number().positive().optional()
    }),

    // PROVEEDOR
    z.object({
      ...personaBaseSchema.shape,
      tipo: z.literal(TipoPersona.PROVEEDOR),
      cuit: z.string().min(11, 'CUIT debe tener 11 caracteres').max(11),
      razonSocial: z.string().min(1, 'Razón social es requerida').max(100)
    })
  ])
);

// Update persona schema (partial) - allows updates without requiring tipo
export const updatePersonaSchema = z.preprocess(
  (data: any) => {
    if (data && typeof data.tipo === 'string') {
      return { ...data, tipo: data.tipo.toUpperCase() };
    }
    return data;
  },
  z.union([
    // When tipo is provided, validate according to specific type
    z.discriminatedUnion('tipo', [
      z.object({
        tipo: z.literal(TipoPersona.SOCIO),
        ...personaBaseSchema.partial().shape,
        categoriaId: z.number().int().positive('ID de categoría inválido').optional(),
        fechaIngreso: z.string().datetime().optional(),
        fechaBaja: z.string().datetime().optional(),
        motivoBaja: z.string().max(200).optional()
      }),

      z.object({
        tipo: z.literal(TipoPersona.NO_SOCIO),
        ...personaBaseSchema.partial().shape
      }),

      z.object({
        tipo: z.literal(TipoPersona.DOCENTE),
        ...personaBaseSchema.partial().shape,
        especialidad: z.string().max(100).optional(),
        honorariosPorHora: z.number().positive().optional()
      }),

      z.object({
        tipo: z.literal(TipoPersona.PROVEEDOR),
        ...personaBaseSchema.partial().shape,
        cuit: z.string().min(11).max(11).optional(),
        razonSocial: z.string().max(100).optional()
      })
    ]),
    // When tipo is not provided, allow basic persona fields only
    z.object({
      ...personaBaseSchema.partial().shape,
      categoriaId: z.number().int().positive('ID de categoría inválido').optional(),
      fechaIngreso: z.string().datetime().optional(),
      fechaBaja: z.string().datetime().optional(),
      motivoBaja: z.string().max(200).optional(),
      especialidad: z.string().max(100).optional(),
      honorariosPorHora: z.number().positive().optional(),
      cuit: z.string().min(11).max(11).optional(),
      razonSocial: z.string().max(100).optional()
    })
  ])
);

// Query filters
export const personaQuerySchema = z.object({
  tipo: z.nativeEnum(TipoPersona).optional(),
  categoriaId: z.number().int().positive().optional(),
  activo: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  search: z.string().optional(), // Search by name, dni, email
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10))
});

export type CreatePersonaDto = z.infer<typeof createPersonaSchema>;
export type UpdatePersonaDto = z.infer<typeof updatePersonaSchema>;
export type PersonaQueryDto = z.infer<typeof personaQuerySchema>;