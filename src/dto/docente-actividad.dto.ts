import { z } from 'zod';

// ============================================================================
// DOCENTES - ACTIVIDADES (Relación M:N con Rol)
// ============================================================================

export const createDocenteActividadSchema = z.object({
  actividadId: z.number()
    .int('El ID de actividad debe ser un número entero')
    .positive('El ID de actividad debe ser positivo'),
  docenteId: z.string()
    .cuid('ID de docente inválido'),
  rolDocenteId: z.number()
    .int('El ID de rol docente debe ser un número entero')
    .positive('El ID de rol docente debe ser positivo'),
  fechaAsignacion: z.string()
    .datetime()
    .or(z.date())
    .optional(), // Si no se proporciona, usa CURRENT_TIMESTAMP
  fechaDesasignacion: z.string()
    .datetime()
    .or(z.date())
    .optional()
    .nullable(),
  activo: z.boolean().default(true),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
}).refine((data) => {
  // Validar que fechaDesasignacion >= fechaAsignacion (si ambas existen)
  if (!data.fechaAsignacion || !data.fechaDesasignacion) return true;

  const asignacion = typeof data.fechaAsignacion === 'string'
    ? new Date(data.fechaAsignacion)
    : data.fechaAsignacion;
  const desasignacion = typeof data.fechaDesasignacion === 'string'
    ? new Date(data.fechaDesasignacion)
    : data.fechaDesasignacion;

  return desasignacion >= asignacion;
}, {
  message: 'La fecha de desasignación debe ser posterior o igual a la fecha de asignación'
});

export const updateDocenteActividadSchema = z.object({
  rolDocenteId: z.number()
    .int('El ID de rol docente debe ser un número entero')
    .positive('El ID de rol docente debe ser positivo')
    .optional(),
  fechaDesasignacion: z.string()
    .datetime()
    .or(z.date())
    .optional()
    .nullable(),
  activo: z.boolean().optional(),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

// Schema para asignar múltiples docentes a una actividad
export const asignarMultiplesDocentesSchema = z.object({
  actividadId: z.number().int().positive(),
  docentes: z.array(
    z.object({
      docenteId: z.string().cuid(),
      rolDocenteId: z.number().int().positive(),
      observaciones: z.string().max(500).optional().nullable()
    })
  ).min(1, 'Debe proporcionar al menos un docente')
});

// Schema para cambiar rol de un docente en una actividad
export const cambiarRolDocenteSchema = z.object({
  nuevoRolDocenteId: z.number()
    .int('El ID de rol docente debe ser un número entero')
    .positive('El ID de rol docente debe ser positivo'),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

// Query para buscar docentes de actividades
export const queryDocentesActividadesSchema = z.object({
  actividadId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  docenteId: z.string().cuid().optional(),
  rolDocenteId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
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
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 50 : parsed;
  }, z.number().int().positive().max(100).default(50))
});

// Schema para desasignar docente de actividad
export const desasignarDocenteSchema = z.object({
  fechaDesasignacion: z.string()
    .datetime()
    .or(z.date())
    .optional(), // Si no se proporciona, usa fecha actual
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

export type CreateDocenteActividadDto = z.infer<typeof createDocenteActividadSchema>;
export type UpdateDocenteActividadDto = z.infer<typeof updateDocenteActividadSchema>;
export type AsignarMultiplesDocentesDto = z.infer<typeof asignarMultiplesDocentesSchema>;
export type CambiarRolDocenteDto = z.infer<typeof cambiarRolDocenteSchema>;
export type QueryDocentesActividadesDto = z.infer<typeof queryDocentesActividadesSchema>;
export type DesasignarDocenteDto = z.infer<typeof desasignarDocenteSchema>;
