import { Request, Response, NextFunction } from 'express';
import { ReciboService } from '@/services/recibo.service';
import {
  createReciboSchema,
  updateReciboSchema,
  changeEstadoReciboSchema,
  reciboQuerySchema,
  createBulkRecibosSchema,
  deleteBulkRecibosSchema,
  updateBulkEstadosSchema,
  reciboSearchSchema,
  reciboStatsSchema
} from '@/dto/recibo.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

export class ReciboController {
  constructor(private reciboService: ReciboService) {}

  async createRecibo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createReciboSchema.parse(req.body);
      const recibo = await this.reciboService.createRecibo(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Recibo creado exitosamente',
        data: recibo
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getRecibos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = reciboQuerySchema.parse(req.query);
      const result = await this.reciboService.getRecibos(query);

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

  async getReciboById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const recibo = await this.reciboService.getReciboById(id);

      if (!recibo) {
        const response: ApiResponse = {
          success: false,
          error: 'Recibo no encontrado'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: recibo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReciboByNumero(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { numero } = req.params;
      const recibo = await this.reciboService.getReciboByNumero(numero);

      if (!recibo) {
        const response: ApiResponse = {
          success: false,
          error: 'Recibo no encontrado'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: recibo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getRecibosByPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const { tipo } = req.query;
      const tipoFilter = tipo as 'emisor' | 'receptor' | undefined;

      const recibos = await this.reciboService.getRecibosByPersona(personaId, tipoFilter);

      const response: ApiResponse = {
        success: true,
        data: recibos,
        meta: {
          personaId,
          tipo: tipoFilter || 'todos',
          total: recibos.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateRecibo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateReciboSchema.parse(req.body);
      const recibo = await this.reciboService.updateRecibo(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Recibo actualizado exitosamente',
        data: recibo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async changeEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = changeEstadoReciboSchema.parse(req.body);
      const recibo = await this.reciboService.changeEstado(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Estado del recibo cambiado a ${validatedData.nuevoEstado}`,
        data: recibo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteRecibo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const recibo = await this.reciboService.deleteRecibo(id);

      const response: ApiResponse = {
        success: true,
        message: 'Recibo eliminado exitosamente',
        data: recibo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createBulkRecibos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createBulkRecibosSchema.parse(req.body);
      const result = await this.reciboService.createBulkRecibos(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Creación masiva completada: ${result.count} recibos creados`,
        data: {
          created: result.count,
          errors: result.errors
        },
        meta: {
          totalAttempted: validatedData.recibos.length,
          successful: result.count,
          failed: result.errors.length
        }
      };

      // Return 207 Multi-Status if there were partial errors
      const statusCode = result.errors.length > 0 ? 207 : HttpStatus.CREATED;
      res.status(statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteBulkRecibos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = deleteBulkRecibosSchema.parse(req.body);
      const result = await this.reciboService.deleteBulkRecibos(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `${result.count} recibos eliminados`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateBulkEstados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = updateBulkEstadosSchema.parse(req.body);
      const result = await this.reciboService.updateBulkEstados(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `${result.count} recibos actualizados a estado ${validatedData.nuevoEstado}`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchRecibos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchData = reciboSearchSchema.parse(req.query);
      const recibos = await this.reciboService.searchRecibos(searchData);

      const response: ApiResponse = {
        success: true,
        data: recibos,
        meta: {
          searchTerm: searchData.search,
          searchBy: searchData.searchBy,
          total: recibos.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statsData = reciboStatsSchema.parse(req.query);
      const stats = await this.reciboService.getStatistics(statsData);

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

  async getVencidos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recibos = await this.reciboService.getVencidos();

      const response: ApiResponse = {
        success: true,
        data: recibos,
        meta: {
          total: recibos.length,
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
      const recibos = await this.reciboService.getPendientes();

      const response: ApiResponse = {
        success: true,
        data: recibos,
        meta: {
          total: recibos.length,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async processVencidos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.reciboService.processVencidos();

      const response: ApiResponse = {
        success: true,
        message: `Procesamiento de vencidos completado: ${result.count} recibos actualizados`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Dashboard endpoint - combines multiple useful queries
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [pendientes, vencidos, stats] = await Promise.all([
        this.reciboService.getPendientes(),
        this.reciboService.getVencidos(),
        this.reciboService.getStatistics({
          fechaDesde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          fechaHasta: new Date().toISOString(),
          agruparPor: 'tipo'
        })
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          pendientes: pendientes.slice(0, 10), // First 10 pending
          vencidos: vencidos.slice(0, 10), // First 10 overdue
          monthlyStats: stats
        },
        meta: {
          pendientesCount: pendientes.length,
          vencidosCount: vencidos.length,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Helper endpoints for specific business operations

  async getRecibosPorTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo } = req.params;
      const query = reciboQuerySchema.parse({ ...req.query, tipo });
      const result = await this.reciboService.getRecibos(query);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: {
          tipo,
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

  async getRecibosPorEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { estado } = req.params;
      const query = reciboQuerySchema.parse({ ...req.query, estado });
      const result = await this.reciboService.getRecibos(query);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: {
          estado,
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

  // Utility endpoint to get valid state transitions
  async getValidStateTransitions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transitions = {
        PENDIENTE: ['PAGADO', 'VENCIDO', 'CANCELADO'],
        VENCIDO: ['PAGADO', 'CANCELADO'],
        PAGADO: [],
        CANCELADO: []
      };

      const response: ApiResponse = {
        success: true,
        data: transitions
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Summary endpoint for financial reports
  async getFinancialSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fechaDesde, fechaHasta } = req.query;

      if (!fechaDesde || !fechaHasta) {
        const response: ApiResponse = {
          success: false,
          error: 'Parámetros fechaDesde y fechaHasta son requeridos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const [tipoStats, estadoStats] = await Promise.all([
        this.reciboService.getStatistics({
          fechaDesde: fechaDesde as string,
          fechaHasta: fechaHasta as string,
          agruparPor: 'tipo'
        }),
        this.reciboService.getStatistics({
          fechaDesde: fechaDesde as string,
          fechaHasta: fechaHasta as string,
          agruparPor: 'estado'
        })
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          porTipo: tipoStats,
          porEstado: estadoStats
        },
        meta: {
          period: `${fechaDesde} - ${fechaHasta}`
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}