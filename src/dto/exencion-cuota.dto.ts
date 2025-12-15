import { z } from 'zod';

/**
 * DTOs for ExencionCuota
 * FASE 4 - Task 4.2: Exenciones Temporales
 */

// ══════════════════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════════════════

export const TipoExencionEnum = z.enum(['TOTAL', 'PARCIAL']);

export const MotivoExencionEnum = z.enum([
  'BECA',
  'SOCIO_FUNDADOR',
  'SOCIO_HONORARIO',
  'SITUACION_ECONOMICA',
  'SITUACION_SALUD',
  'INTERCAMBIO_SERVICIOS',
  'PROMOCION',
  'FAMILIAR_DOCENTE',
  'OTRO'
]);

export const EstadoExencionEnum = z.enum([
  'PENDIENTE_APROBACION',
  'APROBADA',
  'RECHAZADA',
  'VIGENTE',
  'VENCIDA',
  'REVOCADA'
]);

// ══════════════════════════════════════════════════════════════════════
// CREATE DTOs
// ══════════════════════════════════════════════════════════════════════

export const createExencionCuotaSchema = z.object({
  personaId: z.number().int().positive('El ID de persona debe ser un número positivo'),
  tipoExencion: TipoExencionEnum,
  motivoExencion: MotivoExencionEnum,
  porcentajeExencion: z.number().min(0).max(100).optional().default(100),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date().optional().nullable(),
  descripcion: z.string().min(1, 'La descripción es obligatoria').max(500),
  justificacion: z.string().optional().nullable(),
  documentacionAdjunta: z.string().max(255).optional().nullable(),
  solicitadoPor: z.string().max(100).optional().nullable(),
  observaciones: z.string().optional().nullable()
}).refine(
  data => {
    if (data.fechaFin && data.fechaInicio) {
      return data.fechaFin >= data.fechaInicio;
    }
    return true;
  },
  {
    message: 'fechaFin debe ser posterior a fechaInicio',
    path: ['fechaFin']
  }
).refine(
  data => {
    if (data.tipoExencion === 'TOTAL') {
      return data.porcentajeExencion === 100;
    }
    return true;
  },
  {
    message: 'Exención TOTAL debe tener porcentaje 100%',
    path: ['porcentajeExencion']
  }
);

export type CreateExencionCuotaDto = z.infer<typeof createExencionCuotaSchema>;

// ══════════════════════════════════════════════════════════════════════
// UPDATE DTOs
// ══════════════════════════════════════════════════════════════════════

export const updateExencionCuotaSchema = z.object({
  tipoExencion: TipoExencionEnum.optional(),
  motivoExencion: MotivoExencionEnum.optional(),
  porcentajeExencion: z.number().min(0).max(100).optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional().nullable(),
  descripcion: z.string().min(1).max(500).optional(),
  justificacion: z.string().optional().nullable(),
  documentacionAdjunta: z.string().max(255).optional().nullable(),
  observaciones: z.string().optional().nullable()
});

export type UpdateExencionCuotaDto = z.infer<typeof updateExencionCuotaSchema>;

// ══════════════════════════════════════════════════════════════════════
// APPROVAL DTOs
// ══════════════════════════════════════════════════════════════════════

export const aprobarExencionSchema = z.object({
  aprobadoPor: z.string().min(1, 'El nombre del aprobador es obligatorio').max(100),
  observaciones: z.string().optional().nullable()
});

export type AprobarExencionDto = z.infer<typeof aprobarExencionSchema>;

export const rechazarExencionSchema = z.object({
  motivoRechazo: z.string().min(1, 'El motivo de rechazo es obligatorio')
});

export type RechazarExencionDto = z.infer<typeof rechazarExencionSchema>;

export const revocarExencionSchema = z.object({
  motivoRevocacion: z.string().min(1, 'El motivo de revocación es obligatorio')
});

export type RevocarExencionDto = z.infer<typeof revocarExencionSchema>;

// ══════════════════════════════════════════════════════════════════════
// QUERY DTOs
// ══════════════════════════════════════════════════════════════════════

export const queryExencionCuotaSchema = z.object({
  personaId: z.coerce.number().int().positive().optional(),
  tipoExencion: TipoExencionEnum.optional(),
  motivoExencion: MotivoExencionEnum.optional(),
  estado: EstadoExencionEnum.optional(),
  activa: z.coerce.boolean().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional()
});

export type QueryExencionCuotaDto = z.infer<typeof queryExencionCuotaSchema>;
