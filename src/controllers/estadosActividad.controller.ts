import { Request, Response, NextFunction } from 'express';
import { EstadosActividadService } from '@/services/estadosActividad.service';
import {
  createEstadoActividadSchema,
  updateEstadoActividadSchema,
  queryTiposCatalogoSchema,
  reorderCatalogoSchema
} from '@/dto/catalogos-actividades.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class EstadosActividadController {
  constructor(private service: EstadosActividadService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createEstadoActividadSchema.parse(req.body);
      const estado = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Estado de actividad creado exitosamente',
        data: estado
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = queryTiposCatalogoSchema.parse(req.query);
      const estados = await this.service.findAll(query);

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

      const validatedData = updateEstadoActividadSchema.parse(req.body);
      const estado = await this.service.update(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Estado de actividad actualizado exitosamente',
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
        message: 'Estado de actividad desactivado exitosamente',
        data: estado
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reorderCatalogoSchema.parse(req.body);
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
