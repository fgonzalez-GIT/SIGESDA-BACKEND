import { z } from 'zod';

// Schema base para participación en actividad
const participacionBaseSchema = z.object({
  personaId: z.string().cuid('ID de persona inválido'),
  actividadId: z.number().int('El ID de actividad debe ser un número entero').positive('El ID de actividad debe ser positivo'),
  fechaInicio: z.coerce.date({
    required_error: 'Fecha de inicio es requerida',
    invalid_type_error: 'Fecha de inicio debe ser una fecha válida'
  }),
  fechaFin: z.coerce.date().optional().nullable(),
  precioEspecial: z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = parseFloat(val as string);
    return isNaN(num) ? val : num;
  }, z.number().min(0, 'El precio especial debe ser mayor o igual a 0').nullable().optional()),
  activa: z.boolean().default(true),
  observaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional()
});

// Validaciones personalizadas
const validarFechas = (data: any) => {
  if (data.fechaFin && data.fechaInicio) {
    if (new Date(data.fechaFin) <= new Date(data.fechaInicio)) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }
  return true;
};

const validarFechaInicio = (data: any) => {
  const ahora = new Date();
  const fechaInicio = new Date(data.fechaInicio);

  // Permitir fechas hasta 30 días en el pasado para registrar participaciones históricas
  const hace30Dias = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));

  if (fechaInicio < hace30Dias) {
    throw new Error('La fecha de inicio no puede ser anterior a 30 días atrás');
  }
  return true;
};

// DTO para crear participación
export const createParticipacionSchema = participacionBaseSchema
  .refine(validarFechas, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin']
  })
  .refine(validarFechaInicio, {
    message: 'La fecha de inicio no puede ser muy antigua',
    path: ['fechaInicio']
  });

// DTO para actualizar participación
export const updateParticipacionSchema = z.object({
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional().nullable(),
  precioEspecial: z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = parseFloat(val as string);
    return isNaN(num) ? val : num;
  }, z.number().min(0, 'El precio especial debe ser mayor o igual a 0').nullable().optional()),
  activa: z.boolean().optional(),
  observaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional()
}).refine((data) => {
  if (data.fechaFin && data.fechaInicio) {
    return validarFechas(data);
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin']
});

// Query filters para listar participaciones
export const participacionQuerySchema = z.object({
  personaId: z.string().optional(),
  actividadId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  activa: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }, z.boolean().optional()),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  conPrecioEspecial: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }, z.boolean().optional()),
  search: z.string().optional(), // Búsqueda en nombre de persona o actividad
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10)),
  sortBy: z.enum(['fechaInicio', 'fechaFin', 'persona', 'actividad', 'createdAt']).default('fechaInicio'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// DTO para inscripción masiva (una persona a múltiples actividades)
export const inscripcionMasivaSchema = z.object({
  personaId: z.string().cuid('ID de persona inválido'),
  actividades: z.array(z.object({
    actividadId: z.number().int().positive('El ID de actividad debe ser positivo'),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date().optional().nullable(),
    precioEspecial: z.number().min(0).optional().nullable(),
    observaciones: z.string().max(1000).optional()
  })).min(1, 'Debe seleccionar al menos una actividad'),
  aplicarDescuentoFamiliar: z.boolean().default(false)
});

// DTO para desincripción
export const desincripcionSchema = z.object({
  fechaFin: z.coerce.date().optional(),
  motivoDesincripcion: z.string().max(500, 'El motivo no puede exceder 500 caracteres').optional()
});

// DTO para estadísticas de participación
export const estadisticasParticipacionSchema = z.object({
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  agruparPor: z.enum(['mes', 'actividad', 'persona', 'tipo_actividad']).default('mes'),
  soloActivas: z.boolean().default(true)
});

// DTO para reporte de inasistencias
export const reporteInasistenciasSchema = z.object({
  actividadId: z.preprocess((val) => {
    if (!val) return undefined;
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  personaId: z.string().optional(),
  fechaDesde: z.coerce.date(),
  fechaHasta: z.coerce.date(),
  umbralInasistencias: z.number().int().min(1).default(3) // Número de faltas consecutivas
});

// Schema para validar disponibilidad de cupos
export const verificarCuposSchema = z.object({
  actividadId: z.number().int().positive('El ID de actividad debe ser positivo'),
  fechaConsulta: z.coerce.date().default(() => new Date())
});

// Schema para transferir participación (cambiar actividad)
export const transferirParticipacionSchema = z.object({
  nuevaActividadId: z.number().int().positive('El ID de nueva actividad debe ser positivo'),
  fechaTransferencia: z.coerce.date().default(() => new Date()),
  conservarFechaInicio: z.boolean().default(false),
  observaciones: z.string().max(500).optional()
});

// Estados de participación para filtros
export enum EstadoParticipacion {
  ACTIVA = 'ACTIVA',
  FINALIZADA = 'FINALIZADA',
  SUSPENDIDA = 'SUSPENDIDA'
}

// Helper para determinar estado
export const determinarEstado = (participacion: {
  activa: boolean;
  fechaFin: Date | null;
}): EstadoParticipacion => {
  if (!participacion.activa) {
    return EstadoParticipacion.SUSPENDIDA;
  }

  if (participacion.fechaFin && participacion.fechaFin <= new Date()) {
    return EstadoParticipacion.FINALIZADA;
  }

  return EstadoParticipacion.ACTIVA;
};

// Helper para calcular duración de participación
export const calcularDuracionParticipacion = (
  fechaInicio: Date,
  fechaFin: Date | null = null
): number => {
  const fin = fechaFin || new Date();
  const diffTime = Math.abs(fin.getTime() - fechaInicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Días
};

// Helper para validar solapamiento de participaciones
export const validarSolapamientoParticipaciones = (
  nuevaParticipacion: {
    personaId: string;
    actividadId: number;
    fechaInicio: Date;
    fechaFin?: Date | null;
  },
  participacionesExistentes: Array<{
    id: number;
    personaId: string;
    actividadId: number;
    fechaInicio: Date;
    fechaFin: Date | null;
    activa: boolean;
  }>
): { valido: boolean; conflictos: string[] } => {
  const conflictos: string[] = [];

  // Filtrar solo participaciones activas de la misma persona
  const participacionesActivas = participacionesExistentes.filter(
    p => p.activa && p.personaId === nuevaParticipacion.personaId
  );

  for (const participacion of participacionesActivas) {
    const inicioExistente = participacion.fechaInicio;
    const finExistente = participacion.fechaFin || new Date('2099-12-31'); // Si no tiene fin, asumir indefinida

    const inicioNueva = nuevaParticipacion.fechaInicio;
    const finNueva = nuevaParticipacion.fechaFin || new Date('2099-12-31');

    // Verificar solapamiento
    const haySolapamiento =
      inicioNueva < finExistente && finNueva > inicioExistente;

    if (haySolapamiento) {
      conflictos.push(
        `Conflicto con participación existente en actividad ${participacion.actividadId} (${inicioExistente.toISOString().split('T')[0]} - ${participacion.fechaFin ? participacion.fechaFin.toISOString().split('T')[0] : 'indefinida'})`
      );
    }
  }

  return {
    valido: conflictos.length === 0,
    conflictos
  };
};

export type CreateParticipacionDto = z.infer<typeof createParticipacionSchema>;
export type UpdateParticipacionDto = z.infer<typeof updateParticipacionSchema>;
export type ParticipacionQueryDto = z.infer<typeof participacionQuerySchema>;
export type InscripcionMasivaDto = z.infer<typeof inscripcionMasivaSchema>;
export type DesincripcionDto = z.infer<typeof desincripcionSchema>;
export type EstadisticasParticipacionDto = z.infer<typeof estadisticasParticipacionSchema>;
export type ReporteInasistenciasDto = z.infer<typeof reporteInasistenciasSchema>;
export type VerificarCuposDto = z.infer<typeof verificarCuposSchema>;
export type TransferirParticipacionDto = z.infer<typeof transferirParticipacionSchema>;