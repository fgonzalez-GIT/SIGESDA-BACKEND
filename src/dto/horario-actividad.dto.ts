import { z } from 'zod';

// ============================================================================
// HORARIOS DE ACTIVIDADES
// ============================================================================

// Schema base para horarios (sin validación de coherencia)
const horarioActividadBaseSchema = z.object({
  actividadId: z.number()
    .int('El ID de actividad debe ser un número entero')
    .positive('El ID de actividad debe ser positivo'),
  diaSemanaId: z.number()
    .int('El ID de día de semana debe ser un número entero')
    .positive('El ID de día de semana debe ser positivo')
    .min(1, 'ID de día inválido')
    .max(7, 'ID de día inválido'),
  horaInicio: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: 'Formato de hora inválido. Use HH:MM o HH:MM:SS (ej: 09:00 o 09:00:00)'
    }),
  horaFin: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: 'Formato de hora inválido. Use HH:MM o HH:MM:SS (ej: 11:00 o 11:00:00)'
    }),
  activo: z.boolean().default(true)
});

// Schema con validación de coherencia (horaFin > horaInicio)
export const createHorarioActividadSchema = horarioActividadBaseSchema.refine((data) => {
  // Normalizar formato (agregar :00 si solo tiene HH:MM)
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

// Schema para actualizar horario (sin actividadId que es FK inmutable)
export const updateHorarioActividadSchema = horarioActividadBaseSchema
  .omit({ actividadId: true })
  .partial()
  .refine((data) => {
    // Solo validar si ambas horas están presentes
    if (!data.horaInicio || !data.horaFin) return true;

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

// Schema para crear múltiples horarios a la vez
export const createMultiplesHorariosSchema = z.object({
  actividadId: z.number().int().positive(),
  horarios: z.array(
    horarioActividadBaseSchema.omit({ actividadId: true }).refine((data) => {
      const horaInicio = data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio;
      const horaFin = data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin;

      const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
      const [finHora, finMin] = horaFin.split(':').map(Number);
      const inicioMinutos = inicioHora * 60 + inicioMin;
      const finMinutos = finHora * 60 + finMin;

      return finMinutos > inicioMinutos;
    }, {
      message: 'La hora de fin debe ser posterior a la hora de inicio'
    })
  ).min(1, 'Debe proporcionar al menos un horario')
});

// Query para buscar horarios
export const queryHorariosSchema = z.object({
  actividadId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  diaSemanaId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().min(1).max(7).optional()),
  activo: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 50 : parsed;
  }, z.number().int().positive().max(100).default(50))
});

// Schema para consultar actividades por día y hora
export const queryActividadesPorDiaYHoraSchema = z.object({
  diaSemanaId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().min(1).max(7)),
  horaInicio: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .optional(),
  horaFin: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .optional(),
  soloActivas: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(true))
});

// Schema para verificar conflictos de horarios
export const verificarConflictoHorarioSchema = z.object({
  actividadId: z.number().int().positive().optional(),
  diaSemanaId: z.number().int().positive().min(1).max(7),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  aulaId: z.string().optional(),
  docenteId: z.string().optional()
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

export type CreateHorarioActividadDto = z.infer<typeof createHorarioActividadSchema>;
export type UpdateHorarioActividadDto = z.infer<typeof updateHorarioActividadSchema>;
export type CreateMultiplesHorariosDto = z.infer<typeof createMultiplesHorariosSchema>;
export type QueryHorariosDto = z.infer<typeof queryHorariosSchema>;
export type QueryActividadesPorDiaYHoraDto = z.infer<typeof queryActividadesPorDiaYHoraSchema>;
export type VerificarConflictoHorarioDto = z.infer<typeof verificarConflictoHorarioSchema>;
