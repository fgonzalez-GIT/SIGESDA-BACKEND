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
      // Si es "all", devolver un número grande para indicar sin límite
      if (val === 'all') return 999999;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? 10 : parsed;
    },
    z.number().int().positive().max(999999).default(10)
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
  personaId: z.preprocess(
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
  mes: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().min(1).max(12)
  ),
  anio: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().min(2020).max(2030)
  ),
  categoriaId: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().optional()
  ),
  formato: z.enum(['json', 'excel', 'pdf']).default('json'),
  incluirDetalle: z.string()
    .transform(val => val === 'true')
    .optional()
    .default('true' as any),
  incluirEstadisticas: z.string()
    .transform(val => val === 'true')
    .optional()
    .default('true' as any)
});

export type ReporteCuotasDto = z.infer<typeof reporteCuotasSchema>;

// ══════════════════════════════════════════════════════════════════════
// FASE 4 - Task 4.3: Recálculo y Regeneración de Cuotas
// ══════════════════════════════════════════════════════════════════════

/**
 * DTO para recalcular una cuota existente
 * Aplica ajustes manuales y exenciones vigentes a una cuota ya generada
 */
export const recalcularCuotaSchema = z.object({
  cuotaId: z.number().int().positive('El ID de cuota debe ser un número positivo'),
  aplicarAjustes: z.boolean().default(true),
  aplicarExenciones: z.boolean().default(true),
  aplicarDescuentos: z.boolean().default(true),
  usuario: z.string().max(100).optional()
});

export type RecalcularCuotaDto = z.infer<typeof recalcularCuotaSchema>;

/**
 * DTO para regenerar cuotas de un período
 * Elimina y recrea cuotas aplicando configuración actual
 */
export const regenerarCuotasSchema = z.object({
  mes: z.number().int().min(1, 'El mes debe ser entre 1 y 12').max(12, 'El mes debe ser entre 1 y 12'),
  anio: z.number().int().min(2020, 'El año debe ser 2020 o posterior').max(2030, 'El año no puede ser mayor a 2030'),
  categoriaId: z.number().int().positive().optional(),
  personaId: z.number().int().positive().optional(),
  aplicarAjustes: z.boolean().default(true),
  aplicarExenciones: z.boolean().default(true),
  aplicarDescuentos: z.boolean().default(true),
  confirmarRegeneracion: z.boolean().refine(val => val === true, {
    message: 'Debe confirmar la regeneración de cuotas'
  })
});

export type RegenerarCuotasDto = z.infer<typeof regenerarCuotasSchema>;

/**
 * DTO para preview de recálculo/regeneración
 * Muestra cómo quedarían las cuotas sin aplicar cambios
 */
export const previewRecalculoSchema = z.object({
  cuotaId: z.number().int().positive().optional(),
  mes: z.number().int().min(1).max(12).optional(),
  anio: z.number().int().min(2020).max(2030).optional(),
  categoriaId: z.number().int().positive().optional(),
  personaId: z.number().int().positive().optional(),
  aplicarAjustes: z.boolean().default(true),
  aplicarExenciones: z.boolean().default(true),
  aplicarDescuentos: z.boolean().default(true)
}).refine(
  data => data.cuotaId || (data.mes && data.anio),
  {
    message: 'Debe proporcionar cuotaId o (mes + anio)',
    path: ['cuotaId']
  }
);

export type PreviewRecalculoDto = z.infer<typeof previewRecalculoSchema>;

/**
 * DTO para comparar cuota antes/después de cambios
 * Usado tanto para recálculo como para preview de cambios propuestos
 */
export const compararCuotaSchema = z.object({
  cuotaId: z.number().int().positive('El ID de cuota debe ser un número positivo'),
  cambiosPropuestos: z.object({
    nuevoDescuento: z.number().min(0).max(100).optional(),
    nuevosAjustes: z.array(z.object({
      tipoItemCuotaId: z.number().int().positive(),
      monto: z.number(),
      motivo: z.string().min(10).max(200)
    })).optional(),
    nuevasExenciones: z.array(z.object({
      tipoItemCuotaId: z.number().int().positive(),
      porcentaje: z.number().min(0).max(100),
      motivo: z.string().min(10).max(200)
    })).optional()
  }).optional() // Opcional para retrocompatibilidad con endpoint de recálculo
});

export type CompararCuotaDto = z.infer<typeof compararCuotaSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// FASE 5: DTOs PARA SIMULADOR DE CUOTAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para simular generación de cuotas sin persistir en BD
 * Útil para preview antes de generar
 */
export const simularGeneracionSchema = z.object({
  mes: z.number().int().min(1, 'El mes debe ser entre 1 y 12').max(12, 'El mes debe ser entre 1 y 12'),
  anio: z.number().int().min(2020, 'El año debe ser 2020 o posterior').max(2030, 'El año no puede ser mayor a 2030'),
  categoriaIds: z.array(z.number().int().positive('ID de categoría inválido')).optional(),
  socioIds: z.array(z.number().int().positive('ID de socio inválido')).optional(),
  aplicarDescuentos: z.boolean().default(true),
  aplicarAjustes: z.boolean().default(true),
  aplicarExenciones: z.boolean().default(true),
  incluirInactivos: z.boolean().default(false)
}).refine(
  data => !data.categoriaIds || data.categoriaIds.length > 0,
  {
    message: 'Si proporciona categorías, debe incluir al menos una',
    path: ['categoriaIds']
  }
).refine(
  data => !data.socioIds || data.socioIds.length > 0,
  {
    message: 'Si proporciona socios, debe incluir al menos uno',
    path: ['socioIds']
  }
);

export type SimularGeneracionDto = z.infer<typeof simularGeneracionSchema>;

/**
 * DTO para simular cambios en reglas de descuento
 * Permite ver impacto antes de modificar reglas
 */
export const simularReglaDescuentoSchema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2030),
  reglasModificadas: z.array(z.object({
    reglaId: z.number().int().positive().optional(),
    tipo: z.enum(['ANTIGUEDAD', 'FAMILIAR', 'CATEGORIA', 'COMBINADA']),
    porcentaje: z.number().min(0, 'El porcentaje debe ser entre 0 y 100').max(100, 'El porcentaje debe ser entre 0 y 100'),
    condiciones: z.record(z.any()),
    activa: z.boolean().default(true)
  })),
  reglasNuevas: z.array(z.object({
    codigo: z.string().min(3, 'El código debe tener al menos 3 caracteres'),
    nombre: z.string().min(5, 'El nombre debe tener al menos 5 caracteres'),
    tipo: z.enum(['ANTIGUEDAD', 'FAMILIAR', 'CATEGORIA', 'COMBINADA']),
    porcentaje: z.number().min(0).max(100),
    condiciones: z.record(z.any()),
    activa: z.boolean().default(true)
  })).optional(),
  socioIds: z.array(z.number().int().positive()).optional(),
  categoriaIds: z.array(z.number().int().positive()).optional()
});

export type SimularReglaDescuentoDto = z.infer<typeof simularReglaDescuentoSchema>;

/**
 * DTO para comparar diferentes escenarios de generación
 * Permite evaluar múltiples configuraciones y elegir la mejor
 */
export const compararEscenariosSchema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2030),
  escenarios: z.array(z.object({
    nombre: z.string().min(3, 'El nombre del escenario debe tener al menos 3 caracteres'),
    descripcion: z.string().max(200, 'La descripción no puede exceder 200 caracteres').optional(),
    aplicarDescuentos: z.boolean().default(true),
    aplicarAjustes: z.boolean().default(true),
    aplicarExenciones: z.boolean().default(true),
    porcentajeDescuentoGlobal: z.number().min(0).max(100).optional(),
    montoFijoDescuento: z.number().min(0).optional()
  })).min(2, 'Debe proporcionar al menos 2 escenarios para comparar').max(5, 'No se pueden comparar más de 5 escenarios'),
  socioIds: z.array(z.number().int().positive()).optional(),
  categoriaIds: z.array(z.number().int().positive()).optional()
});

export type CompararEscenariosDto = z.infer<typeof compararEscenariosSchema>;

/**
 * DTO para simulación de impacto masivo
 * Calcula el impacto económico de cambios en reglas/configuración
 */
export const simularImpactoMasivoSchema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2030),
  cambios: z.object({
    nuevosMontosPorCategoria: z.record(z.string(), z.number().positive()).optional(),
    nuevasPorcentajesDescuento: z.record(z.string(), z.number().min(0).max(100)).optional(),
    ajusteGlobalPorcentaje: z.number().min(-50).max(50).optional(),
    ajusteGlobalMonto: z.number().optional()
  }),
  incluirProyeccion: z.boolean().default(false),
  mesesProyeccion: z.number().int().min(1).max(12).optional()
});

export type SimularImpactoMasivoDto = z.infer<typeof simularImpactoMasivoSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// FASE 5: DTOs PARA AJUSTE MASIVO DE CUOTAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para aplicar ajuste masivo a múltiples cuotas
 * Permite modificar múltiples ítems de cuotas en batch
 */
export const ajusteMasivoSchema = z.object({
  // Filtros para seleccionar cuotas
  filtros: z.object({
    mes: z.number().int().min(1).max(12).optional(),
    anio: z.number().int().min(2020).max(2030).optional(),
    categoriaIds: z.array(z.number().int().positive()).optional(),
    socioIds: z.array(z.number().int().positive()).optional(),
    estadoCuota: z.enum(['PENDIENTE', 'PAGADO', 'VENCIDO', 'ANULADO']).optional()
  }),
  // Tipo de ajuste a aplicar
  tipoAjuste: z.enum(['DESCUENTO_PORCENTAJE', 'DESCUENTO_FIJO', 'RECARGO_PORCENTAJE', 'RECARGO_FIJO', 'MONTO_FIJO_TOTAL']),
  // Valor del ajuste
  valor: z.number().min(0, 'El valor debe ser mayor o igual a 0'),
  // Motivo del ajuste (obligatorio para auditoría)
  motivo: z.string().min(10, 'El motivo debe tener al menos 10 caracteres').max(200, 'El motivo no puede exceder 200 caracteres'),
  // Aplicar solo si coincide con condiciones
  condiciones: z.object({
    montoMinimo: z.number().min(0).optional(),
    montoMaximo: z.number().min(0).optional(),
    soloConDescuentos: z.boolean().optional(),
    soloSinExenciones: z.boolean().optional()
  }).optional(),
  // Modo de aplicación
  modo: z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
  // Confirmación explícita (requerida para APLICAR)
  confirmarAplicacion: z.boolean().optional()
}).refine(
  data => data.tipoAjuste !== 'DESCUENTO_PORCENTAJE' || data.valor <= 100,
  {
    message: 'El porcentaje de descuento no puede exceder 100%',
    path: ['valor']
  }
).refine(
  data => data.tipoAjuste !== 'RECARGO_PORCENTAJE' || data.valor <= 100,
  {
    message: 'El porcentaje de recargo no puede exceder 100%',
    path: ['valor']
  }
).refine(
  data => data.modo !== 'APLICAR' || data.confirmarAplicacion === true,
  {
    message: 'Debe confirmar la aplicación del ajuste masivo',
    path: ['confirmarAplicacion']
  }
);

export type AjusteMasivoDto = z.infer<typeof ajusteMasivoSchema>;

/**
 * DTO para modificar múltiples ítems de cuotas
 * Permite actualizar conceptos, montos, etc. en batch
 */
export const modificarItemsMasivoSchema = z.object({
  // Filtros para seleccionar ítems
  filtros: z.object({
    mes: z.number().int().min(1).max(12).optional(),
    anio: z.number().int().min(2020).max(2030).optional(),
    categoriaItemId: z.number().int().positive().optional(),
    tipoItemId: z.number().int().positive().optional(),
    conceptoContiene: z.string().min(3).optional()
  }),
  // Modificaciones a aplicar
  modificaciones: z.object({
    nuevoConcepto: z.string().min(3).max(100).optional(),
    nuevoMonto: z.number().min(0).optional(),
    nuevoPorcentaje: z.number().min(0).max(100).optional(),
    multiplicarMonto: z.number().min(0.1).max(10).optional()
  }),
  // Motivo de la modificación
  motivo: z.string().min(10).max(200),
  // Modo de aplicación
  modo: z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
  // Confirmación
  confirmarModificacion: z.boolean().optional()
}).refine(
  data => Object.keys(data.modificaciones).length > 0,
  {
    message: 'Debe especificar al menos una modificación',
    path: ['modificaciones']
  }
).refine(
  data => data.modo !== 'APLICAR' || data.confirmarModificacion === true,
  {
    message: 'Debe confirmar la modificación masiva',
    path: ['confirmarModificacion']
  }
);

export type ModificarItemsMasivoDto = z.infer<typeof modificarItemsMasivoSchema>;

/**
 * DTO para aplicar descuento global a todas las cuotas de un período
 */
export const descuentoGlobalSchema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2030),
  // Tipo de descuento
  tipoDescuento: z.enum(['PORCENTAJE', 'MONTO_FIJO']),
  // Valor del descuento
  valor: z.number().min(0),
  // Motivo del descuento global
  motivo: z.string().min(10).max(200),
  // Filtros opcionales
  filtros: z.object({
    categoriaIds: z.array(z.number().int().positive()).optional(),
    socioIds: z.array(z.number().int().positive()).optional(),
    montoMinimo: z.number().min(0).optional()
  }).optional(),
  // Modo
  modo: z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
  // Confirmación
  confirmarDescuento: z.boolean().optional()
}).refine(
  data => data.tipoDescuento !== 'PORCENTAJE' || data.valor <= 100,
  {
    message: 'El porcentaje de descuento no puede exceder 100%',
    path: ['valor']
  }
).refine(
  data => data.modo !== 'APLICAR' || data.confirmarDescuento === true,
  {
    message: 'Debe confirmar el descuento global',
    path: ['confirmarDescuento']
  }
);

export type DescuentoGlobalDto = z.infer<typeof descuentoGlobalSchema>;

/**
 * DTO para validar cambios antes de aplicar ajustes masivos
 * Retorna advertencias y validaciones
 */
export const validarAjusteMasivoSchema = z.object({
  cuotasAfectadas: z.number().int().min(0),
  montoTotalOriginal: z.number().min(0),
  montoTotalNuevo: z.number().min(0),
  impactoEconomico: z.number(),
  advertencias: z.array(z.string()),
  errores: z.array(z.string())
});

export type ValidarAjusteMasivoDto = z.infer<typeof validarAjusteMasivoSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// FASE 5: DTOs PARA ROLLBACK DE GENERACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para hacer rollback de generación masiva de cuotas
 * Permite deshacer una generación completa con validaciones
 */
export const rollbackGeneracionSchema = z.object({
  // Identificador del período a revertir
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2030),
  // Filtros opcionales
  categoriaIds: z.array(z.number().int().positive()).optional(),
  socioIds: z.array(z.number().int().positive()).optional(),
  // Modo de operación
  modo: z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
  // Opciones de rollback
  opciones: z.object({
    eliminarCuotasPendientes: z.boolean().default(true),
    eliminarCuotasPagadas: z.boolean().default(false),
    restaurarRecibos: z.boolean().default(true),
    crearBackup: z.boolean().default(true)
  }).optional(),
  // Confirmación obligatoria
  confirmarRollback: z.boolean().optional(),
  // Motivo del rollback (para auditoría)
  motivo: z.string().min(10, 'El motivo debe tener al menos 10 caracteres').max(200).optional()
}).refine(
  data => data.modo !== 'APLICAR' || data.confirmarRollback === true,
  {
    message: 'Debe confirmar el rollback para aplicar',
    path: ['confirmarRollback']
  }
).refine(
  data => data.modo !== 'APLICAR' || data.motivo,
  {
    message: 'Debe proporcionar un motivo para el rollback',
    path: ['motivo']
  }
);

export type RollbackGeneracionDto = z.infer<typeof rollbackGeneracionSchema>;

/**
 * DTO para rollback por ID de cuota específica
 * Permite deshacer una cuota individual y sus dependencias
 */
export const rollbackCuotaSchema = z.object({
  cuotaId: z.number().int().positive('El ID de cuota debe ser un número positivo'),
  eliminarItemsAsociados: z.boolean().default(true),
  eliminarRecibo: z.boolean().default(true),
  modo: z.enum(['PREVIEW', 'APLICAR']).default('PREVIEW'),
  confirmarRollback: z.boolean().optional(),
  motivo: z.string().min(10).max(200).optional()
}).refine(
  data => data.modo !== 'APLICAR' || data.confirmarRollback === true,
  {
    message: 'Debe confirmar el rollback',
    path: ['confirmarRollback']
  }
);

export type RollbackCuotaDto = z.infer<typeof rollbackCuotaSchema>;

/**
 * DTO para validar si se puede hacer rollback
 * Retorna advertencias y bloqueos
 */
export const validarRollbackSchema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2030),
  categoriaIds: z.array(z.number().int().positive()).optional(),
  socioIds: z.array(z.number().int().positive()).optional()
});

export type ValidarRollbackDto = z.infer<typeof validarRollbackSchema>;

// ========================================
// FASE 5 - Task 5.4: Preview en UI
// DTOs para vista previa detallada de cuotas
// ========================================

/**
 * DTO para solicitar preview de cuota
 * Puede ser por ID de cuota existente o por datos para generar preview
 */
export const previewCuotaSchema = z.object({
  // Opción 1: Preview de cuota existente
  cuotaId: z.number().int().positive().optional(),

  // Opción 2: Preview de cuota a generar (simulación)
  socioId: z.number().int().positive().optional(),
  mes: z.number().int().min(1).max(12).optional(),
  anio: z.number().int().min(2020).max(2030).optional(),
  categoriaId: z.number().int().positive().optional(),

  // Opciones de visualización
  incluirDetalleItems: z.boolean().default(true),
  incluirExplicacionDescuentos: z.boolean().default(true),
  incluirHistorialCambios: z.boolean().default(false),
  formato: z.enum(['COMPLETO', 'RESUMIDO', 'SIMPLE']).default('COMPLETO')
}).refine(
  data => data.cuotaId !== undefined || (data.socioId !== undefined && data.mes !== undefined && data.anio !== undefined),
  {
    message: 'Debe proporcionar cuotaId O (socioId + mes + anio)',
    path: ['cuotaId']
  }
);

export type PreviewCuotaDto = z.infer<typeof previewCuotaSchema>;

/**
 * DTO para preview de cuotas de un socio (múltiples períodos)
 */
export const previewCuotasSocioSchema = z.object({
  socioId: z.number().int().positive('ID de socio debe ser positivo'),
  mesDesde: z.number().int().min(1).max(12),
  anioDesde: z.number().int().min(2020).max(2030),
  mesHasta: z.number().int().min(1).max(12).optional(),
  anioHasta: z.number().int().min(2020).max(2030).optional(),
  incluirPagadas: z.boolean().default(false),
  incluirAnuladas: z.boolean().default(false),
  formato: z.enum(['COMPLETO', 'RESUMIDO', 'SIMPLE']).default('RESUMIDO')
});

export type PreviewCuotasSocioDto = z.infer<typeof previewCuotasSocioSchema>;

