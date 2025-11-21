import { z } from 'zod';
import { TipoContacto } from '@prisma/client';
import { createPersonaTipoSchema, createContactoPersonaSchema } from './persona-tipo.dto';

// ======================================================================
// SCHEMAS BASE
// ======================================================================

// Schema base de persona (sin tipo ni campos específicos)
const personaBaseSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100),
  apellido: z.string().min(1, 'Apellido es requerido').max(100),
  dni: z.string().min(7, 'DNI debe tener al menos 7 caracteres').max(8, 'DNI debe tener máximo 8 caracteres'),
  email: z.string().email('Email inválido').max(150).optional(),
  telefono: z.string().max(20).optional(),
  direccion: z.string().max(200).optional(),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
  observaciones: z.string().max(500).optional()
});

// ======================================================================
// CREAR PERSONA (NUEVO MODELO)
// ======================================================================

export const createPersonaSchema = z.preprocess(
  (data: any) => {
    // Si existe el campo 'tipo', procesarlo
    if (data && data.tipo) {
      // Convertir tipo a tipos
      let tiposArray: any[] = [];

      if (Array.isArray(data.tipo)) {
        // Si tipo es array de strings
        tiposArray = data.tipo.map((codigo: string) => {
          const resultado: any = {
            tipoPersonaCodigo: codigo
          };

          // Si el tipo es SOCIO, agregar datos de socio
          if (codigo === 'SOCIO') {
            if (data.categoriaId) resultado.categoriaId = data.categoriaId;
            if (data.numeroSocio) resultado.numeroSocio = data.numeroSocio;
            if (data.fechaIngreso) resultado.fechaIngreso = data.fechaIngreso;
          }

          // Si el tipo es DOCENTE, agregar datos de docente
          if (codigo === 'DOCENTE') {
            if (data.especialidadId) resultado.especialidadId = data.especialidadId;
            if (data.honorariosPorHora) resultado.honorariosPorHora = data.honorariosPorHora;
          }

          // Si el tipo es PROVEEDOR, agregar datos de proveedor
          if (codigo === 'PROVEEDOR') {
            if (data.cuit) resultado.cuit = data.cuit;
            if (data.razonSocialId) resultado.razonSocialId = data.razonSocialId;
          }

          return resultado;
        });
      } else if (typeof data.tipo === 'string') {
        // Si tipo es un string simple
        const resultado: any = {
          tipoPersonaCodigo: data.tipo
        };

        if (data.tipo === 'SOCIO') {
          if (data.categoriaId) resultado.categoriaId = data.categoriaId;
          if (data.numeroSocio) resultado.numeroSocio = data.numeroSocio;
          if (data.fechaIngreso) resultado.fechaIngreso = data.fechaIngreso;
        }

        if (data.tipo === 'DOCENTE') {
          if (data.especialidadId) resultado.especialidadId = data.especialidadId;
          if (data.honorariosPorHora) resultado.honorariosPorHora = data.honorariosPorHora;
        }

        if (data.tipo === 'PROVEEDOR') {
          if (data.cuit) resultado.cuit = data.cuit;
          if (data.razonSocialId) resultado.razonSocialId = data.razonSocialId;
        }

        tiposArray = [resultado];
      }

      // Combinar con tipos existentes
      const tiposExistentes = data.tipos || [];
      const nuevosDatos = {
        ...data,
        tipos: [...tiposExistentes, ...tiposArray]
      };

      // Eliminar campos temporales
      delete nuevosDatos.tipo;
      delete nuevosDatos.categoriaId;
      delete nuevosDatos.numeroSocio;
      delete nuevosDatos.fechaIngreso;
      delete nuevosDatos.especialidadId;
      delete nuevosDatos.honorariosPorHora;
      delete nuevosDatos.cuit;
      delete nuevosDatos.razonSocialId;

      return nuevosDatos;
    }

    return data;
  },
  z.object({
    // Datos base (obligatorios)
    ...personaBaseSchema.shape,

    // Tipos opcionales en creación
    tipos: z.array(createPersonaTipoSchema).optional().default([]),

    // Contactos opcionales
    contactos: z.array(createContactoPersonaSchema).optional().default([])
  })
);

// ======================================================================
// ACTUALIZAR PERSONA
// ======================================================================

export const updatePersonaSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  apellido: z.string().min(1).max(100).optional(),
  dni: z.string().min(7).max(8).optional(),
  email: z.string().email().max(150).optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
  direccion: z.string().max(200).optional().nullable(),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional().nullable(),
  observaciones: z.string().max(500).optional().nullable(),

  // Campos de soft delete
  activo: z.boolean().optional(),
  fechaBaja: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional().nullable(),
  motivoBaja: z.string().max(500).optional().nullable(),

  // Tipos y contactos (opcional - si se envían, se sincronizan)
  tipos: z.array(createPersonaTipoSchema).optional(),
  contactos: z.array(createContactoPersonaSchema).optional()
});

// ======================================================================
// QUERY FILTERS
// ======================================================================

export const personaQuerySchema = z.object({
  // Filtros por tipo (pueden ser múltiples)
  tiposCodigos: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val.split(',').map((s: string) => s.trim());
      }
      return val;
    },
    z.array(z.enum(['NO_SOCIO', 'SOCIO', 'DOCENTE', 'PROVEEDOR'])).optional()
  ),

  // Filtro por categoría de socio
  categoriaId: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().optional()
  ),

  // Filtro por especialidad de docente
  especialidadId: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().optional()
  ),

  // Filtro por estado activo
  activo: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val === 'true';
      }
      return val;
    },
    z.boolean().optional()
  ),

  // Búsqueda por nombre, dni, email
  search: z.string().optional(),

  // Paginación (OPCIONAL - si no se especifica, devuelve todos los registros)
  page: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().optional()
  ),

  limit: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().max(100).optional()
  ),

  // Incluir relaciones (SIEMPRE TRUE para devolver todas las relaciones)
  includeTipos: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val === 'true';
      }
      return val !== undefined ? val : true; // Default TRUE
    },
    z.boolean().default(true)
  ),

  includeContactos: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val === 'true';
      }
      return val !== undefined ? val : true; // Default TRUE
    },
    z.boolean().default(true)
  )
});

// ======================================================================
// SCHEMAS DE RETROCOMPATIBILIDAD (LEGACY)
// ======================================================================

// Para mantener compatibilidad con el sistema anterior
// Este schema se puede usar en una API v1 legacy
export const createPersonaLegacySchema = z.preprocess(
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
      tipo: z.literal('SOCIO'),
      categoriaId: z.number().int().positive('ID de categoría inválido'),
      fechaIngreso: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
      numeroSocio: z.number().int().positive().optional()
    }),

    // NO_SOCIO
    z.object({
      ...personaBaseSchema.shape,
      tipo: z.literal('NO_SOCIO')
    }),

    // DOCENTE
    z.object({
      ...personaBaseSchema.shape,
      tipo: z.literal('DOCENTE'),
      especialidad: z.string().min(1, 'Especialidad es requerida').max(100),
      honorariosPorHora: z.number().nonnegative('Honorarios deben ser 0 o mayor').optional()
    }),

    // PROVEEDOR
    z.object({
      ...personaBaseSchema.shape,
      tipo: z.literal('PROVEEDOR'),
      cuit: z.string().min(11, 'CUIT debe tener 11 caracteres').max(11),
      razonSocialId: z.number().int().positive('ID de razón social inválido')
    })
  ])
);

// ======================================================================
// TIPOS TYPESCRIPT
// ======================================================================

export type CreatePersonaDto = z.infer<typeof createPersonaSchema>;
export type UpdatePersonaDto = z.infer<typeof updatePersonaSchema>;
export type PersonaQueryDto = z.infer<typeof personaQuerySchema>;
export type CreatePersonaLegacyDto = z.infer<typeof createPersonaLegacySchema>;

// ======================================================================
// VALIDACIÓN DE LÓGICA DE NEGOCIO
// ======================================================================

/**
 * Valida que los datos de un tipo de persona sean correctos según el tipo
 */
export function validatePersonaTipoData(
  tipoPersonaCodigo: string,
  data: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (tipoPersonaCodigo) {
    case 'SOCIO':
      // categoriaId es opcional - se auto-asigna ACTIVO si no se proporciona
      // if (!data.categoriaId) {
      //   errors.push('SOCIO requiere categoriaId');
      // }
      break;

    case 'DOCENTE':
      // especialidadId es opcional - se auto-asigna primera especialidad si no se proporciona
      // if (!data.especialidadId) {
      //   errors.push('DOCENTE requiere especialidadId');
      // }
      break;

    case 'PROVEEDOR':
      if (!data.cuit) {
        errors.push('PROVEEDOR requiere cuit');
      }
      if (!data.razonSocialId) {
        errors.push('PROVEEDOR requiere razonSocialId');
      }
      break;

    case 'NO_SOCIO':
      // NO_SOCIO no requiere campos adicionales
      break;

    default:
      errors.push(`Tipo de persona inválido: ${tipoPersonaCodigo}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Transforma un CreatePersonaLegacyDto al nuevo formato CreatePersonaDto
 */
export function transformLegacyToNew(legacyData: CreatePersonaLegacyDto): CreatePersonaDto {
  const { tipo, ...baseData } = legacyData as any;

  const newData: CreatePersonaDto = {
    ...baseData,
    tipos: [],
    contactos: []
  };

  // Crear el tipo correspondiente
  const tipoData: any = {
    tipoPersonaCodigo: tipo
  };

  switch (tipo) {
    case 'SOCIO':
      if ('categoriaId' in legacyData) {
        tipoData.categoriaId = legacyData.categoriaId;
      }
      if ('numeroSocio' in legacyData) {
        tipoData.numeroSocio = legacyData.numeroSocio;
      }
      if ('fechaIngreso' in legacyData) {
        tipoData.fechaIngreso = legacyData.fechaIngreso;
      }
      break;

    case 'DOCENTE':
      // Buscar la especialidad por nombre (esto requiere consulta a BD)
      // Por ahora asignamos especialidad GENERAL (ID 1)
      tipoData.especialidadId = 1;
      if ('honorariosPorHora' in legacyData) {
        tipoData.honorariosPorHora = legacyData.honorariosPorHora;
      }
      break;

    case 'PROVEEDOR':
      if ('cuit' in legacyData) {
        tipoData.cuit = legacyData.cuit;
      }
      if ('razonSocialId' in legacyData) {
        tipoData.razonSocialId = legacyData.razonSocialId;
      }
      break;
  }

  newData.tipos = [tipoData];

  // Migrar email y teléfono a contactos
  if (baseData.email) {
    newData.contactos.push({
      tipoContacto: TipoContacto.EMAIL,
      valor: baseData.email,
      principal: true,
      activo: true
    });
  }

  if (baseData.telefono) {
    newData.contactos.push({
      tipoContacto: TipoContacto.TELEFONO,
      valor: baseData.telefono,
      principal: true,
      activo: true
    });
  }

  return newData;
}
