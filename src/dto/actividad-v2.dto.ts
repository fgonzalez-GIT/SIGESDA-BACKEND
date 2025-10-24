import { z } from 'zod';

// ============================================================================
// ACTIVIDAD - NUEVO MODELO V2.0
// ============================================================================
// Este archivo contiene los DTOs para el nuevo modelo de actividades
// que usa IDs SERIAL y tablas de catálogos en lugar de enums

// ============================================================================
// SCHEMAS BASE
// ============================================================================

const actividadBaseSchema = z.object({
  codigoActividad: z.string()
    .min(1, 'El código de actividad es requerido')
    .max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9\-]+$/, 'El código debe estar en mayúsculas, números y guiones (ej: CORO-ADU-2025-A)'),
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  tipoActividadId: z.number()
    .int('El ID de tipo de actividad debe ser un número entero')
    .positive('El ID de tipo de actividad debe ser positivo'),
  categoriaId: z.number()
    .int('El ID de categoría debe ser un número entero')
    .positive('El ID de categoría debe ser positivo'),
  estadoId: z.number()
    .int('El ID de estado debe ser un número entero')
    .positive('El ID de estado debe ser positivo')
    .default(1), // Por defecto: ACTIVA
  descripcion: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .nullable(),
  fechaDesde: z.string()
    .datetime()
    .or(z.date()),
  fechaHasta: z.string()
    .datetime()
    .or(z.date())
    .optional()
    .nullable(),
  cupoMaximo: z.number()
    .int('El cupo máximo debe ser un número entero')
    .positive('El cupo máximo debe ser positivo')
    .optional()
    .nullable(),
  costo: z.number()
    .nonnegative('El costo no puede ser negativo')
    .default(0),
  observaciones: z.string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional()
    .nullable()
});

// ============================================================================
// CREAR ACTIVIDAD
// ============================================================================

// Sub-schema para horarios inline al crear actividad
const horarioInlineSchema = z.object({
  diaSemanaId: z.number().int().positive().min(1).max(7),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  activo: z.boolean().default(true)
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

// Sub-schema para docentes inline al crear actividad
const docenteInlineSchema = z.object({
  docenteId: z.number().int().positive('ID de docente inválido'),
  rolDocenteId: z.number().int().positive(),
  observaciones: z.string().max(500).optional().nullable()
});

// Sub-schema para reservas de aulas inline al crear actividad
const reservaAulaInlineSchema = z.object({
  diaSemanaId: z.number().int().positive().min(1).max(7),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  aulaId: z.string().cuid('ID de aula inválido'),
  fechaVigenciaDesde: z.string().datetime().or(z.date()),
  fechaVigenciaHasta: z.string().datetime().or(z.date()).optional().nullable()
});

export const createActividadSchema = actividadBaseSchema.extend({
  horarios: z.array(horarioInlineSchema)
    .optional()
    .default([]),
  docentes: z.array(docenteInlineSchema)
    .optional()
    .default([]),
  reservasAulas: z.array(reservaAulaInlineSchema)
    .optional()
    .default([])
}).refine((data) => {
  // Validar que fechaHasta >= fechaDesde (si existe)
  if (!data.fechaHasta) return true;

  const desde = typeof data.fechaDesde === 'string'
    ? new Date(data.fechaDesde)
    : data.fechaDesde;
  const hasta = typeof data.fechaHasta === 'string'
    ? new Date(data.fechaHasta)
    : data.fechaHasta;

  return hasta >= desde;
}, {
  message: 'La fecha hasta debe ser posterior o igual a la fecha desde'
});

// ============================================================================
// ACTUALIZAR ACTIVIDAD
// ============================================================================

export const updateActividadSchema = actividadBaseSchema.partial().refine((data) => {
  // Validar que fechaHasta >= fechaDesde (si ambas existen)
  if (!data.fechaDesde || !data.fechaHasta) return true;

  const desde = typeof data.fechaDesde === 'string'
    ? new Date(data.fechaDesde)
    : data.fechaDesde;
  const hasta = typeof data.fechaHasta === 'string'
    ? new Date(data.fechaHasta)
    : data.fechaHasta;

  return hasta >= desde;
}, {
  message: 'La fecha hasta debe ser posterior o igual a la fecha desde'
});

// ============================================================================
// QUERY Y FILTROS
// ============================================================================

export const queryActividadesSchema = z.object({
  tipoActividadId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  categoriaId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  estadoId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  diaSemanaId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().min(1).max(7).optional()),
  docenteId: z.string().cuid().optional(),
  aulaId: z.string().cuid().optional(),
  conCupo: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()), // TRUE = solo actividades con cupo disponible
  incluirRelaciones: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(true)),
  costoDesde: z.preprocess((val) => {
    const parsed = parseFloat(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().nonnegative().optional()),
  costoHasta: z.preprocess((val) => {
    const parsed = parseFloat(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().nonnegative().optional()),
  search: z.string()
    .max(100, 'El término de búsqueda no puede exceder 100 caracteres')
    .optional(), // Búsqueda en nombre, descripción, código
  vigentes: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()), // TRUE = solo actividades vigentes (fecha actual entre fechaDesde y fechaHasta)
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10)),
  orderBy: z.enum([
    'nombre',
    'codigo',
    'fechaDesde',
    'costo',
    'cupoMaximo',
    'created_at'
  ]).default('nombre'),
  orderDir: z.enum(['asc', 'desc']).default('asc')
});

// ============================================================================
// DUPLICAR ACTIVIDAD
// ============================================================================

export const duplicarActividadSchema = z.object({
  nuevoCodigoActividad: z.string()
    .min(1, 'El código de actividad es requerido')
    .max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9\-]+$/, 'El código debe estar en mayúsculas, números y guiones'),
  nuevoNombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  nuevaFechaDesde: z.string().datetime().or(z.date()),
  nuevaFechaHasta: z.string().datetime().or(z.date()).optional().nullable(),
  copiarHorarios: z.boolean().default(true),
  copiarDocentes: z.boolean().default(false),
  copiarReservasAulas: z.boolean().default(false)
}).refine((data) => {
  if (!data.nuevaFechaHasta) return true;

  const desde = typeof data.nuevaFechaDesde === 'string'
    ? new Date(data.nuevaFechaDesde)
    : data.nuevaFechaDesde;
  const hasta = typeof data.nuevaFechaHasta === 'string'
    ? new Date(data.nuevaFechaHasta)
    : data.nuevaFechaHasta;

  return hasta >= desde;
}, {
  message: 'La fecha hasta debe ser posterior o igual a la fecha desde'
});

// ============================================================================
// CAMBIAR ESTADO
// ============================================================================

export const cambiarEstadoActividadSchema = z.object({
  nuevoEstadoId: z.number()
    .int('El ID de estado debe ser un número entero')
    .positive('El ID de estado debe ser positivo'),
  observaciones: z.string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional()
    .nullable()
});

// ============================================================================
// ESTADÍSTICAS Y REPORTES
// ============================================================================

export const estadisticasActividadSchema = z.object({
  incluirParticipaciones: z.boolean().default(true),
  incluirDocentes: z.boolean().default(true),
  incluirHorarios: z.boolean().default(true),
  incluirReservasAulas: z.boolean().default(false),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional()
});

export const reporteOcupacionSchema = z.object({
  diaSemanaId: z.number().int().positive().min(1).max(7).optional(),
  aulaId: z.string().cuid().optional(),
  docenteId: z.string().cuid().optional(),
  fechaReferencia: z.string().datetime().optional()
});

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type CreateActividadDto = z.infer<typeof createActividadSchema>;
export type UpdateActividadDto = z.infer<typeof updateActividadSchema>;
export type QueryActividadesDto = z.infer<typeof queryActividadesSchema>;
export type DuplicarActividadDto = z.infer<typeof duplicarActividadSchema>;
export type CambiarEstadoActividadDto = z.infer<typeof cambiarEstadoActividadSchema>;
export type EstadisticasActividadDto = z.infer<typeof estadisticasActividadSchema>;
export type ReporteOcupacionDto = z.infer<typeof reporteOcupacionSchema>;
export type HorarioInlineDto = z.infer<typeof horarioInlineSchema>;
export type DocenteInlineDto = z.infer<typeof docenteInlineSchema>;
export type ReservaAulaInlineDto = z.infer<typeof reservaAulaInlineSchema>;
