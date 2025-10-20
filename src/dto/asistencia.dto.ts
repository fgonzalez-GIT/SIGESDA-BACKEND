import { z } from 'zod';

// ============================================================================
// ASISTENCIAS - DTOs para registro de presencia en sesiones de actividades
// ============================================================================

/**
 * Schema para crear una asistencia individual
 */
export const createAsistenciaSchema = z.object({
  participacionId: z.number().int('El ID de participación debe ser un número entero').positive('El ID de participación debe ser positivo'),
  fechaSesion: z.string().datetime('Fecha de sesión inválida'),
  asistio: z.boolean(),
  justificada: z.boolean().optional().default(false),
  observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional()
});

/**
 * Schema para registrar asistencia masiva de una sesión completa
 */
export const registroAsistenciaMasivaSchema = z.object({
  actividadId: z.number().int().positive('El ID de actividad debe ser positivo'),
  fechaSesion: z.string().datetime('Fecha de sesión inválida'),
  asistencias: z.array(z.object({
    participacionId: z.number().int().positive(),
    asistio: z.boolean(),
    justificada: z.boolean().optional().default(false),
    observaciones: z.string().max(500).optional()
  })).min(1, 'Debe registrar al menos una asistencia')
});

/**
 * Schema para actualizar una asistencia existente
 */
export const updateAsistenciaSchema = z.object({
  asistio: z.boolean().optional(),
  justificada: z.boolean().optional(),
  observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional()
});

/**
 * Schema para consultar asistencias con filtros
 */
export const asistenciaQuerySchema = z.object({
  participacionId: z.preprocess((val) => {
    if (!val) return undefined;
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  actividadId: z.preprocess((val) => {
    if (!val) return undefined;
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  personaId: z.string().optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  soloInasistencias: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().optional()),
  soloJustificadas: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().optional()),
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 20 : parsed;
  }, z.number().int().positive().max(100).default(20))
});

/**
 * Schema para obtener reporte de asistencias
 */
export const reporteAsistenciasSchema = z.object({
  actividadId: z.preprocess((val) => {
    if (!val) return undefined;
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  personaId: z.string().optional(),
  fechaDesde: z.string().datetime('Fecha desde inválida'),
  fechaHasta: z.string().datetime('Fecha hasta inválida'),
  agruparPor: z.enum(['persona', 'actividad', 'mes', 'dia']).default('persona')
}).refine((data) => {
  const desde = new Date(data.fechaDesde);
  const hasta = new Date(data.fechaHasta);
  return desde < hasta;
}, {
  message: 'La fecha desde debe ser anterior a la fecha hasta',
  path: ['fechaHasta']
});

/**
 * Schema para obtener tasa de asistencia
 */
export const tasaAsistenciaSchema = z.object({
  participacionId: z.number().int().positive(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional()
});

/**
 * Schema para alertas de inasistencias consecutivas
 */
export const alertasInasistenciasSchema = z.object({
  umbral: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 3 : parsed;
  }, z.number().int().min(1).max(10).default(3)),
  actividadId: z.preprocess((val) => {
    if (!val) return undefined;
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  soloActivas: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().default(true))
});

// Type exports
export type CreateAsistenciaDto = z.infer<typeof createAsistenciaSchema>;
export type RegistroAsistenciaMasivaDto = z.infer<typeof registroAsistenciaMasivaSchema>;
export type UpdateAsistenciaDto = z.infer<typeof updateAsistenciaSchema>;
export type AsistenciaQueryDto = z.infer<typeof asistenciaQuerySchema>;
export type ReporteAsistenciasDto = z.infer<typeof reporteAsistenciasSchema>;
export type TasaAsistenciaDto = z.infer<typeof tasaAsistenciaSchema>;
export type AlertasInasistenciasDto = z.infer<typeof alertasInasistenciasSchema>;
