import { z } from 'zod';

// ============================================================================
// PARTICIPACIONES EN ACTIVIDADES (Inscripciones de Alumnos)
// ============================================================================

export const createParticipacionActividadSchema = z.object({
  personaId: z.string()
    .cuid('ID de persona inválido'),
  actividadId: z.number()
    .int('El ID de actividad debe ser un número entero')
    .positive('El ID de actividad debe ser positivo'),
  fechaInicio: z.string()
    .datetime()
    .or(z.date()),
  fechaFin: z.string()
    .datetime()
    .or(z.date())
    .optional()
    .nullable(),
  precioEspecial: z.number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .nullable(),
  activo: z.boolean().default(true),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
}).refine((data) => {
  // Validar que fechaFin >= fechaInicio (si existe)
  if (!data.fechaFin) return true;

  const inicio = typeof data.fechaInicio === 'string'
    ? new Date(data.fechaInicio)
    : data.fechaInicio;
  const fin = typeof data.fechaFin === 'string'
    ? new Date(data.fechaFin)
    : data.fechaFin;

  return fin >= inicio;
}, {
  message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio'
});

export const updateParticipacionActividadSchema = z.object({
  fechaFin: z.string()
    .datetime()
    .or(z.date())
    .optional()
    .nullable(),
  precioEspecial: z.number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .nullable(),
  activo: z.boolean().optional(),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

// Schema para inscribir múltiples alumnos a una actividad
export const inscribirMultiplesAlumnosSchema = z.object({
  actividadId: z.number().int().positive(),
  alumnos: z.array(
    z.object({
      personaId: z.string().cuid(),
      fechaInicio: z.string().datetime().or(z.date()),
      precioEspecial: z.number().nonnegative().optional().nullable(),
      observaciones: z.string().max(500).optional().nullable()
    })
  ).min(1, 'Debe proporcionar al menos un alumno')
});

// Schema para dar de baja a un alumno
export const bajaParticipacionSchema = z.object({
  fechaFin: z.string()
    .datetime()
    .or(z.date())
    .optional(), // Si no se proporciona, usa fecha actual
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

// Query para buscar participaciones
export const queryParticipacionesActividadesSchema = z.object({
  actividadId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  personaId: z.string().cuid().optional(),
  activo: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  incluirRelaciones: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(true)),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 50 : parsed;
  }, z.number().int().positive().max(100).default(50))
});

// Schema para verificar cupo disponible
export const verificarCupoSchema = z.object({
  actividadId: z.number().int().positive()
});

// Schema para obtener estadísticas de participación
export const estadisticasParticipacionSchema = z.object({
  actividadId: z.number().int().positive(),
  incluirHistorico: z.boolean().default(false),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional()
});

export type CreateParticipacionActividadDto = z.infer<typeof createParticipacionActividadSchema>;
export type UpdateParticipacionActividadDto = z.infer<typeof updateParticipacionActividadSchema>;
export type InscribirMultiplesAlumnosDto = z.infer<typeof inscribirMultiplesAlumnosSchema>;
export type BajaParticipacionDto = z.infer<typeof bajaParticipacionSchema>;
export type QueryParticipacionesActividadesDto = z.infer<typeof queryParticipacionesActividadesSchema>;
export type VerificarCupoDto = z.infer<typeof verificarCupoSchema>;
export type EstadisticasParticipacionDto = z.infer<typeof estadisticasParticipacionSchema>;
