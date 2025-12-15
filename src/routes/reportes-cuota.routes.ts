/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FASE 4 - Task 4.4: Reportes y Estadísticas de Cuotas - Routes
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Routes for comprehensive reporting and analytics on cuotas system
 *
 * @module ReportesCuotaRoutes
 * @author SIGESDA Development Team
 * @date 2025-12-15
 */

import { Router } from 'express';
import { ReportesCuotaController } from '@/controllers/reportes-cuota.controller';
import { ReportesCuotaService } from '@/services/reportes-cuota.service';

const router = Router();

// Initialize service and controller
const reportesService = new ReportesCuotaService();
const reportesController = new ReportesCuotaController(reportesService);

// ═══════════════════════════════════════════════════════════════════════════
// REPORTING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/reportes/cuotas/dashboard
 * Dashboard general con métricas clave
 * Query params (optional): mes, anio
 */
router.get('/dashboard', reportesController.getDashboard.bind(reportesController));

/**
 * GET /api/reportes/cuotas/categoria
 * Reporte agrupado por categoría de socio
 * Query params (required): mes, anio
 * Query params (optional): categoriaId, incluirDetalle
 */
router.get('/categoria', reportesController.getReportePorCategoria.bind(reportesController));

/**
 * GET /api/reportes/cuotas/descuentos
 * Análisis de descuentos aplicados (ajustes + reglas + exenciones)
 * Query params (required): mes, anio
 * Query params (optional): categoriaId, tipoDescuento
 */
router.get('/descuentos', reportesController.getAnalisisDescuentos.bind(reportesController));

/**
 * GET /api/reportes/cuotas/exenciones
 * Reporte de exenciones vigentes
 * Query params (optional): estado, categoriaId, motivoExencion, incluirHistorico
 */
router.get('/exenciones', reportesController.getReporteExenciones.bind(reportesController));

/**
 * GET /api/reportes/cuotas/comparativo
 * Reporte comparativo entre dos períodos
 * Query params (required): mesInicio, anioInicio, mesFin, anioFin
 */
router.get('/comparativo', reportesController.getReporteComparativo.bind(reportesController));

/**
 * GET /api/reportes/cuotas/recaudacion
 * Estadísticas de recaudación y morosidad
 * Query params (optional): mes, anio, categoriaId
 */
router.get('/recaudacion', reportesController.getEstadisticasRecaudacion.bind(reportesController));

/**
 * POST /api/reportes/cuotas/exportar
 * Exportar cualquier reporte en formato especificado
 * Body: { tipoReporte, formato, parametros }
 */
router.post('/exportar', reportesController.exportarReporte.bind(reportesController));

export default router;
