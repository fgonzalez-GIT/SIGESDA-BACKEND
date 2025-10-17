import { z } from 'zod';

// ============================================================================
// RESERVAS DE AULAS PARA ACTIVIDADES
// ============================================================================

export const createReservaAulaActividadSchema = z.object({
  horarioId: z.number()
    .int('El ID de horario debe ser un número entero')
    .positive('El ID de horario debe ser positivo'),
  aulaId: z.string()
    .cuid('ID de aula inválido'),
  fechaVigenciaDesde: z.string()
    .datetime()
    .or(z.date()),
  fechaVigenciaHasta: z.string()
    .datetime()
    .or(z.date())
    .optional()
    .nullable(),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
}).refine((data) => {
  // Validar que fechaVigenciaHasta >= fechaVigenciaDesde (si existe)
  if (!data.fechaVigenciaHasta) return true;

  const desde = typeof data.fechaVigenciaDesde === 'string'
    ? new Date(data.fechaVigenciaDesde)
    : data.fechaVigenciaDesde;
  const hasta = typeof data.fechaVigenciaHasta === 'string'
    ? new Date(data.fechaVigenciaHasta)
    : data.fechaVigenciaHasta;

  return hasta >= desde;
}, {
  message: 'La fecha de vigencia hasta debe ser posterior o igual a la fecha de vigencia desde'
});

export const updateReservaAulaActividadSchema = z.object({
  fechaVigenciaHasta: z.string()
    .datetime()
    .or(z.date())
    .optional()
    .nullable(),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

// Schema para crear reserva de aula para todos los horarios de una actividad
export const reservarAulaParaActividadSchema = z.object({
  actividadId: z.number().int().positive(),
  aulaId: z.string().cuid('ID de aula inválido'),
  fechaVigenciaDesde: z.string().datetime().or(z.date()),
  fechaVigenciaHasta: z.string().datetime().or(z.date()).optional().nullable(),
  observaciones: z.string().max(500).optional().nullable()
}).refine((data) => {
  if (!data.fechaVigenciaHasta) return true;

  const desde = typeof data.fechaVigenciaDesde === 'string'
    ? new Date(data.fechaVigenciaDesde)
    : data.fechaVigenciaDesde;
  const hasta = typeof data.fechaVigenciaHasta === 'string'
    ? new Date(data.fechaVigenciaHasta)
    : data.fechaVigenciaHasta;

  return hasta >= desde;
}, {
  message: 'La fecha de vigencia hasta debe ser posterior o igual a la fecha de vigencia desde'
});

// Schema para cambiar aula de un horario
export const cambiarAulaHorarioSchema = z.object({
  nuevaAulaId: z.string().cuid('ID de aula inválido'),
  fechaVigenciaDesde: z.string().datetime().or(z.date()),
  fechaVigenciaHasta: z.string().datetime().or(z.date()).optional().nullable(),
  observaciones: z.string().max(500).optional().nullable()
}).refine((data) => {
  if (!data.fechaVigenciaHasta) return true;

  const desde = typeof data.fechaVigenciaDesde === 'string'
    ? new Date(data.fechaVigenciaDesde)
    : data.fechaVigenciaDesde;
  const hasta = typeof data.fechaVigenciaHasta === 'string'
    ? new Date(data.fechaVigenciaHasta)
    : data.fechaVigenciaHasta;

  return hasta >= desde;
}, {
  message: 'La fecha de vigencia hasta debe ser posterior o igual a la fecha de vigencia desde'
});

// Query para buscar reservas de aulas
export const queryReservasAulasActividadesSchema = z.object({
  horarioId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  aulaId: z.string().cuid().optional(),
  actividadId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  diaSemanaId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().min(1).max(7).optional()),
  vigentes: z.preprocess((val) => {
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
  fechaReferencia: z.string().datetime().optional(),
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 50 : parsed;
  }, z.number().int().positive().max(100).default(50))
});

// Schema para verificar disponibilidad de aula
export const verificarDisponibilidadAulaSchema = z.object({
  aulaId: z.string().cuid('ID de aula inválido'),
  diaSemanaId: z.number().int().positive().min(1).max(7),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  fechaVigenciaDesde: z.string().datetime().or(z.date()),
  fechaVigenciaHasta: z.string().datetime().or(z.date()).optional().nullable(),
  horarioExcluidoId: z.number().int().positive().optional() // Para excluir un horario al editar
}).refine((data) => {
  const horaInicio = data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio;
  const horaFin = data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin;

  const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
  const [finHora, finMin] = horaFin.split(':').map(Number);
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const finMinutos = finHora * 60 + finMin;

  return finMinutos > inicioMinutos;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio'
});

// Schema para finalizar reserva de aula
export const finalizarReservaAulaSchema = z.object({
  fechaVigenciaHasta: z.string()
    .datetime()
    .or(z.date())
    .optional(), // Si no se proporciona, usa fecha actual
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

export type CreateReservaAulaActividadDto = z.infer<typeof createReservaAulaActividadSchema>;
export type UpdateReservaAulaActividadDto = z.infer<typeof updateReservaAulaActividadSchema>;
export type ReservarAulaParaActividadDto = z.infer<typeof reservarAulaParaActividadSchema>;
export type CambiarAulaHorarioDto = z.infer<typeof cambiarAulaHorarioSchema>;
export type QueryReservasAulasActividadesDto = z.infer<typeof queryReservasAulasActividadesSchema>;
export type VerificarDisponibilidadAulaDto = z.infer<typeof verificarDisponibilidadAulaSchema>;
export type FinalizarReservaAulaDto = z.infer<typeof finalizarReservaAulaSchema>;
