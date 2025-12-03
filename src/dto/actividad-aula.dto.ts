import { z } from 'zod';

// ============================================================================
// ACTIVIDADES - AULAS (Relación M:N con prioridad y soft delete)
// ============================================================================

export const createActividadAulaSchema = z.object({
  actividadId: z.number()
    .int('El ID de actividad debe ser un número entero')
    .positive('El ID de actividad debe ser positivo'),
  aulaId: z.number()
    .int('El ID de aula debe ser un número entero')
    .positive('El ID de aula debe ser positivo'),
  fechaAsignacion: z.string()
    .datetime()
    .or(z.date())
    .optional(), // Si no se proporciona, usa CURRENT_TIMESTAMP
  fechaDesasignacion: z.string()
    .datetime()
    .or(z.date())
    .optional()
    .nullable(),
  activa: z.boolean().default(true),
  prioridad: z.number()
    .int('La prioridad debe ser un número entero')
    .positive('La prioridad debe ser positiva')
    .default(1)
    .optional(),
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

export const updateActividadAulaSchema = z.object({
  prioridad: z.number()
    .int('La prioridad debe ser un número entero')
    .positive('La prioridad debe ser positiva')
    .optional(),
  fechaDesasignacion: z.string()
    .datetime()
    .or(z.date())
    .optional()
    .nullable(),
  activa: z.boolean().optional(),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

// Schema para asignar múltiples aulas a una actividad
export const asignarMultiplesAulasSchema = z.object({
  actividadId: z.number().int().positive(),
  aulas: z.array(
    z.object({
      aulaId: z.number().int().positive(),
      prioridad: z.number().int().positive().default(1).optional(),
      observaciones: z.string().max(500).optional().nullable()
    })
  ).min(1, 'Debe proporcionar al menos un aula')
});

// Schema para cambiar aula de una actividad
export const cambiarAulaSchema = z.object({
  nuevaAulaId: z.number()
    .int('El ID de aula debe ser un número entero')
    .positive('El ID de aula debe ser positivo'),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

// Query para buscar actividades-aulas
export const queryActividadesAulasSchema = z.object({
  actividadId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  aulaId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  activa: z.preprocess((val) => {
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

// Schema para desasignar aula de actividad
export const desasignarAulaSchema = z.object({
  fechaDesasignacion: z.string()
    .datetime()
    .or(z.date())
    .optional(), // Si no se proporciona, usa fecha actual
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

// Schema para verificar disponibilidad de aula para actividad
export const verificarDisponibilidadSchema = z.object({
  actividadId: z.number()
    .int('El ID de actividad debe ser un número entero')
    .positive('El ID de actividad debe ser positivo'),
  aulaId: z.number()
    .int('El ID de aula debe ser un número entero')
    .positive('El ID de aula debe ser positivo'),
  excluirAsignacionId: z.number()
    .int()
    .positive()
    .optional() // Para excluir asignación al editar
});

export type CreateActividadAulaDto = z.infer<typeof createActividadAulaSchema>;
export type UpdateActividadAulaDto = z.infer<typeof updateActividadAulaSchema>;
export type AsignarMultiplesAulasDto = z.infer<typeof asignarMultiplesAulasSchema>;
export type CambiarAulaDto = z.infer<typeof cambiarAulaSchema>;
export type QueryActividadesAulasDto = z.infer<typeof queryActividadesAulasSchema>;
export type DesasignarAulaDto = z.infer<typeof desasignarAulaSchema>;
export type VerificarDisponibilidadDto = z.infer<typeof verificarDisponibilidadSchema>;

// Type helpers para respuestas
export interface ConflictoHorario {
  tipo: 'ACTIVIDAD' | 'RESERVA' | 'SECCION';
  id: number;
  nombre: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  aulaId: number;
  aulaNombre: string;
}

export interface DisponibilidadResponse {
  disponible: boolean;
  conflictos?: ConflictoHorario[];
  capacidadSuficiente?: boolean;
  participantesActuales?: number;
  capacidadAula?: number;
  observaciones?: string[];
}
