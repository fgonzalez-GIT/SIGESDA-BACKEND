import { z } from 'zod';

// Schema base para aulas
const aulaBaseSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100),
  capacidad: z.preprocess((val) => {
    // Convert string to number if needed
    if (typeof val === 'string') {
      const parsed = parseInt(val);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number().int().positive('La capacidad debe ser positiva')),
  ubicacion: z.string().max(200).optional(),
  tipoAulaId: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().int().positive('ID de tipo de aula inválido').optional()),
  estadoAulaId: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().int().positive('ID de estado de aula inválido').optional()),
  descripcion: z.string().max(1000).optional(),
  observaciones: z.string().max(1000).optional(),
  activa: z.preprocess((val) => {
    // Convert string to boolean if needed
    if (typeof val === 'string') {
      return val === 'true';
    }
    // Convert estado to activa (frontend compatibility)
    if (val === 'disponible') return true;
    if (val === 'no_disponible') return false;
    return val;
  }, z.boolean().default(true)),
  // Array de equipamientos para asignar al crear/actualizar (opcional)
  equipamientos: z.array(z.object({
    equipamientoId: z.number().int().positive('ID de equipamiento inválido'),
    cantidad: z.number().int().positive('La cantidad debe ser positiva').default(1),
    observaciones: z.string().max(500).optional()
  })).optional()
});

// DTO para crear aula
// Soporta tanto 'equipamientos' (array de objetos) como 'equipamientoIds' (array de números)
export const createAulaSchema = z.preprocess((data: any) => {
  // Convertir equipamientoIds a equipamientos si existe
  if (data && data.equipamientoIds && Array.isArray(data.equipamientoIds)) {
    return {
      ...data,
      equipamientos: data.equipamientoIds.map((id: number) => ({
        equipamientoId: id,
        cantidad: 1
      }))
    };
  }
  return data;
}, z.object({
  ...aulaBaseSchema.shape
}));

// DTO para actualizar aula
// Soporta tanto 'equipamientos' (array de objetos) como 'equipamientoIds' (array de números)
export const updateAulaSchema = z.preprocess((data: any) => {
  // Convertir equipamientoIds a equipamientos si existe
  if (data && data.equipamientoIds && Array.isArray(data.equipamientoIds)) {
    return {
      ...data,
      equipamientos: data.equipamientoIds.map((id: number) => ({
        equipamientoId: id,
        cantidad: 1
      }))
    };
  }
  return data;
}, z.object({
  ...aulaBaseSchema.partial().shape
}));

// Query filters para listar aulas
export const aulaQuerySchema = z.object({
  activa: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  tipoAulaId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
  estadoAulaId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().int().positive().optional()),
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
  }, z.boolean().optional()), // Filtra aulas que tienen equipamiento asignado
  search: z.string().optional(), // Búsqueda por nombre, ubicación, descripción
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