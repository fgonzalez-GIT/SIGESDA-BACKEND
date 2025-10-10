import { z } from 'zod';
import { DiaSemana } from '@prisma/client';

// ============================================================================
// SCHEMAS BASE
// ============================================================================

// Schema base para horario de sección (sin validaciones complejas)
const horarioSeccionBaseSchema = z.object({
  diaSemana: z.nativeEnum(DiaSemana, {
    errorMap: () => ({ message: 'Día de la semana inválido' })
  }),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido. Use HH:MM (ej: 09:00)'
  }),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido. Use HH:MM (ej: 11:00)'
  }),
  activo: z.boolean().default(true)
});

// Schema con validación de horarios (horaFin > horaInicio)
const horarioSeccionSchema = horarioSeccionBaseSchema.refine((data) => {
  const [inicioHora, inicioMin] = data.horaInicio.split(':').map(Number);
  const [finHora, finMin] = data.horaFin.split(':').map(Number);
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const finMinutos = finHora * 60 + finMin;
  return finMinutos > inicioMinutos;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio'
});

// Schema base para reserva de aula por sección
const reservaAulaSeccionBaseSchema = z.object({
  aulaId: z.string().cuid('ID de aula inválido'),
  diaSemana: z.nativeEnum(DiaSemana, {
    errorMap: () => ({ message: 'Día de la semana inválido' })
  }),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  fechaVigencia: z.string().datetime().or(z.date()),
  fechaFin: z.string().datetime().or(z.date()).optional().nullable(),
  observaciones: z.string().max(500).optional().nullable()
});

// ============================================================================
// CREAR SECCIÓN
// ============================================================================

export const createSeccionSchema = z.object({
  actividadId: z.string().cuid('ID de actividad inválido'),
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  codigo: z.string()
    .max(50, 'El código no puede exceder 50 caracteres')
    .optional()
    .nullable(),
  capacidadMaxima: z.number()
    .int('La capacidad debe ser un número entero')
    .positive('La capacidad debe ser mayor a 0')
    .optional()
    .nullable(),
  activa: z.boolean().default(true),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable(),
  docenteIds: z.array(z.string().cuid('ID de docente inválido')).optional().default([]),
  horarios: z.array(horarioSeccionSchema).optional().default([]),
  reservasAulas: z.array(reservaAulaSeccionBaseSchema).optional().default([])
});

export type CreateSeccionDto = z.infer<typeof createSeccionSchema>;

// ============================================================================
// ACTUALIZAR SECCIÓN
// ============================================================================

export const updateSeccionSchema = z.object({
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  codigo: z.string()
    .max(50, 'El código no puede exceder 50 caracteres')
    .optional()
    .nullable(),
  capacidadMaxima: z.number()
    .int('La capacidad debe ser un número entero')
    .positive('La capacidad debe ser mayor a 0')
    .optional()
    .nullable(),
  activa: z.boolean().optional(),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

export type UpdateSeccionDto = z.infer<typeof updateSeccionSchema>;

// ============================================================================
// AGREGAR/ACTUALIZAR HORARIO DE SECCIÓN
// ============================================================================

export const createHorarioSeccionSchema = horarioSeccionBaseSchema.extend({
  seccionId: z.string().cuid('ID de sección inválido')
}).refine((data) => {
  const [inicioHora, inicioMin] = data.horaInicio.split(':').map(Number);
  const [finHora, finMin] = data.horaFin.split(':').map(Number);
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const finMinutos = finHora * 60 + finMin;
  return finMinutos > inicioMinutos;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio'
});

export type CreateHorarioSeccionDto = z.infer<typeof createHorarioSeccionSchema>;

export const updateHorarioSeccionSchema = horarioSeccionBaseSchema.partial();
export type UpdateHorarioSeccionDto = z.infer<typeof updateHorarioSeccionSchema>;

// ============================================================================
// AGREGAR/REMOVER DOCENTES A SECCIÓN
// ============================================================================

export const addDocenteSeccionSchema = z.object({
  docenteId: z.string().cuid('ID de docente inválido')
});

export type AddDocenteSeccionDto = z.infer<typeof addDocenteSeccionSchema>;

export const removeDocenteSeccionSchema = z.object({
  docenteId: z.string().cuid('ID de docente inválido')
});

export type RemoveDocenteSeccionDto = z.infer<typeof removeDocenteSeccionSchema>;

// ============================================================================
// PARTICIPACIÓN EN SECCIÓN
// ============================================================================

export const createParticipacionSeccionSchema = z.object({
  personaId: z.string().cuid('ID de persona inválido'),
  seccionId: z.string().cuid('ID de sección inválido'),
  fechaInicio: z.string().datetime().or(z.date()),
  fechaFin: z.string().datetime().or(z.date()).optional().nullable(),
  precioEspecial: z.number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .nullable(),
  activa: z.boolean().default(true),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

export type CreateParticipacionSeccionDto = z.infer<typeof createParticipacionSeccionSchema>;

export const updateParticipacionSeccionSchema = z.object({
  fechaFin: z.string().datetime().or(z.date()).optional().nullable(),
  precioEspecial: z.number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .nullable(),
  activa: z.boolean().optional(),
  observaciones: z.string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable()
});

export type UpdateParticipacionSeccionDto = z.infer<typeof updateParticipacionSeccionSchema>;

// ============================================================================
// RESERVA DE AULA PARA SECCIÓN
// ============================================================================

export const createReservaAulaSeccionSchema = reservaAulaSeccionBaseSchema.extend({
  seccionId: z.string().cuid('ID de sección inválido')
}).refine((data) => {
  const [inicioHora, inicioMin] = data.horaInicio.split(':').map(Number);
  const [finHora, finMin] = data.horaFin.split(':').map(Number);
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const finMinutos = finHora * 60 + finMin;
  return finMinutos > inicioMinutos;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio'
});

export type CreateReservaAulaSeccionDto = z.infer<typeof createReservaAulaSeccionSchema>;

export const updateReservaAulaSeccionSchema = reservaAulaSeccionBaseSchema.partial().omit({
  aulaId: true,
  diaSemana: true,
  horaInicio: true
});

export type UpdateReservaAulaSeccionDto = z.infer<typeof updateReservaAulaSeccionSchema>;

// ============================================================================
// QUERIES Y FILTROS
// ============================================================================

export const querySeccionesSchema = z.object({
  actividadId: z.string().cuid('ID de actividad inválido').optional(),
  activa: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  search: z.string().max(100).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10')
});

export type QuerySeccionesDto = z.infer<typeof querySeccionesSchema>;

export const queryParticipacionesSeccionSchema = z.object({
  seccionId: z.string().cuid('ID de sección inválido').optional(),
  personaId: z.string().cuid('ID de persona inválido').optional(),
  activa: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10')
});

export type QueryParticipacionesSeccionDto = z.infer<typeof queryParticipacionesSeccionSchema>;

// ============================================================================
// VALIDACIÓN DE CONFLICTOS
// ============================================================================

export const verificarConflictoSeccionSchema = z.object({
  seccionId: z.string().cuid('ID de sección inválido').optional(),
  diaSemana: z.nativeEnum(DiaSemana),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  docenteId: z.string().cuid('ID de docente inválido').optional(),
  aulaId: z.string().cuid('ID de aula inválido').optional()
}).refine((data) => {
  const [inicioHora, inicioMin] = data.horaInicio.split(':').map(Number);
  const [finHora, finMin] = data.horaFin.split(':').map(Number);
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const finMinutos = finHora * 60 + finMin;
  return finMinutos > inicioMinutos;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio'
});

export type VerificarConflictoSeccionDto = z.infer<typeof verificarConflictoSeccionSchema>;
