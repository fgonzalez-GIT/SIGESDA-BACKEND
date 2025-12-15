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
   * GET /api/reportes/cuotas/dashboard
   * Dashboard general de cuotas con métricas clave
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
   * GET /api/reportes/cuotas/categoria
   * Reporte de cuotas agrupado por categoría de socio
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
   * GET /api/reportes/cuotas/descuentos
   * Análisis de descuentos aplicados (ajustes + reglas + exenciones)
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
   * GET /api/reportes/cuotas/exenciones
   * Reporte de exenciones vigentes y su impacto
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
   * GET /api/reportes/cuotas/comparativo
   * Reporte comparativo entre dos períodos
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
   * GET /api/reportes/cuotas/recaudacion
   * Estadísticas de recaudación y morosidad
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
   * POST /api/reportes/cuotas/exportar
   * Exportar reporte en formato especificado (json, excel, pdf, csv)
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
