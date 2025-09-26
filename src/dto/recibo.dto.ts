import { z } from 'zod';
import { TipoRecibo, EstadoRecibo } from '@prisma/client';

// Create recibo schema
export const createReciboSchema = z.object({
  tipo: z.nativeEnum(TipoRecibo, {
    errorMap: () => ({ message: 'Tipo de recibo inválido' })
  }),
  importe: z.number().positive('El importe debe ser mayor a 0'),
  fecha: z.string().datetime('Fecha inválida').optional(),
  fechaVencimiento: z.string().datetime('Fecha de vencimiento inválida').optional(),
  concepto: z.string().min(1, 'Concepto es requerido').max(200, 'Concepto no puede exceder 200 caracteres'),
  observaciones: z.string().max(500, 'Observaciones no pueden exceder 500 caracteres').optional(),
  emisorId: z.string().cuid('ID de emisor inválido').optional(),
  receptorId: z.string().cuid('ID de receptor inválido').optional()
}).refine(
  (data) => {
    if (data.fechaVencimiento && data.fecha) {
      const fecha = new Date(data.fecha);
      const vencimiento = new Date(data.fechaVencimiento);
      return vencimiento >= fecha;
    }
    return true;
  },
  {
    message: 'La fecha de vencimiento debe ser posterior o igual a la fecha del recibo',
    path: ['fechaVencimiento']
  }
).refine(
  (data) => {
    // Business rules for emisor/receptor based on tipo
    if (data.tipo === TipoRecibo.CUOTA || data.tipo === TipoRecibo.PAGO_ACTIVIDAD) {
      return data.receptorId; // Cuotas and activity payments must have receptor
    }
    if (data.tipo === TipoRecibo.SUELDO) {
      return data.receptorId; // Salaries must have receptor (docente)
    }
    return true;
  },
  {
    message: 'Este tipo de recibo requiere especificar el receptor',
    path: ['receptorId']
  }
);

// Update recibo schema
export const updateReciboSchema = z.object({
  tipo: z.nativeEnum(TipoRecibo).optional(),
  importe: z.number().positive('El importe debe ser mayor a 0').optional(),
  fecha: z.string().datetime('Fecha inválida').optional(),
  fechaVencimiento: z.string().datetime('Fecha de vencimiento inválida').optional().nullable(),
  estado: z.nativeEnum(EstadoRecibo).optional(),
  concepto: z.string().min(1, 'Concepto es requerido').max(200).optional(),
  observaciones: z.string().max(500).optional().nullable(),
  emisorId: z.string().cuid('ID de emisor inválido').optional().nullable(),
  receptorId: z.string().cuid('ID de receptor inválido').optional().nullable()
}).refine(
  (data) => {
    if (data.fechaVencimiento && data.fecha) {
      const fecha = new Date(data.fecha);
      const vencimiento = new Date(data.fechaVencimiento);
      return vencimiento >= fecha;
    }
    return true;
  },
  {
    message: 'La fecha de vencimiento debe ser posterior o igual a la fecha del recibo',
    path: ['fechaVencimiento']
  }
);

// Change estado schema
export const changeEstadoReciboSchema = z.object({
  nuevoEstado: z.nativeEnum(EstadoRecibo, {
    errorMap: () => ({ message: 'Estado de recibo inválido' })
  }),
  observaciones: z.string().max(500, 'Observaciones no pueden exceder 500 caracteres').optional()
});

// Query filters
export const reciboQuerySchema = z.object({
  tipo: z.nativeEnum(TipoRecibo).optional(),
  estado: z.nativeEnum(EstadoRecibo).optional(),
  emisorId: z.string().cuid().optional(),
  receptorId: z.string().cuid().optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  vencidosOnly: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(false)),
  pendientesOnly: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(false)),
  importeMinimo: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  importeMaximo: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10))
});

// Bulk operations schemas
export const createBulkRecibosSchema = z.object({
  recibos: z.array(createReciboSchema).min(1, 'Debe proporcionar al menos un recibo')
});

export const deleteBulkRecibosSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'Debe proporcionar al menos un ID')
});

export const updateBulkEstadosSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'Debe proporcionar al menos un ID'),
  nuevoEstado: z.nativeEnum(EstadoRecibo),
  observaciones: z.string().max(500).optional()
});

// Search schema
export const reciboSearchSchema = z.object({
  search: z.string().min(1, 'Término de búsqueda requerido'),
  searchBy: z.enum(['numero', 'concepto', 'emisor', 'receptor', 'all']).default('all'),
  tipo: z.nativeEnum(TipoRecibo).optional(),
  estado: z.nativeEnum(EstadoRecibo).optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional()
});

// Statistics schema
export const reciboStatsSchema = z.object({
  fechaDesde: z.string().datetime(),
  fechaHasta: z.string().datetime(),
  agruparPor: z.enum(['tipo', 'estado', 'mes', 'persona']).default('tipo')
}).refine(
  (data) => {
    const desde = new Date(data.fechaDesde);
    const hasta = new Date(data.fechaHasta);
    return desde <= hasta;
  },
  {
    message: 'La fecha desde debe ser anterior o igual a la fecha hasta',
    path: ['fechaHasta']
  }
);

// Payment processing schema
export const processPaymentSchema = z.object({
  reciboId: z.string().cuid('ID de recibo inválido'),
  mediosPago: z.array(z.object({
    tipo: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE']),
    importe: z.number().positive('El importe del medio de pago debe ser mayor a 0'),
    numero: z.string().max(50).optional(), // número de cheque, comprobante, etc.
    fecha: z.string().datetime().optional(),
    banco: z.string().max(100).optional(),
    observaciones: z.string().max(200).optional()
  })).min(1, 'Debe especificar al menos un medio de pago')
}).refine(
  (data) => {
    // Validate specific payment method requirements
    return data.mediosPago.every(medio => {
      if (medio.tipo === 'CHEQUE' && !medio.numero) {
        return false; // Cheques require numero
      }
      if ((medio.tipo === 'TRANSFERENCIA' || medio.tipo === 'TARJETA_DEBITO' || medio.tipo === 'TARJETA_CREDITO') && !medio.banco) {
        return false; // Bank transfers and cards require banco
      }
      return true;
    });
  },
  {
    message: 'Algunos medios de pago requieren información adicional (número para cheques, banco para transferencias/tarjetas)',
    path: ['mediosPago']
  }
);

// Report generation schema
export const generateReportSchema = z.object({
  tipo: z.enum(['resumen', 'detallado', 'vencimientos', 'cobranzas']),
  fechaDesde: z.string().datetime(),
  fechaHasta: z.string().datetime(),
  filtros: z.object({
    tipos: z.array(z.nativeEnum(TipoRecibo)).optional(),
    estados: z.array(z.nativeEnum(EstadoRecibo)).optional(),
    personas: z.array(z.string().cuid()).optional()
  }).optional()
});

export type CreateReciboDto = z.infer<typeof createReciboSchema>;
export type UpdateReciboDto = z.infer<typeof updateReciboSchema>;
export type ChangeEstadoReciboDto = z.infer<typeof changeEstadoReciboSchema>;
export type ReciboQueryDto = z.infer<typeof reciboQuerySchema>;
export type CreateBulkRecibosDto = z.infer<typeof createBulkRecibosSchema>;
export type DeleteBulkRecibosDto = z.infer<typeof deleteBulkRecibosSchema>;
export type UpdateBulkEstadosDto = z.infer<typeof updateBulkEstadosSchema>;
export type ReciboSearchDto = z.infer<typeof reciboSearchSchema>;
export type ReciboStatsDto = z.infer<typeof reciboStatsSchema>;
export type ProcessPaymentDto = z.infer<typeof processPaymentSchema>;
export type GenerateReportDto = z.infer<typeof generateReportSchema>;