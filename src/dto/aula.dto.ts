import { z } from 'zod';

// Schema base para aulas
const aulaBaseSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100),
  capacidad: z.number().int().positive('La capacidad debe ser positiva'),
  ubicacion: z.string().max(200).optional(),
  equipamiento: z.string().max(500).optional(),
  activa: z.boolean().default(true)
});

// DTO para crear aula
export const createAulaSchema = z.object({
  ...aulaBaseSchema.shape
});

// DTO para actualizar aula
export const updateAulaSchema = z.object({
  ...aulaBaseSchema.partial().shape
});

// Query filters para listar aulas
export const aulaQuerySchema = z.object({
  activa: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  capacidadMinima: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  capacidadMaxima: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  conEquipamiento: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  search: z.string().optional(), // Búsqueda por nombre, ubicación o equipamiento
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10))
});

// DTO para verificar disponibilidad
export const disponibilidadAulaSchema = z.object({
  fechaInicio: z.string().datetime('Fecha inicio inválida'),
  fechaFin: z.string().datetime('Fecha fin inválida'),
  excluirReservaId: z.string().cuid().optional() // Para excluir una reserva específica al editar
}).refine((data) => {
  const inicio = new Date(data.fechaInicio);
  const fin = new Date(data.fechaFin);
  return inicio < fin;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['fechaFin']
});

// DTO para obtener estadísticas de aula
export const estadisticasAulaSchema = z.object({
  incluirReservas: z.boolean().default(true),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional()
});

export type CreateAulaDto = z.infer<typeof createAulaSchema>;
export type UpdateAulaDto = z.infer<typeof updateAulaSchema>;
export type AulaQueryDto = z.infer<typeof aulaQuerySchema>;
export type DisponibilidadAulaDto = z.infer<typeof disponibilidadAulaSchema>;
export type EstadisticasAulaDto = z.infer<typeof estadisticasAulaSchema>;