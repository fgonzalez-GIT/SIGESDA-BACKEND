import { z } from 'zod';
import { TipoActividad } from '@prisma/client';

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
  docenteIds: z.array(z.string().cuid()).optional().default([])
});

// DTO para actualizar actividad
export const updateActividadSchema = z.object({
  ...actividadBaseSchema.partial().shape,
  docenteIds: z.array(z.string().cuid()).optional()
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

export type CreateActividadDto = z.infer<typeof createActividadSchema>;
export type UpdateActividadDto = z.infer<typeof updateActividadSchema>;
export type ActividadQueryDto = z.infer<typeof actividadQuerySchema>;
export type AsignarDocenteDto = z.infer<typeof asignarDocenteSchema>;
export type EstadisticasActividadDto = z.infer<typeof estadisticasActividadSchema>;