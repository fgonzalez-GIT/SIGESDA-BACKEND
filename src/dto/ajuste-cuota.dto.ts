import { z } from 'zod';

/**
 * DTOs for AjusteCuotaSocio and HistorialAjusteCuota
 * FASE 4: Manual adjustments and change history
 */

// ══════════════════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════════════════

export const TipoAjusteCuotaEnum = z.enum([
  'DESCUENTO_FIJO',
  'DESCUENTO_PORCENTAJE',
  'RECARGO_FIJO',
  'RECARGO_PORCENTAJE',
  'MONTO_FIJO_TOTAL'
]);

export const ScopeAjusteCuotaEnum = z.enum([
  'TODOS_ITEMS',
  'SOLO_BASE',
  'SOLO_ACTIVIDADES',
  'ITEMS_ESPECIFICOS'
]);

export const AccionHistorialCuotaEnum = z.enum([
  'CREAR_AJUSTE',
  'MODIFICAR_AJUSTE',
  'ELIMINAR_AJUSTE',
  'APLICAR_AJUSTE_MANUAL',
  'RECALCULAR_CUOTA',
  'REGENERAR_CUOTA'
]);

// ══════════════════════════════════════════════════════════════════════
// CREATE DTOs
// ══════════════════════════════════════════════════════════════════════

/**
 * Schema for creating a new manual adjustment
 */
export const createAjusteCuotaSchema = z.object({
  personaId: z.number().int().positive('El ID de persona debe ser un número positivo'),
  tipoAjuste: TipoAjusteCuotaEnum,
  valor: z.number().positive('El valor debe ser un número positivo'),
  concepto: z.string().min(1, 'El concepto es obligatorio').max(200, 'El concepto no puede exceder 200 caracteres'),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date().optional().nullable(),
  activo: z.boolean().optional().default(true),
  motivo: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  aplicaA: ScopeAjusteCuotaEnum.optional().default('TODOS_ITEMS'),
  itemsAfectados: z.array(z.number().int().positive()).optional().nullable(),
  aprobadoPor: z.string().max(100).optional().nullable()
}).refine(
  data => {
    // If aplicaA is ITEMS_ESPECIFICOS, itemsAfectados must be provided
    if (data.aplicaA === 'ITEMS_ESPECIFICOS') {
      return data.itemsAfectados && data.itemsAfectados.length > 0;
    }
    return true;
  },
  {
    message: 'itemsAfectados debe contener al menos un item cuando aplicaA es ITEMS_ESPECIFICOS',
    path: ['itemsAfectados']
  }
).refine(
  data => {
    // If fechaFin is provided, it must be after fechaInicio
    if (data.fechaFin && data.fechaInicio) {
      return data.fechaFin >= data.fechaInicio;
    }
    return true;
  },
  {
    message: 'fechaFin debe ser posterior a fechaInicio',
    path: ['fechaFin']
  }
).refine(
  data => {
    // For percentage-based adjustments, valor should be <= 100
    if (data.tipoAjuste === 'DESCUENTO_PORCENTAJE' || data.tipoAjuste === 'RECARGO_PORCENTAJE') {
      return data.valor <= 100;
    }
    return true;
  },
  {
    message: 'El porcentaje no puede exceder 100%',
    path: ['valor']
  }
);

export type CreateAjusteCuotaDto = z.infer<typeof createAjusteCuotaSchema>;

/**
 * Schema for creating a history entry
 */
export const createHistorialAjusteCuotaSchema = z.object({
  ajusteId: z.number().int().positive().optional().nullable(),
  cuotaId: z.number().int().positive().optional().nullable(),
  personaId: z.number().int().positive('El ID de persona debe ser un número positivo'),
  accion: AccionHistorialCuotaEnum,
  datosPrevios: z.any().optional().nullable(),
  datosNuevos: z.any(),
  usuario: z.string().max(100).optional().nullable(),
  motivoCambio: z.string().optional().nullable()
}).refine(
  data => {
    // At least one of ajusteId or cuotaId must be provided
    return data.ajusteId || data.cuotaId;
  },
  {
    message: 'Al menos uno de ajusteId o cuotaId debe ser proporcionado',
    path: ['ajusteId']
  }
);

export type CreateHistorialAjusteCuotaDto = z.infer<typeof createHistorialAjusteCuotaSchema>;

// ══════════════════════════════════════════════════════════════════════
// UPDATE DTOs
// ══════════════════════════════════════════════════════════════════════

/**
 * Schema for updating an existing adjustment
 */
export const updateAjusteCuotaSchema = z.object({
  tipoAjuste: TipoAjusteCuotaEnum.optional(),
  valor: z.number().positive('El valor debe ser un número positivo').optional(),
  concepto: z.string().min(1).max(200).optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional().nullable(),
  activo: z.boolean().optional(),
  motivo: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  aplicaA: ScopeAjusteCuotaEnum.optional(),
  itemsAfectados: z.array(z.number().int().positive()).optional().nullable(),
  aprobadoPor: z.string().max(100).optional().nullable()
}).refine(
  data => {
    // For percentage-based adjustments, valor should be <= 100
    if (data.tipoAjuste && data.valor) {
      if (data.tipoAjuste === 'DESCUENTO_PORCENTAJE' || data.tipoAjuste === 'RECARGO_PORCENTAJE') {
        return data.valor <= 100;
      }
    }
    return true;
  },
  {
    message: 'El porcentaje no puede exceder 100%',
    path: ['valor']
  }
);

export type UpdateAjusteCuotaDto = z.infer<typeof updateAjusteCuotaSchema>;

// ══════════════════════════════════════════════════════════════════════
// QUERY DTOs
// ══════════════════════════════════════════════════════════════════════

/**
 * Schema for querying adjustments
 */
export const queryAjusteCuotaSchema = z.object({
  personaId: z.coerce.number().int().positive().optional(),
  tipoAjuste: TipoAjusteCuotaEnum.optional(),
  activo: z.coerce.boolean().optional(),
  aplicaA: ScopeAjusteCuotaEnum.optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional()
});

export type QueryAjusteCuotaDto = z.infer<typeof queryAjusteCuotaSchema>;

/**
 * Schema for querying history entries
 */
export const queryHistorialAjusteCuotaSchema = z.object({
  accion: AccionHistorialCuotaEnum.optional(),
  personaId: z.coerce.number().int().positive().optional(),
  cuotaId: z.coerce.number().int().positive().optional(),
  ajusteId: z.coerce.number().int().positive().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0)
});

export type QueryHistorialAjusteCuotaDto = z.infer<typeof queryHistorialAjusteCuotaSchema>;

// ══════════════════════════════════════════════════════════════════════
// APLICAR AJUSTE DTO
// ══════════════════════════════════════════════════════════════════════

/**
 * Schema for applying adjustments to a cuota
 * Used when manually applying an adjustment to an existing cuota
 */
export const aplicarAjusteACuotaSchema = z.object({
  cuotaId: z.number().int().positive('El ID de cuota debe ser un número positivo'),
  ajusteId: z.number().int().positive('El ID de ajuste debe ser un número positivo'),
  usuario: z.string().max(100).optional().nullable(),
  motivoCambio: z.string().optional().nullable()
});

export type AplicarAjusteACuotaDto = z.infer<typeof aplicarAjusteACuotaSchema>;
