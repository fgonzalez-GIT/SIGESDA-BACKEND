// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { ReservaAulaService } from '@/services/reserva-aula.service';
import {
  createReservaAulaSchema,
  updateReservaAulaSchema,
  reservaAulaQuerySchema,
  conflictDetectionSchema,
  createBulkReservasSchema,
  deleteBulkReservasSchema,
  createRecurringReservaSchema,
  reservaSearchSchema,
  reservaStatsSchema
} from '@/dto/reserva-aula.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

export class ReservaAulaController {
  constructor(private reservaAulaService: ReservaAulaService) {}

  async createReserva(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createReservaAulaSchema.parse(req.body);
      const reserva = await this.reservaAulaService.createReserva(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Reserva de aula creada exitosamente',
        data: reserva
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReservas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = reservaAulaQuerySchema.parse(req.query);
      const result = await this.reservaAulaService.getReservas(query);

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

  async getReservaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reserva = await this.reservaAulaService.getReservaById(id);

      if (!reserva) {
        const response: ApiResponse = {
          success: false,
          error: 'Reserva de aula no encontrada'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: reserva
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReservasByAula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { aulaId } = req.params;
      const { incluirPasadas } = req.query;
      const incluirPasadasFlag = incluirPasadas === 'true';

      const reservas = await this.reservaAulaService.getReservasByAula(aulaId, incluirPasadasFlag);

      const response: ApiResponse = {
        success: true,
        data: reservas,
        meta: {
          aulaId,
          incluirPasadas: incluirPasadasFlag,
          total: reservas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReservasByDocente(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { docenteId } = req.params;
      const { incluirPasadas } = req.query;
      const incluirPasadasFlag = incluirPasadas === 'true';

      const reservas = await this.reservaAulaService.getReservasByDocente(docenteId, incluirPasadasFlag);

      const response: ApiResponse = {
        success: true,
        data: reservas,
        meta: {
          docenteId,
          incluirPasadas: incluirPasadasFlag,
          total: reservas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReservasByActividad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { actividadId } = req.params;
      const { incluirPasadas } = req.query;
      const incluirPasadasFlag = incluirPasadas === 'true';

      const reservas = await this.reservaAulaService.getReservasByActividad(actividadId, incluirPasadasFlag);

      const response: ApiResponse = {
        success: true,
        data: reservas,
        meta: {
          actividadId,
          incluirPasadas: incluirPasadasFlag,
          total: reservas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateReserva(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateReservaAulaSchema.parse(req.body);
      const reserva = await this.reservaAulaService.updateReserva(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Reserva de aula actualizada exitosamente',
        data: reserva
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteReserva(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reserva = await this.reservaAulaService.deleteReserva(id);

      const response: ApiResponse = {
        success: true,
        message: 'Reserva de aula eliminada exitosamente',
        data: reserva
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async detectConflicts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = conflictDetectionSchema.parse(req.body);
      const conflicts = await this.reservaAulaService.detectConflicts(validatedData);

      const response: ApiResponse = {
        success: true,
        data: {
          hasConflicts: conflicts.length > 0,
          conflicts,
          conflictCount: conflicts.length
        },
        meta: {
          aulaId: validatedData.aulaId,
          period: `${validatedData.fechaInicio} - ${validatedData.fechaFin}`
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createBulkReservas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createBulkReservasSchema.parse(req.body);
      const result = await this.reservaAulaService.createBulkReservas(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Creación masiva completada: ${result.count} reservas creadas`,
        data: {
          created: result.count,
          errors: result.errors
        },
        meta: {
          totalAttempted: validatedData.reservas.length,
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

  async deleteBulkReservas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = deleteBulkReservasSchema.parse(req.body);
      const result = await this.reservaAulaService.deleteBulkReservas(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `${result.count} reservas eliminadas`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createRecurringReserva(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createRecurringReservaSchema.parse(req.body);
      const result = await this.reservaAulaService.createRecurringReserva(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Reservas recurrentes creadas: ${result.count} reservas`,
        data: {
          created: result.count,
          errors: result.errors
        },
        meta: {
          recurrenceType: validatedData.recurrencia.tipo,
          interval: validatedData.recurrencia.intervalo,
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

  async searchReservas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchData = reservaSearchSchema.parse(req.query);
      const reservas = await this.reservaAulaService.searchReservas(searchData);

      const response: ApiResponse = {
        success: true,
        data: reservas,
        meta: {
          searchTerm: searchData.search,
          searchBy: searchData.searchBy,
          total: reservas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statsData = reservaStatsSchema.parse(req.query);
      const stats = await this.reservaAulaService.getStatistics(statsData);

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

  async getUpcomingReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit } = req.query;
      const limitNumber = limit ? parseInt(limit as string) : 10;

      const reservas = await this.reservaAulaService.getUpcomingReservations(limitNumber);

      const response: ApiResponse = {
        success: true,
        data: reservas,
        meta: {
          limit: limitNumber,
          total: reservas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservas = await this.reservaAulaService.getCurrentReservations();

      const response: ApiResponse = {
        success: true,
        data: reservas,
        meta: {
          timestamp: new Date().toISOString(),
          total: reservas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Dashboard endpoint - combines multiple useful queries
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [upcoming, current, stats] = await Promise.all([
        this.reservaAulaService.getUpcomingReservations(5),
        this.reservaAulaService.getCurrentReservations(),
        this.reservaAulaService.getStatistics({
          fechaDesde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last week
          fechaHasta: new Date().toISOString(),
          agruparPor: 'aula'
        })
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          upcoming,
          current,
          weeklyStats: stats
        },
        meta: {
          upcomingCount: upcoming.length,
          currentCount: current.length,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Helper endpoint to check availability for a specific period
  async checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { aulaId, fechaInicio, fechaFin } = req.query;

      if (!aulaId || !fechaInicio || !fechaFin) {
        const response: ApiResponse = {
          success: false,
          error: 'Parámetros aulaId, fechaInicio y fechaFin son requeridos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const conflicts = await this.reservaAulaService.detectConflicts({
        aulaId: aulaId as string,
        fechaInicio: fechaInicio as string,
        fechaFin: fechaFin as string
      });

      const isAvailable = conflicts.length === 0;

      const response: ApiResponse = {
        success: true,
        data: {
          available: isAvailable,
          conflicts: isAvailable ? [] : conflicts
        },
        meta: {
          aulaId,
          period: `${fechaInicio} - ${fechaFin}`,
          conflictCount: conflicts.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}