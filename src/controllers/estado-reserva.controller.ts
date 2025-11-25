// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { EstadoReservaService } from '@/services/estado-reserva.service';
import {
  createEstadoReservaSchema,
  updateEstadoReservaSchema,
  queryEstadosReservasSchema,
  reorderEstadosReservasSchema
} from '@/dto/estados-reserva.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

/**
 * Controller para gestión de estados de reservas
 * Endpoints para el catálogo de estados de reserva de aulas
 */
export class EstadoReservaController {
  constructor(private estadoReservaService: EstadoReservaService) {}

  /**
   * POST /api/catalogos/estados-reservas
   * Crear un nuevo estado de reserva
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createEstadoReservaSchema.parse(req.body);
      const result = await this.estadoReservaService.create(validatedData);

      logger.info(`Estado de reserva creado: ${validatedData.codigo} - ${validatedData.nombre}`);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/estados-reservas
   * Listar todos los estados de reserva
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = queryEstadosReservasSchema.parse(req.query);
      const result = await this.estadoReservaService.findAll(validatedQuery);

      logger.info(`Listando estados de reserva con filtros: ${JSON.stringify(validatedQuery)}`);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        message: result.message
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/estados-reservas/:id
   * Obtener un estado de reserva por ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.estadoReservaService.findById(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: result.data
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/estados-reservas/codigo/:codigo
   * Obtener un estado de reserva por código
   */
  async getByCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const result = await this.estadoReservaService.findByCodigo(codigo);

      const response: ApiResponse = {
        success: true,
        data: result.data
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/catalogos/estados-reservas/:id
   * Actualizar un estado de reserva
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateEstadoReservaSchema.parse(req.body);
      const result = await this.estadoReservaService.update(parseInt(id), validatedData);

      logger.info(`Estado de reserva ${id} actualizado`);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/catalogos/estados-reservas/:id
   * Desactivar un estado de reserva (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.estadoReservaService.delete(parseInt(id));

      logger.info(`Estado de reserva ${id} desactivado`);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/catalogos/estados-reservas/reorder
   * Reordenar estados de reserva
   */
  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reorderEstadosReservasSchema.parse(req.body);
      const result = await this.estadoReservaService.reorder(validatedData);

      logger.info(`Estados de reserva reordenados: ${validatedData.ids.length} elementos`);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/estados-reservas/estadisticas/uso
   * Obtener estadísticas de uso de estados
   */
  async getEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.estadoReservaService.getEstadisticasUso();

      const response: ApiResponse = {
        success: true,
        data: result.data,
        message: result.message
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
