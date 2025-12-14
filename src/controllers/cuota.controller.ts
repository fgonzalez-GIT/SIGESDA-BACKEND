// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { CuotaService } from '@/services/cuota.service';
import {
  createCuotaSchema,
  updateCuotaSchema,
  cuotaQuerySchema,
  generarCuotasSchema,
  cuotaSearchSchema,
  cuotaStatsSchema,
  deleteBulkCuotasSchema,
  calcularCuotaSchema,
  recalcularCuotasSchema,
  reporteCuotasSchema
} from '@/dto/cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

export class CuotaController {
  constructor(private cuotaService: CuotaService) {}

  async createCuota(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createCuotaSchema.parse(req.body);
      const cuota = await this.cuotaService.createCuota(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Cuota creada exitosamente',
        data: cuota
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = cuotaQuerySchema.parse(req.query);
      const result = await this.cuotaService.getCuotas(query);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: result.pages
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCuotaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cuota = await this.cuotaService.getCuotaById(parseInt(id));

      if (!cuota) {
        const response: ApiResponse = {
          success: false,
          error: 'Cuota no encontrada'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: cuota
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCuotaByReciboId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reciboId } = req.params;
      const cuota = await this.cuotaService.getCuotaByReciboId(reciboId);

      if (!cuota) {
        const response: ApiResponse = {
          success: false,
          error: 'Cuota no encontrada para el recibo especificado'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: cuota
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCuotasPorPeriodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mes, anio } = req.params;
      const { categoria } = req.query;

      const cuotas = await this.cuotaService.getCuotasPorPeriodo(
        parseInt(mes),
        parseInt(anio),
        categoria as any
      );

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          periodo: `${mes}/${anio}`,
          categoria: categoria || 'todas',
          total: cuotas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCuotasBySocio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { socioId } = req.params;
      const { limit } = req.query;

      const cuotas = await this.cuotaService.getCuotasBySocio(
        socioId,
        limit ? parseInt(limit as string) : undefined
      );

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          socioId,
          total: cuotas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCuota(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateCuotaSchema.parse(req.body);
      const cuota = await this.cuotaService.updateCuota(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Cuota actualizada exitosamente',
        data: cuota
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCuota(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cuota = await this.cuotaService.deleteCuota(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Cuota eliminada exitosamente',
        data: cuota
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async generarCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = generarCuotasSchema.parse(req.body);
      const result = await this.cuotaService.generarCuotas(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Generación de cuotas completada: ${result.generated} cuotas creadas`,
        data: {
          generated: result.generated,
          errors: result.errors,
          cuotas: result.cuotas
        },
        meta: {
          periodo: `${validatedData.mes}/${validatedData.anio}`,
          totalGeneradas: result.generated,
          errores: result.errors.length
        }
      };

      // Retornar 207 Multi-Status si hubo errores parciales
      const statusCode = result.errors.length > 0 ? 207 : HttpStatus.CREATED;
      res.status(statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ========================================================================
   * NUEVO ENDPOINT: Generación de cuotas con sistema de ítems + motor de reglas
   * ========================================================================
   *
   * Reemplaza el endpoint legacy /generar con un enfoque moderno que:
   * - Genera cuotas usando el sistema de ítems configurables (FASE 2)
   * - Integra el motor de reglas de descuentos (FASE 3)
   * - Retorna estadísticas de descuentos aplicados
   * - Provee auditoría completa de aplicación de reglas
   *
   * Ruta sugerida: POST /api/cuotas/generar-v2
   */
  async generarCuotasConItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = generarCuotasSchema.parse(req.body);

      logger.info(`[CONTROLLER] Iniciando generación de cuotas V2 - ${validatedData.mes}/${validatedData.anio}`);

      const result = await this.cuotaService.generarCuotasConItems(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Generación de cuotas V2 completada: ${result.generated} cuotas creadas con sistema de ítems`,
        data: {
          generated: result.generated,
          errors: result.errors,
          cuotas: result.cuotas,
          descuentos: result.resumenDescuentos
        },
        meta: {
          periodo: `${validatedData.mes}/${validatedData.anio}`,
          totalGeneradas: result.generated,
          errores: result.errors.length,
          aplicarDescuentos: validatedData.aplicarDescuentos || true,
          // Estadísticas de descuentos (si aplicó)
          ...(result.resumenDescuentos && {
            sociosConDescuento: result.resumenDescuentos.totalSociosConDescuento,
            montoTotalDescuentos: result.resumenDescuentos.montoTotalDescuentos,
            reglasUtilizadas: Object.keys(result.resumenDescuentos.reglasAplicadas).length
          })
        }
      };

      // Retornar 207 Multi-Status si hubo errores parciales
      const statusCode = result.errors.length > 0 ? 207 : HttpStatus.CREATED;

      logger.info(
        `[CONTROLLER] Generación completada - ${result.generated} cuotas creadas, ` +
        `${result.errors.length} errores${
          result.resumenDescuentos ? `, ${result.resumenDescuentos.totalSociosConDescuento} con descuentos` : ''
        }`
      );

      res.status(statusCode).json(response);
    } catch (error) {
      logger.error('[CONTROLLER] Error en generación de cuotas V2:', error);
      next(error);
    }
  }

  async calcularMontoCuota(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = calcularCuotaSchema.parse(req.body);
      const calculo = await this.cuotaService.calcularMontoCuota(validatedData);

      const response: ApiResponse = {
        success: true,
        data: calculo,
        meta: {
          categoria: validatedData.categoria,
          periodo: `${validatedData.mes}/${validatedData.anio}`
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchData = cuotaSearchSchema.parse(req.query);
      const cuotas = await this.cuotaService.searchCuotas(searchData);

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          searchTerm: searchData.search,
          searchBy: searchData.searchBy,
          total: cuotas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statsData = cuotaStatsSchema.parse(req.query);

      // Asignar valores por defecto para las fechas si no se proporcionan
      if (!statsData.fechaDesde) {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        statsData.fechaDesde = startDate.toISOString();
      }

      if (!statsData.fechaHasta) {
        statsData.fechaHasta = new Date().toISOString();
      }

      const stats = await this.cuotaService.getStatistics(statsData);

      const response: ApiResponse = {
        success: true,
        data: stats,
        meta: {
          period: `${statsData.fechaDesde} - ${statsData.fechaHasta}`,
          groupBy: statsData.agruparPor
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getVencidas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cuotas = await this.cuotaService.getVencidas();

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          total: cuotas.length,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPendientes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cuotas = await this.cuotaService.getPendientes();

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          total: cuotas.length,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteBulkCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = deleteBulkCuotasSchema.parse(req.body);
      const result = await this.cuotaService.deleteBulkCuotas(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `${result.count} cuotas eliminadas exitosamente`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async recalcularCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = recalcularCuotasSchema.parse(req.body);
      const result = await this.cuotaService.recalcularCuotas(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Recálculo completado: ${result.updated} cuotas actualizadas`,
        data: {
          updated: result.updated,
          errors: result.errors
        },
        meta: {
          periodo: `${validatedData.mes}/${validatedData.anio}`,
          categoria: validatedData.categoria,
          errores: result.errors.length
        }
      };

      // Retornar 207 Multi-Status si hubo errores parciales
      const statusCode = result.errors.length > 0 ? 207 : HttpStatus.OK;
      res.status(statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getResumenMensual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mes, anio } = req.params;
      const resumen = await this.cuotaService.getResumenMensual(parseInt(mes), parseInt(anio));

      const response: ApiResponse = {
        success: true,
        data: resumen,
        meta: {
          periodo: `${mes}/${anio}`,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async generarReporte(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reporteCuotasSchema.parse({ ...req.params, ...req.query });
      const reporte = await this.cuotaService.generarReporte(validatedData);

      const response: ApiResponse = {
        success: true,
        data: reporte,
        meta: {
          formato: validatedData.formato,
          periodo: `${validatedData.mes}/${validatedData.anio}`,
          generadoEn: reporte.generadoEn
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Dashboard endpoint para cuotas
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const [pendientes, vencidas, resumenActual] = await Promise.all([
        this.cuotaService.getPendientes(),
        this.cuotaService.getVencidas(),
        this.cuotaService.getResumenMensual(currentMonth, currentYear)
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          pendientes: pendientes.slice(0, 10), // Primeras 10 pendientes
          vencidas: vencidas.slice(0, 10), // Primeras 10 vencidas
          resumenMesActual: resumenActual
        },
        meta: {
          pendientesCount: pendientes.length,
          vencidasCount: vencidas.length,
          mesActual: `${currentMonth}/${currentYear}`,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Endpoint para obtener períodos disponibles
  async getPeriodosDisponibles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const periodos = [];

      // Generar periodos desde enero del año actual hasta 2 meses en el futuro
      for (let year = currentYear - 1; year <= currentYear + 1; year++) {
        for (let month = 1; month <= 12; month++) {
          const periodDate = new Date(year, month - 1, 1);
          const maxDate = new Date(currentYear, currentMonth + 1, 1);

          if (periodDate <= maxDate) {
            periodos.push({
              mes: month,
              anio: year,
              display: `${this.getNombreMes(month)} ${year}`,
              value: `${month}/${year}`
            });
          }
        }
      }

      const response: ApiResponse = {
        success: true,
        data: periodos.reverse(), // Más recientes primero
        meta: {
          total: periodos.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Endpoint para validar si se pueden generar cuotas
  async validarGeneracionCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mes, anio } = req.params;
      const { categoria } = req.query;

      // Verificar cuotas existentes
      const cuotasExistentes = await this.cuotaService.getCuotasPorPeriodo(
        parseInt(mes),
        parseInt(anio),
        categoria as any
      );

      // Obtener socios pendientes
      const sociosPendientes = await this.cuotaService['cuotaRepository'].getCuotasPorGenerar(
        parseInt(mes),
        parseInt(anio),
        categoria ? [categoria as any] : undefined
      );

      const response: ApiResponse = {
        success: true,
        data: {
          puedeGenerar: sociosPendientes.length > 0,
          cuotasExistentes: cuotasExistentes.length,
          sociosPendientes: sociosPendientes.length,
          detallesSocios: sociosPendientes.map(s => ({
            id: s.id,
            nombre: `${s.nombre} ${s.apellido}`,
            numeroSocio: s.numeroSocio,
            categoria: s.categoria
          }))
        },
        meta: {
          periodo: `${mes}/${anio}`,
          categoria: categoria || 'todas'
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Método auxiliar privado
  private getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
  }
}