// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { MedioPagoService } from '@/services/medio-pago.service';
import {
  CreateMedioPagoSchema,
  UpdateMedioPagoSchema,
  MedioPagoFilterSchema,
  MedioPagoSearchSchema,
  MedioPagoStatsSchema,
  DeleteBulkMediosPagoSchema,
  ValidarPagoCompletoSchema,
  ConciliacionBancariaSchema
} from '@/dto/medio-pago.dto';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';

export class MedioPagoController {
  constructor(private medioPagoService: MedioPagoService) {}

  // Crear medio de pago
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = CreateMedioPagoSchema.parse(req.body);
      const medioPago = await this.medioPagoService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Medio de pago creado exitosamente',
        data: medioPago
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors
        });
        return;
      }

      logger.error('Error creando medio de pago:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error creando medio de pago'
      });
    }
  }

  // Obtener todos los medios de pago con filtros
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = MedioPagoFilterSchema.parse(req.query);
      const result = await this.medioPagoService.findAll(filters);

      res.json({
        success: true,
        data: result.mediosPago,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.errors
        });
        return;
      }

      next(error);
    }
  }

  // Obtener medio de pago por ID
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const medioPago = await this.medioPagoService.findById(id);

      if (!medioPago) {
        res.status(404).json({
          success: false,
          message: 'Medio de pago no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: medioPago
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener medios de pago por recibo
  async getByReciboId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reciboId } = req.params;
      const mediosPago = await this.medioPagoService.findByReciboId(reciboId);

      res.json({
        success: true,
        data: mediosPago,
        count: mediosPago.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar medio de pago
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = UpdateMedioPagoSchema.parse(req.body);

      const medioPago = await this.medioPagoService.update(id, validatedData);

      res.json({
        success: true,
        message: 'Medio de pago actualizado exitosamente',
        data: medioPago
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors
        });
        return;
      }

      logger.error('Error actualizando medio de pago:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error actualizando medio de pago'
      });
    }
  }

  // Eliminar medio de pago
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.medioPagoService.delete(id);

      res.json({
        success: true,
        message: 'Medio de pago eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando medio de pago:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error eliminando medio de pago'
      });
    }
  }

  // Buscar medios de pago
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchData = MedioPagoSearchSchema.parse(req.query);
      const mediosPago = await this.medioPagoService.search(searchData);

      res.json({
        success: true,
        data: mediosPago,
        count: mediosPago.length
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de búsqueda inválidos',
          errors: error.errors
        });
        return;
      }

      next(error);
    }
  }

  // Obtener estadísticas
  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statsData = MedioPagoStatsSchema.parse(req.query);
      const statistics = await this.medioPagoService.getStatistics(statsData);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de estadísticas inválidos',
          errors: error.errors
        });
        return;
      }

      next(error);
    }
  }

  // Eliminar múltiples medios de pago
  async deleteBulk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = DeleteBulkMediosPagoSchema.parse(req.body);
      const result = await this.medioPagoService.deleteBulk(validatedData);

      const statusCode = result.errores.length > 0 ? 207 : 200; // 207 Multi-Status si hay errores

      res.status(statusCode).json({
        success: true,
        message: `Se eliminaron ${result.eliminados} medios de pago${result.errores.length > 0 ? ` con ${result.errores.length} errores` : ''}`,
        data: result
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors
        });
        return;
      }

      logger.error('Error en eliminación masiva:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error en eliminación masiva'
      });
    }
  }

  // Validar pago completo
  async validatePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = ValidarPagoCompletoSchema.parse(req.body);
      const validation = await this.medioPagoService.validatePayment(validatedData);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors
        });
        return;
      }

      next(error);
    }
  }

  // Conciliación bancaria
  async getConciliacionBancaria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = ConciliacionBancariaSchema.parse(req.query);
      const conciliacion = await this.medioPagoService.getConciliacionBancaria(validatedData);

      res.json({
        success: true,
        data: conciliacion
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de conciliación inválidos',
          errors: error.errors
        });
        return;
      }

      next(error);
    }
  }

  // Obtener medios de pago por tipo
  async getByTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      // Validar que el tipo sea válido
      const tiposValidos = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE'];
      if (!tiposValidos.includes(tipo.toUpperCase())) {
        res.status(400).json({
          success: false,
          message: 'Tipo de medio de pago inválido'
        });
        return;
      }

      const mediosPago = await this.medioPagoService.findByTipo(tipo.toUpperCase() as any, limit);

      res.json({
        success: true,
        data: mediosPago,
        count: mediosPago.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Dashboard de medios de pago
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard = await this.medioPagoService.getDashboard();

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      next(error);
    }
  }

  // Estadísticas rápidas
  async getQuickStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.medioPagoService.getQuickStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Validar pago de recibo específico (parámetro en URL)
  async validateReciboPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reciboId } = req.params;
      const tolerancia = req.query.tolerancia ? parseFloat(req.query.tolerancia as string) : 0.01;

      const validation = await this.medioPagoService.validatePayment({
        reciboId,
        tolerancia
      });

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener medios de pago efectivo
  async getEfectivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const mediosPago = await this.medioPagoService.findByTipo('EFECTIVO', limit);

      res.json({
        success: true,
        data: mediosPago,
        count: mediosPago.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener cheques
  async getCheques(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const mediosPago = await this.medioPagoService.findByTipo('CHEQUE', limit);

      res.json({
        success: true,
        data: mediosPago,
        count: mediosPago.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener transferencias
  async getTransferencias(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const mediosPago = await this.medioPagoService.findByTipo('TRANSFERENCIA', limit);

      res.json({
        success: true,
        data: mediosPago,
        count: mediosPago.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener tarjetas (débito y crédito)
  async getTarjetas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const [tarjetasDebito, tarjetasCredito] = await Promise.all([
        this.medioPagoService.findByTipo('TARJETA_DEBITO', limit),
        this.medioPagoService.findByTipo('TARJETA_CREDITO', limit)
      ]);

      const allTarjetas = [...tarjetasDebito, ...tarjetasCredito]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, limit);

      res.json({
        success: true,
        data: allTarjetas,
        count: allTarjetas.length,
        breakdown: {
          debito: tarjetasDebito.length,
          credito: tarjetasCredito.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Resumen por período
  async getResumenPeriodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fechaDesde, fechaHasta } = req.query;

      if (!fechaDesde || !fechaHasta) {
        res.status(400).json({
          success: false,
          message: 'Se requieren las fechas desde y hasta'
        });
        return;
      }

      const statsData = MedioPagoStatsSchema.parse({
        fechaDesde: fechaDesde as string,
        fechaHasta: fechaHasta as string,
        agruparPor: 'tipo'
      });

      const statistics = await this.medioPagoService.getStatistics(statsData);

      res.json({
        success: true,
        data: statistics,
        periodo: {
          desde: fechaDesde,
          hasta: fechaHasta
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de período inválidos',
          errors: error.errors
        });
        return;
      }

      next(error);
    }
  }
}