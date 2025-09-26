import { z } from 'zod';
import { MedioPagoTipo } from '@prisma/client';

// ===== ENUMS =====
export const MedioPagoTipoSchema = z.nativeEnum(MedioPagoTipo);

// ===== ESQUEMAS BASE =====

// Para crear un medio de pago
export const CreateMedioPagoSchema = z.object({
  reciboId: z.string().cuid("ID de recibo inválido"),
  tipo: MedioPagoTipoSchema,
  importe: z.number().positive("El importe debe ser positivo"),
  numero: z.string().optional(),
  fecha: z.string().datetime("Fecha inválida").optional(),
  banco: z.string().optional(),
  observaciones: z.string().max(500, "Las observaciones no pueden exceder 500 caracteres").optional(),
}).refine((data) => {
  // Validaciones específicas por tipo de medio de pago
  if (data.tipo === MedioPagoTipo.CHEQUE) {
    if (!data.numero) {
      return false;
    }
    if (!data.banco) {
      return false;
    }
  }

  if (data.tipo === MedioPagoTipo.TRANSFERENCIA) {
    if (!data.numero) {
      return false;
    }
  }

  return true;
}, {
  message: "Datos requeridos según el tipo de medio de pago",
  path: ["tipo"]
}).refine((data) => {
  // Validar que el número de cheque/comprobante sea válido
  if (data.numero && data.numero.trim().length === 0) {
    return false;
  }
  return true;
}, {
  message: "El número de comprobante/cheque no puede estar vacío",
  path: ["numero"]
});

// Para actualizar un medio de pago
export const UpdateMedioPagoSchema = z.object({
  tipo: MedioPagoTipoSchema.optional(),
  importe: z.number().positive("El importe debe ser positivo").optional(),
  numero: z.string().optional(),
  fecha: z.string().datetime("Fecha inválida").optional(),
  banco: z.string().optional(),
  observaciones: z.string().max(500, "Las observaciones no pueden exceder 500 caracteres").optional(),
});

// Para filtros de búsqueda
export const MedioPagoFilterSchema = z.object({
  // Filtros básicos
  reciboId: z.string().cuid().optional(),
  tipo: MedioPagoTipoSchema.optional(),

  // Filtros por montos
  importeMinimo: z.number().min(0).optional(),
  importeMaximo: z.number().min(0).optional(),

  // Filtros por fecha
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),

  // Filtros específicos
  banco: z.string().optional(),
  numero: z.string().optional(),

  // Paginación y ordenamiento
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  orderBy: z.enum(['fecha', 'importe', 'tipo', 'numero']).default('fecha'),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

// Para búsqueda avanzada
export const MedioPagoSearchSchema = z.object({
  search: z.string().min(1, "El término de búsqueda es requerido"),
  searchBy: z.enum(['numero', 'banco', 'recibo', 'all']).default('all'),
  tipo: MedioPagoTipoSchema.optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
});

// Para estadísticas
export const MedioPagoStatsSchema = z.object({
  fechaDesde: z.string().datetime(),
  fechaHasta: z.string().datetime(),
  agruparPor: z.enum(['tipo', 'banco', 'mes', 'general']).default('tipo'),
  reciboId: z.string().cuid().optional(),
}).refine((data) => {
  const desde = new Date(data.fechaDesde);
  const hasta = new Date(data.fechaHasta);
  return desde < hasta;
}, {
  message: "La fecha desde debe ser anterior a la fecha hasta",
  path: ["fechaHasta"]
});

// Para operaciones masivas
export const DeleteBulkMediosPagoSchema = z.object({
  ids: z.array(z.string().cuid())
    .min(1, "Debe proporcionar al menos un ID")
    .max(50, "No se pueden eliminar más de 50 medios de pago a la vez"),
  confirmarEliminacion: z.boolean()
    .refine(val => val === true, {
      message: "Debe confirmar la eliminación"
    })
});

// Para validación de pagos completos
export const ValidarPagoCompletoSchema = z.object({
  reciboId: z.string().cuid("ID de recibo inválido"),
  tolerancia: z.number().min(0).max(100).default(0.01), // Tolerancia en pesos para diferencias menores
});

// Para conciliación bancaria
export const ConciliacionBancariaSchema = z.object({
  banco: z.string().min(1, "El banco es requerido"),
  fechaDesde: z.string().datetime(),
  fechaHasta: z.string().datetime(),
  tipo: z.enum(['CHEQUE', 'TRANSFERENCIA']).optional(),
});

// ===== TIPOS TYPESCRIPT =====
export type CreateMedioPagoDto = z.infer<typeof CreateMedioPagoSchema>;
export type UpdateMedioPagoDto = z.infer<typeof UpdateMedioPagoSchema>;
export type MedioPagoFilterDto = z.infer<typeof MedioPagoFilterSchema>;
export type MedioPagoSearchDto = z.infer<typeof MedioPagoSearchSchema>;
export type MedioPagoStatsDto = z.infer<typeof MedioPagoStatsSchema>;
export type DeleteBulkMediosPagoDto = z.infer<typeof DeleteBulkMediosPagoSchema>;
export type ValidarPagoCompletoDto = z.infer<typeof ValidarPagoCompletoSchema>;
export type ConciliacionBancariaDto = z.infer<typeof ConciliacionBancariaSchema>;

// ===== TIPOS DE RESPUESTA =====
export interface MedioPagoResponseDto {
  id: string;
  reciboId: string;
  tipo: MedioPagoTipo;
  importe: number;
  numero?: string;
  fecha: Date;
  banco?: string;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;

  // Datos del recibo relacionado
  recibo?: {
    numero: string;
    estado: string;
    importe: number;
    concepto: string;
    fecha: Date;
    receptor?: {
      nombre: string;
      apellido: string;
      dni: string;
    };
  };
}

export interface MedioPagoStatsResponseDto {
  totalMediosPago: number;
  importeTotal: number;

  // Por tipo de medio de pago
  porTipo: {
    tipo: MedioPagoTipo;
    cantidad: number;
    importeTotal: number;
    porcentaje: number;
  }[];

  // Por banco (para cheques y transferencias)
  porBanco?: {
    banco: string;
    cantidad: number;
    importeTotal: number;
    tipos: MedioPagoTipo[];
  }[];

  // Tendencia mensual
  tendenciaMensual?: {
    mes: number;
    anio: number;
    cantidad: number;
    importeTotal: number;
    tipos: {
      tipo: MedioPagoTipo;
      cantidad: number;
      importe: number;
    }[];
  }[];
}

export interface ValidacionPagoResponseDto {
  reciboId: string;
  importeRecibo: number;
  importeTotalPagos: number;
  diferencia: number;
  esPagoCompleto: boolean;
  estado: 'COMPLETO' | 'PARCIAL' | 'EXCEDIDO';

  mediosPago: {
    id: string;
    tipo: MedioPagoTipo;
    importe: number;
    fecha: Date;
    numero?: string;
    banco?: string;
  }[];

  alertas: string[];
}

export interface ConciliacionBancariaResponseDto {
  banco: string;
  periodo: {
    desde: Date;
    hasta: Date;
  };

  resumen: {
    totalOperaciones: number;
    importeTotal: number;
    tiposOperaciones: {
      tipo: MedioPagoTipo;
      cantidad: number;
      importe: number;
    }[];
  };

  operaciones: {
    id: string;
    tipo: MedioPagoTipo;
    numero: string;
    importe: number;
    fecha: Date;
    recibo: {
      numero: string;
      concepto: string;
      receptor: string;
    };
  }[];

  estadisticas: {
    promedioOperacion: number;
    operacionMayor: number;
    operacionMenor: number;
    diasConOperaciones: number;
  };
}