/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FASE 4 - Task 4.4: Reportes y Estadísticas de Cuotas - Controller
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Controller layer for comprehensive reporting and analytics on cuotas system
 *
 * @module ReportesCuotaController
 * @author SIGESDA Development Team
 * @date 2025-12-15
 */

import { Request, Response, NextFunction } from 'express';
import { ReportesCuotaService } from '@/services/reportes-cuota.service';
import {
  dashboardCuotasSchema,
  reportePorCategoriaSchema,
  analisisDescuentosSchema,
  reporteExencionesSchema,
  reporteComparativoSchema,
  estadisticasRecaudacionSchema,
  exportarReporteSchema
} from '@/dto/reportes-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

export class ReportesCuotaController {
  constructor(private reportesService: ReportesCuotaService) {}

  /**
   * @swagger
   * /api/reportes/cuotas/dashboard:
   *   get:
   *     summary: Dashboard general de cuotas ⭐ FASE 4
   *     description: |
   *       Retorna métricas clave del sistema de cuotas para un período específico:
   *       - Totales: cuotas generadas, pagadas, pendientes, vencidas
   *       - Montos: recaudado, pendiente, vencido
   *       - Promedios: monto por cuota, descuentos aplicados
   *       - Gráficos: Evolución temporal, distribución por estado
   *     tags: [Reportes]
   *     parameters:
   *       - in: query
   *         name: mes
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *         description: Mes del reporte
   *         example: 12
   *       - in: query
   *         name: anio
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 2020
   *         description: Año del reporte
   *         example: 2025
   *       - in: query
   *         name: categoriaId
   *         schema:
   *           type: integer
   *         description: Filtrar por categoría de socio (opcional)
   *     responses:
   *       200:
   *         description: Dashboard generado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         periodo:
   *                           type: object
   *                           properties:
   *                             mes:
   *                               type: integer
   *                             anio:
   *                               type: integer
   *                             displayName:
   *                               type: string
   *                               example: "Diciembre 2025"
   *                         totales:
   *                           type: object
   *                           properties:
   *                             cuotasGeneradas:
   *                               type: integer
   *                             cuotasPagadas:
   *                               type: integer
   *                             cuotasPendientes:
   *                               type: integer
   *                             cuotasVencidas:
   *                               type: integer
   *                         montos:
   *                           type: object
   *                           properties:
   *                             totalRecaudado:
   *                               type: number
   *                             totalPendiente:
   *                               type: number
   *                             totalVencido:
   *                               type: number
   *                             montoPromedio:
   *                               type: number
   *                         descuentos:
   *                           type: object
   *                           properties:
   *                             totalDescuentosAplicados:
   *                               type: number
   *                             sociosConDescuento:
   *                               type: integer
   *                             porcentajePromedio:
   *                               type: number
   *       400:
   *         description: Parámetros inválidos
   */
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = dashboardCuotasSchema.parse(req.query);
      const dashboard = await this.reportesService.getDashboard(validatedQuery);

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard de cuotas generado exitosamente',
        data: dashboard
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reportes/cuotas/categoria:
   *   get:
   *     summary: Reporte por categoría de socio ⭐ FASE 4
   *     description: Agrupa cuotas y estadísticas por categoría de socio (SOCIO_ACTIVO, SOCIO_MENOR, etc.)
   *     tags: [Reportes]
   *     parameters:
   *       - in: query
   *         name: mes
   *         required: true
   *         schema:
   *           type: integer
   *         example: 12
   *       - in: query
   *         name: anio
   *         required: true
   *         schema:
   *           type: integer
   *         example: 2025
   *     responses:
   *       200:
   *         description: Reporte generado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async getReportePorCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = reportePorCategoriaSchema.parse(req.query);
      const reporte = await this.reportesService.getReportePorCategoria(validatedQuery);

      const response: ApiResponse = {
        success: true,
        message: 'Reporte por categoría generado exitosamente',
        data: reporte
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reportes/cuotas/descuentos:
   *   get:
   *     summary: Análisis de descuentos aplicados ⭐ FASE 4
   *     description: |
   *       Análisis detallado de todos los descuentos aplicados:
   *       - Ajustes manuales (fijos y porcentuales)
   *       - Reglas automáticas de descuento
   *       - Exenciones temporales
   *       Útil para auditoría y análisis de impacto financiero.
   *     tags: [Reportes]
   *     parameters:
   *       - in: query
   *         name: mes
   *         required: true
   *         schema:
   *           type: integer
   *         example: 12
   *       - in: query
   *         name: anio
   *         required: true
   *         schema:
   *           type: integer
   *         example: 2025
   *       - in: query
   *         name: tipoDescuento
   *         schema:
   *           type: string
   *           enum: [AJUSTES, REGLAS, EXENCIONES, TODOS]
   *         description: Filtrar por tipo de descuento
   *     responses:
   *       200:
   *         description: Análisis generado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async getAnalisisDescuentos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = analisisDescuentosSchema.parse(req.query);
      const analisis = await this.reportesService.getAnalisisDescuentos(validatedQuery);

      const response: ApiResponse = {
        success: true,
        message: 'Análisis de descuentos generado exitosamente',
        data: analisis
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reportes/cuotas/exenciones:
   *   get:
   *     summary: Reporte de exenciones vigentes ⭐ FASE 4
   *     description: Lista todas las exenciones activas y su impacto financiero en el período
   *     tags: [Reportes]
   *     parameters:
   *       - in: query
   *         name: mes
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: anio
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Reporte generado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async getReporteExenciones(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = reporteExencionesSchema.parse(req.query);
      const reporte = await this.reportesService.getReporteExenciones(validatedQuery);

      const response: ApiResponse = {
        success: true,
        message: 'Reporte de exenciones generado exitosamente',
        data: reporte
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reportes/cuotas/comparativo:
   *   get:
   *     summary: Reporte comparativo entre períodos ⭐ FASE 4
   *     description: Compara métricas entre dos períodos (ej. Diciembre 2024 vs Diciembre 2025)
   *     tags: [Reportes]
   *     parameters:
   *       - in: query
   *         name: mesPeriodo1
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: anioPeriodo1
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: mesPeriodo2
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: anioPeriodo2
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Comparativo generado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async getReporteComparativo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = reporteComparativoSchema.parse(req.query);
      const reporte = await this.reportesService.getReporteComparativo(validatedQuery);

      const response: ApiResponse = {
        success: true,
        message: 'Reporte comparativo generado exitosamente',
        data: reporte
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reportes/cuotas/recaudacion:
   *   get:
   *     summary: Estadísticas de recaudación y morosidad ⭐ FASE 4
   *     description: |
   *       Análisis de recaudación y pagos:
   *       - Tasa de morosidad
   *       - Evolución de pagos
   *       - Proyecciones de recaudación
   *     tags: [Reportes]
   *     parameters:
   *       - in: query
   *         name: mesInicio
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: anioInicio
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: mesFin
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: anioFin
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Estadísticas generadas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async getEstadisticasRecaudacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = estadisticasRecaudacionSchema.parse(req.query);
      const estadisticas = await this.reportesService.getEstadisticasRecaudacion(validatedQuery);

      const response: ApiResponse = {
        success: true,
        message: 'Estadísticas de recaudación generadas exitosamente',
        data: estadisticas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reportes/cuotas/exportar:
   *   post:
   *     summary: Exportar reporte en formato específico ⭐ FASE 4
   *     description: |
   *       Exporta cualquier tipo de reporte en el formato solicitado.
   *       **Formatos soportados**: JSON (otros en desarrollo: Excel, PDF, CSV)
   *     tags: [Reportes]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - tipoReporte
   *               - formato
   *             properties:
   *               tipoReporte:
   *                 type: string
   *                 enum: [dashboard, categoria, descuentos, exenciones, comparativo, recaudacion]
   *                 description: Tipo de reporte a exportar
   *               formato:
   *                 type: string
   *                 enum: [json, excel, pdf, csv]
   *                 description: Formato de exportación
   *                 default: json
   *               parametros:
   *                 type: object
   *                 description: Parámetros específicos del reporte
   *     responses:
   *       200:
   *         description: Reporte exportado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       501:
   *         description: Formato no implementado
   *       400:
   *         description: Tipo de reporte inválido
   */
  async exportarReporte(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = exportarReporteSchema.parse(req.body);

      // Por ahora solo soportamos JSON, pero la estructura está lista
      // para agregar exportación a Excel/PDF/CSV en el futuro
      if (validatedData.formato !== 'json') {
        const response: ApiResponse = {
          success: false,
          error: `Formato '${validatedData.formato}' no implementado aún. Use 'json' por ahora.`
        };
        res.status(HttpStatus.NOT_IMPLEMENTED).json(response);
        return;
      }

      // Delegar al servicio correspondiente según tipoReporte
      let data: any;
      switch (validatedData.tipoReporte) {
        case 'dashboard':
          data = await this.reportesService.getDashboard(validatedData.parametros);
          break;
        case 'categoria':
          data = await this.reportesService.getReportePorCategoria(validatedData.parametros);
          break;
        case 'descuentos':
          data = await this.reportesService.getAnalisisDescuentos(validatedData.parametros);
          break;
        case 'exenciones':
          data = await this.reportesService.getReporteExenciones(validatedData.parametros);
          break;
        case 'comparativo':
          data = await this.reportesService.getReporteComparativo(validatedData.parametros);
          break;
        case 'recaudacion':
          data = await this.reportesService.getEstadisticasRecaudacion(validatedData.parametros);
          break;
        default:
          const response: ApiResponse = {
            success: false,
            error: `Tipo de reporte '${validatedData.tipoReporte}' no reconocido`
          };
          res.status(HttpStatus.BAD_REQUEST).json(response);
          return;
      }

      const response: ApiResponse = {
        success: true,
        message: `Reporte '${validatedData.tipoReporte}' exportado exitosamente`,
        data: {
          formato: validatedData.formato,
          tipoReporte: validatedData.tipoReporte,
          fechaGeneracion: new Date(),
          contenido: data
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
