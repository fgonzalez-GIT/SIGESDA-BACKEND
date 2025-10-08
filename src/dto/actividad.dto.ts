import { z } from 'zod';
import { TipoActividad, DiaSemana } from '@prisma/client';

// Schema base para horarios (sin validación)
const horarioBaseSchema = z.object({
  diaSemana: z.nativeEnum(DiaSemana),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (debe ser HH:MM)'),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (debe ser HH:MM)'),
  activo: z.boolean().default(true)
});

// Schema para horarios con validación
const horarioSchema = horarioBaseSchema.refine((data) => {
  // Validar que horaFin sea mayor que horaInicio
  const [inicioHora, inicioMin] = data.horaInicio.split(':').map(Number);
  const [finHora, finMin] = data.horaFin.split(':').map(Number);
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const finMinutos = finHora * 60 + finMin;
  return finMinutos > inicioMinutos;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio'
});

// Schema base para actividades
const actividadBaseSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100),
  tipo: z.nativeEnum(TipoActividad),
  descripcion: z.string().max(500).optional(),
  precio: z.number().min(0, 'El precio no puede ser negativo').default(0),
  duracion: z.number().int().positive('La duración debe ser positiva').optional(),
  capacidadMaxima: z.number().int().positive('La capacidad debe ser positiva').optional(),
  activa: z.boolean().default(true)
});

// DTO para crear actividad
export const createActividadSchema = z.object({
  ...actividadBaseSchema.shape,
  docenteIds: z.array(z.string().cuid()).optional().default([]),
  horarios: z.array(horarioSchema).optional().default([])
});

// DTO para actualizar actividad
export const updateActividadSchema = z.object({
  ...actividadBaseSchema.partial().shape,
  docenteIds: z.array(z.string().cuid()).optional(),
  horarios: z.array(horarioSchema).optional()
});

// Query filters para listar actividades
export const actividadQuerySchema = z.object({
  tipo: z.nativeEnum(TipoActividad).optional(),
  activa: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  conDocentes: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  precioDesde: z.preprocess((val) => {
    const parsed = parseFloat(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().min(0).optional()),
  precioHasta: z.preprocess((val) => {
    const parsed = parseFloat(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().min(0).optional()),
  search: z.string().optional(), // Búsqueda por nombre o descripción
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10))
});

// DTO para asignar/desasignar docentes
export const asignarDocenteSchema = z.object({
  docenteId: z.string().cuid('ID de docente inválido'),
  actividadId: z.string().cuid('ID de actividad inválido')
});

// DTO para obtener estadísticas de actividad
export const estadisticasActividadSchema = z.object({
  incluirParticipaciones: z.boolean().default(true),
  incluirReservas: z.boolean().default(false),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional()
});

// DTO para crear horario individual
export const createHorarioSchema = horarioBaseSchema.extend({
  actividadId: z.string().cuid('ID de actividad inválido')
}).refine((data) => {
  // Validar que horaFin sea mayor que horaInicio
  const [inicioHora, inicioMin] = data.horaInicio.split(':').map(Number);
  const [finHora, finMin] = data.horaFin.split(':').map(Number);
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const finMinutos = finHora * 60 + finMin;
  return finMinutos > inicioMinutos;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio'
});

// DTO para actualizar horario individual
export const updateHorarioSchema = horarioBaseSchema.partial();

// DTO para consultar actividades por día
export const queryPorDiaSchema = z.object({
  dia: z.nativeEnum(DiaSemana, { errorMap: () => ({ message: 'Día de semana inválido' }) }),
  soloActivas: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(true))
});

export type HorarioDto = z.infer<typeof horarioSchema>;
export type CreateHorarioDto = z.infer<typeof createHorarioSchema>;
export type UpdateHorarioDto = z.infer<typeof updateHorarioSchema>;
export type QueryPorDiaDto = z.infer<typeof queryPorDiaSchema>;
export type CreateActividadDto = z.infer<typeof createActividadSchema>;
export type UpdateActividadDto = z.infer<typeof updateActividadSchema>;
export type ActividadQueryDto = z.infer<typeof actividadQuerySchema>;
export type AsignarDocenteDto = z.infer<typeof asignarDocenteSchema>;
export type EstadisticasActividadDto = z.infer<typeof estadisticasActividadSchema>;