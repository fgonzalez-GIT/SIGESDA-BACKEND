import { z } from 'zod';

// Helper para convertir string a int
const stringToInt = z.preprocess(
  (val) => (typeof val === 'string' ? parseInt(val) : val),
  z.number().int().positive('ID debe ser un número positivo')
);

// Create reserva schema
export const createReservaAulaSchema = z.object({
  aulaId: stringToInt,
  actividadId: stringToInt.optional(),
  docenteId: stringToInt,
  estadoReservaId: stringToInt.optional(), // Opcional: si no se proporciona, se asigna PENDIENTE por defecto
  fechaInicio: z.string().datetime('Fecha de inicio inválida'),
  fechaFin: z.string().datetime('Fecha de fin inválida'),
  observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional()
}).refine(
  (data) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    return inicio < fin;
  },
  {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['fechaFin']
  }
).refine(
  (data) => {
    const inicio = new Date(data.fechaInicio);
    const now = new Date();
    // Allow reservations up to 1 hour in the past for flexibility
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return inicio >= oneHourAgo;
  },
  {
    message: 'No se pueden crear reservas en el pasado',
    path: ['fechaInicio']
  }
).refine(
  (data) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    const diffHours = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    return diffHours >= 0.5 && diffHours <= 12; // Minimum 30 minutes, maximum 12 hours
  },
  {
    message: 'La duración de la reserva debe estar entre 30 minutos y 12 horas',
    path: ['fechaFin']
  }
);

// Update reserva schema
export const updateReservaAulaSchema = z.object({
  aulaId: stringToInt.optional(),
  actividadId: stringToInt.optional().nullable(),
  docenteId: stringToInt.optional(),
  estadoReservaId: stringToInt.optional(),
  fechaInicio: z.string().datetime('Fecha de inicio inválida').optional(),
  fechaFin: z.string().datetime('Fecha de fin inválida').optional(),
  observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional().nullable()
}).refine(
  (data) => {
    if (data.fechaInicio && data.fechaFin) {
      const inicio = new Date(data.fechaInicio);
      const fin = new Date(data.fechaFin);
      return inicio < fin;
    }
    return true;
  },
  {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['fechaFin']
  }
);

// Query filters
export const reservaAulaQuerySchema = z.object({
  aulaId: stringToInt.optional(),
  actividadId: stringToInt.optional(),
  docenteId: stringToInt.optional(),
  estadoReservaId: stringToInt.optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  soloActivas: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(true)),
  incluirPasadas: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(false)),
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10))
});

// Conflict detection schema
export const conflictDetectionSchema = z.object({
  aulaId: stringToInt,
  fechaInicio: z.string().datetime('Fecha de inicio inválida'),
  fechaFin: z.string().datetime('Fecha de fin inválida'),
  excludeReservaId: stringToInt.optional() // For updates
}).refine(
  (data) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    return inicio < fin;
  },
  {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['fechaFin']
  }
);

// Bulk operations schemas
export const createBulkReservasSchema = z.object({
  reservas: z.array(createReservaAulaSchema).min(1, 'Debe proporcionar al menos una reserva')
});

export const deleteBulkReservasSchema = z.object({
  ids: z.array(stringToInt).min(1, 'Debe proporcionar al menos un ID')
});

// Schedule schema for recurring reservations
export const createRecurringReservaSchema = z.object({
  aulaId: stringToInt,
  actividadId: stringToInt.optional(),
  docenteId: stringToInt,
  fechaInicio: z.string().datetime('Fecha de inicio inválida'),
  fechaFin: z.string().datetime('Fecha de fin inválida'),
  observaciones: z.string().max(500).optional(),
  recurrencia: z.object({
    tipo: z.enum(['DIARIO', 'SEMANAL', 'MENSUAL']),
    intervalo: z.number().int().positive().max(12), // every N days/weeks/months
    diasSemana: z.array(z.number().int().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
    fechaHasta: z.string().datetime('Fecha límite inválida'),
    maxOcurrencias: z.number().int().positive().max(100).optional()
  })
}).refine(
  (data) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    const hasta = new Date(data.recurrencia.fechaHasta);
    return inicio < fin && fin <= hasta;
  },
  {
    message: 'Las fechas de recurrencia deben ser coherentes',
    path: ['recurrencia', 'fechaHasta']
  }
);

// Search schema
export const reservaSearchSchema = z.object({
  search: z.string().min(1, 'Término de búsqueda requerido'),
  searchBy: z.enum(['aula', 'docente', 'actividad', 'observaciones', 'all']).default('all'),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  incluirPasadas: z.boolean().default(false)
});

// Statistics schema
export const reservaStatsSchema = z.object({
  fechaDesde: z.string().datetime(),
  fechaHasta: z.string().datetime(),
  agruparPor: z.enum(['aula', 'docente', 'actividad', 'dia', 'mes']).default('aula')
}).refine(
  (data) => {
    const desde = new Date(data.fechaDesde);
    const hasta = new Date(data.fechaHasta);
    return desde <= hasta;
  },
  {
    message: 'La fecha desde debe ser anterior o igual a la fecha hasta',
    path: ['fechaHasta']
  }
);

// ============================================================================
// WORKFLOW DE ESTADOS - SCHEMAS
// ============================================================================

// Aprobar reserva
export const aprobarReservaSchema = z.object({
  aprobadoPorId: stringToInt,
  observaciones: z.string().max(500).optional()
});

// Rechazar reserva
export const rechazarReservaSchema = z.object({
  rechazadoPorId: stringToInt,
  motivo: z.string()
    .min(10, 'El motivo debe tener al menos 10 caracteres')
    .max(500, 'El motivo no puede exceder 500 caracteres')
});

// Cancelar reserva
export const cancelarReservaSchema = z.object({
  canceladoPorId: stringToInt,
  motivoCancelacion: z.string()
    .min(10, 'El motivo debe tener al menos 10 caracteres')
    .max(500, 'El motivo no puede exceder 500 caracteres')
});

export type CreateReservaAulaDto = z.infer<typeof createReservaAulaSchema>;
export type UpdateReservaAulaDto = z.infer<typeof updateReservaAulaSchema>;
export type ReservaAulaQueryDto = z.infer<typeof reservaAulaQuerySchema>;
export type ConflictDetectionDto = z.infer<typeof conflictDetectionSchema>;
export type CreateBulkReservasDto = z.infer<typeof createBulkReservasSchema>;
export type DeleteBulkReservasDto = z.infer<typeof deleteBulkReservasSchema>;
export type CreateRecurringReservaDto = z.infer<typeof createRecurringReservaSchema>;
export type ReservaSearchDto = z.infer<typeof reservaSearchSchema>;
export type ReservaStatsDto = z.infer<typeof reservaStatsSchema>;
export type AprobarReservaDto = z.infer<typeof aprobarReservaSchema>;
export type RechazarReservaDto = z.infer<typeof rechazarReservaSchema>;
export type CancelarReservaDto = z.infer<typeof cancelarReservaSchema>;