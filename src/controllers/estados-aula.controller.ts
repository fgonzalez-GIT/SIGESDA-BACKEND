import { Request, Response, NextFunction } from 'express';
import { EstadosAulaService } from '@/services/estados-aula.service';
import {
  createEstadoAulaSchema,
  updateEstadoAulaSchema,
  reorderEstadoAulaSchema
} from '@/dto/estados-aula.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class EstadosAulaController {
  constructor(private service: EstadosAulaService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createEstadoAulaSchema.parse(req.body);
      const estado = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Estado de aula creado exitosamente',
        data: estado
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = {
        includeInactive: req.query.includeInactive === 'true',
        search: req.query.search as string,
        orderBy: (req.query.orderBy as string) || 'orden',
        orderDir: (req.query.orderDir as 'asc' | 'desc') || 'asc'
      };

      const estados = await this.service.findAll(options);

      const response: ApiResponse = {
        success: true,
        data: estados,
        meta: {
          total: estados.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const estado = await this.service.findById(id);

      const response: ApiResponse = {
        success: true,
        data: estado
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const validatedData = updateEstadoAulaSchema.parse(req.body);
      const estado = await this.service.update(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Estado de aula actualizado exitosamente',
        data: estado
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const estado = await this.service.delete(id);

      const response: ApiResponse = {
        success: true,
        message: 'Estado de aula desactivado exitosamente',
        data: estado
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reorderEstadoAulaSchema.parse(req.body);
      const result = await this.service.reorder(validatedData);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: { count: result.count }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
