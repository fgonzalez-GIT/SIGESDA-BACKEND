/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FASE 4 - Task 4.4: Reportes y Estadísticas de Cuotas
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DTOs for comprehensive reporting and analytics on cuotas system
 *
 * @module ReportesCuotaDTO
 * @author SIGESDA Development Team
 * @date 2025-12-15
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard General
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para obtener dashboard general de cuotas
 * Incluye métricas clave del sistema de cuotas
 */
export const dashboardCuotasSchema = z.object({
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
  )
});

export type DashboardCuotasDto = z.infer<typeof dashboardCuotasSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// Reporte por Categoría
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para reporte de cuotas por categoría
 * Agrupa estadísticas por categoría de socio
 */
export const reportePorCategoriaSchema = z.object({
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
  incluirDetalle: z.string()
    .transform(val => val === 'true')
    .optional()
    .default('false' as any)
});

export type ReportePorCategoriaDto = z.infer<typeof reportePorCategoriaSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// Análisis de Descuentos
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para análisis de descuentos aplicados
 * Incluye ajustes manuales, reglas automáticas y exenciones
 */
export const analisisDescuentosSchema = z.object({
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
  tipoDescuento: z.enum(['ajustes', 'reglas', 'exenciones', 'todos']).optional().default('todos')
});

export type AnalisisDescuentosDto = z.infer<typeof analisisDescuentosSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// Reporte de Exenciones
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para reporte de exenciones vigentes
 * Muestra exenciones activas y su impacto
 */
export const reporteExencionesSchema = z.object({
  estado: z.enum(['PENDIENTE_APROBACION', 'APROBADA', 'RECHAZADA', 'VIGENTE', 'VENCIDA', 'REVOCADA', 'TODAS'])
    .optional()
    .default('VIGENTE'),
  categoriaId: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().optional()
  ),
  motivoExencion: z.enum(['BECA', 'SOCIO_FUNDADOR', 'SOCIO_HONORARIO', 'SITUACION_ECONOMICA', 'SITUACION_SALUD', 'INTERCAMBIO_SERVICIOS', 'PROMOCION', 'FAMILIAR_DOCENTE', 'OTRO', 'TODOS'])
    .optional()
    .default('TODOS'),
  incluirHistorico: z.string()
    .transform(val => val === 'true')
    .optional()
    .default('false' as any)
});

export type ReporteExencionesDto = z.infer<typeof reporteExencionesSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// Reporte Comparativo Mensual
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para reporte comparativo entre meses
 * Compara métricas entre diferentes períodos
 */
export const reporteComparativoSchema = z.object({
  mesInicio: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().min(1).max(12)
  ),
  anioInicio: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().min(2020).max(2030)
  ),
  mesFin: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().min(1).max(12)
  ),
  anioFin: z.preprocess(
    (val) => {
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().min(2020).max(2030)
  )
}).refine(
  (data) => {
    const fechaInicio = new Date(data.anioInicio, data.mesInicio - 1);
    const fechaFin = new Date(data.anioFin, data.mesFin - 1);
    return fechaInicio <= fechaFin;
  },
  {
    message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
    path: ['mesFin']
  }
);

export type ReporteComparativoDto = z.infer<typeof reporteComparativoSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// Estadísticas de Recaudación
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para estadísticas de recaudación
 * Muestra estado de pagos y deudas
 */
export const estadisticasRecaudacionSchema = z.object({
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
  categoriaId: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().optional()
  )
});

export type EstadisticasRecaudacionDto = z.infer<typeof estadisticasRecaudacionSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// Exportar Reporte (Excel/PDF)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO para exportar reportes en diferentes formatos
 */
export const exportarReporteSchema = z.object({
  tipoReporte: z.enum(['dashboard', 'categoria', 'descuentos', 'exenciones', 'comparativo', 'recaudacion']),
  formato: z.enum(['json', 'excel', 'pdf', 'csv']).default('json'),
  parametros: z.record(z.any()).optional()
});

export type ExportarReporteDto = z.infer<typeof exportarReporteSchema>;
