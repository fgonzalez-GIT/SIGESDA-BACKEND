import { z } from 'zod';

// DTO para crear cuota individual
export const createCuotaSchema = z.object({
  reciboId: z.number().int().positive('ID de recibo inválido'),
  categoriaId: z.number().int().positive('ID de categoría inválido'),
  mes: z.number()
    .int('El mes debe ser un número entero')
    .min(1, 'El mes debe ser entre 1 y 12')
    .max(12, 'El mes debe ser entre 1 y 12'),
  anio: z.number()
    .int('El año debe ser un número entero')
    .min(2020, 'El año debe ser 2020 o posterior')
    .max(2030, 'El año no puede ser mayor a 2030'),
  montoBase: z.number()
    .positive('El monto base debe ser mayor a 0')
    .max(100000, 'El monto base no puede exceder $100,000'),
  montoActividades: z.number()
    .min(0, 'El monto de actividades no puede ser negativo')
    .max(50000, 'El monto de actividades no puede exceder $50,000')
    .default(0),
  montoTotal: z.number()
    .positive('El monto total debe ser mayor a 0')
    .max(150000, 'El monto total no puede exceder $150,000')
}).refine((data) => {
  // Validar que el monto total sea la suma de base + actividades
  const calculatedTotal = data.montoBase + data.montoActividades;
  return Math.abs(data.montoTotal - calculatedTotal) < 0.01;
}, {
  message: 'El monto total debe ser igual a la suma de monto base + monto actividades',
  path: ['montoTotal']
}).refine((data) => {
  // Validar que el mes/año no sea en el futuro
  const currentDate = new Date();
  const cuotaDate = new Date(data.anio, data.mes - 1, 1);
  const maxAllowedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1);

  return cuotaDate <= maxAllowedDate;
}, {
  message: 'No se pueden crear cuotas con más de 2 meses de anticipación',
  path: ['mes']
});

export type CreateCuotaDto = z.infer<typeof createCuotaSchema>;

// DTO para actualizar cuota
export const updateCuotaSchema = z.object({
  categoriaId: z.number().int().positive('ID de categoría inválido').optional(),
  mes: z.number()
    .int('El mes debe ser un número entero')
    .min(1, 'El mes debe ser entre 1 y 12')
    .max(12, 'El mes debe ser entre 1 y 12')
    .optional(),
  anio: z.number()
    .int('El año debe ser un número entero')
    .min(2020, 'El año debe ser 2020 o posterior')
    .max(2030, 'El año no puede ser mayor a 2030')
    .optional(),
  montoBase: z.number()
    .positive('El monto base debe ser mayor a 0')
    .max(100000, 'El monto base no puede exceder $100,000')
    .optional(),
  montoActividades: z.number()
    .min(0, 'El monto de actividades no puede ser negativo')
    .max(50000, 'El monto de actividades no puede exceder $50,000')
    .optional(),
  montoTotal: z.number()
    .positive('El monto total debe ser mayor a 0')
    .max(150000, 'El monto total no puede exceder $150,000')
    .optional()
});

export type UpdateCuotaDto = z.infer<typeof updateCuotaSchema>;

// DTO para generar cuotas masivamente
export const generarCuotasSchema = z.object({
  mes: z.number()
    .int('El mes debe ser un número entero')
    .min(1, 'El mes debe ser entre 1 y 12')
    .max(12, 'El mes debe ser entre 1 y 12'),
  anio: z.number()
    .int('El año debe ser un número entero')
    .min(2020, 'El año debe ser 2020 o posterior')
    .max(2030, 'El año no puede ser mayor a 2030'),
  categoriaIds: z.array(z.number().int().positive('ID de categoría inválido'))
    .min(1, 'Debe especificar al menos un ID de categoría')
    .optional(),
  incluirInactivos: z.boolean()
    .default(false),
  aplicarDescuentos: z.boolean()
    .default(true),
  observaciones: z.string()
    .max(200, 'Las observaciones no pueden exceder 200 caracteres')
    .optional()
}).refine((data) => {
  // Validar que no sea demasiado en el pasado (máximo 6 meses)
  const currentDate = new Date();
  const cuotaDate = new Date(data.anio, data.mes - 1, 1);
  const minAllowedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);

  return cuotaDate >= minAllowedDate;
}, {
  message: 'No se pueden generar cuotas de más de 6 meses en el pasado',
  path: ['mes']
});

export type GenerarCuotasDto = z.infer<typeof generarCuotasSchema>;

// DTO para consultar cuotas
export const cuotaQuerySchema = z.object({
  page: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? 1 : parsed;
    },
    z.number().int().positive().default(1)
  ),
  limit: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? 10 : parsed;
    },
    z.number().int().positive().max(100).default(10)
  ),
  categoriaId: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().optional()
  ),
  mes: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().min(1).max(12).optional()
  ),
  anio: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().min(2020).max(2030).optional()
  ),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  reciboId: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().optional()
  ),
  soloImpagas: z.string()
    .transform(val => val === 'true')
    .optional(),
  soloVencidas: z.string()
    .transform(val => val === 'true')
    .optional(),
  ordenarPor: z.enum(['fecha', 'monto', 'categoria', 'vencimiento'])
    .default('fecha'),
  orden: z.enum(['asc', 'desc']).default('desc')
});

export type CuotaQueryDto = z.infer<typeof cuotaQuerySchema>;

// DTO para calcular cuota
export const calcularCuotaSchema = z.object({
  categoriaId: z.number().int().positive('ID de categoría inválido'),
  mes: z.number().int().min(1).max(12).optional(),
  anio: z.number().int().min(2020).max(2030).optional(),
  socioId: z.number().int().positive('ID de socio inválido').optional(),
  incluirActividades: z.boolean().default(true),
  aplicarDescuentos: z.boolean().default(true)
});

export type CalcularCuotaDto = z.infer<typeof calcularCuotaSchema>;

// DTO para búsqueda de cuotas
export const cuotaSearchSchema = z.object({
  search: z.string()
    .min(1, 'El término de búsqueda es requerido')
    .max(50, 'El término de búsqueda no puede exceder 50 caracteres'),
  searchBy: z.enum(['socio', 'numero_recibo', 'all'])
    .default('all'),
  categoriaId: z.number().int().positive().optional(),
  mes: z.number().int().min(1).max(12).optional(),
  anio: z.number().int().min(2020).max(2030).optional(),
  estado: z.enum(['PENDIENTE', 'PAGADO', 'VENCIDO', 'CANCELADO']).optional()
});

export type CuotaSearchDto = z.infer<typeof cuotaSearchSchema>;

// DTO para estadísticas de cuotas
export const cuotaStatsSchema = z.object({
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  agruparPor: z.enum(['categoria', 'mes', 'estado', 'general'])
    .default('general')
}).refine((data) => {
  // Si ambas fechas están presentes, validar que desde < hasta
  if (data.fechaDesde && data.fechaHasta) {
    const desde = new Date(data.fechaDesde);
    const hasta = new Date(data.fechaHasta);
    return desde < hasta;
  }
  return true;
}, {
  message: 'La fecha desde debe ser anterior a la fecha hasta',
  path: ['fechaHasta']
});

export type CuotaStatsDto = z.infer<typeof cuotaStatsSchema>;

// DTO para operaciones masivas de cuotas
export const deleteBulkCuotasSchema = z.object({
  ids: z.array(z.number().int().positive())
    .min(1, 'Debe proporcionar al menos un ID')
    .max(100, 'No se pueden eliminar más de 100 cuotas a la vez'),
  confirmarEliminacion: z.boolean()
    .refine(val => val === true, {
      message: 'Debe confirmar la eliminación'
    })
});

export type DeleteBulkCuotasDto = z.infer<typeof deleteBulkCuotasSchema>;

// DTO para recálculo de cuotas
export const recalcularCuotasSchema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2030),
  categoriaId: z.number().int().positive().optional(),
  aplicarDescuentos: z.boolean().default(true),
  actualizarRecibos: z.boolean().default(false)
});

export type RecalcularCuotasDto = z.infer<typeof recalcularCuotasSchema>;

// DTO para reporte de cuotas
export const reporteCuotasSchema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2030),
  categoriaId: z.number().int().positive().optional(),
  formato: z.enum(['json', 'excel', 'pdf']).default('json'),
  incluirDetalle: z.boolean().default(true),
  incluirEstadisticas: z.boolean().default(true)
});

export type ReporteCuotasDto = z.infer<typeof reporteCuotasSchema>;