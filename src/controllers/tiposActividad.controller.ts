import { Request, Response, NextFunction } from 'express';
import { TiposActividadService } from '@/services/tiposActividad.service';
import {
  createTipoActividadSchema,
  updateTipoActividadSchema,
  queryTiposCatalogoSchema,
  reorderCatalogoSchema
} from '@/dto/catalogos-actividades.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class TiposActividadController {
  constructor(private service: TiposActividadService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createTipoActividadSchema.parse(req.body);
      const tipo = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de actividad creado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = queryTiposCatalogoSchema.parse(req.query);
      const tipos = await this.service.findAll(query);

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          total: tipos.length
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

      const tipo = await this.service.findById(id);

      const response: ApiResponse = {
        success: true,
        data: tipo
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

      const validatedData = updateTipoActividadSchema.parse(req.body);
      const tipo = await this.service.update(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de actividad actualizado exitosamente',
        data: tipo
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

      const tipo = await this.service.delete(id);

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de actividad desactivado exitosamente',
        data: tipo
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
