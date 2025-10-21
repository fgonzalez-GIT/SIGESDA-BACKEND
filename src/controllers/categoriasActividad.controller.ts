import { Request, Response, NextFunction } from 'express';
import { CategoriasActividadService } from '@/services/categoriasActividad.service';
import {
  createCategoriaActividadSchema,
  updateCategoriaActividadSchema,
  queryTiposCatalogoSchema,
  reorderCatalogoSchema
} from '@/dto/catalogos-actividades.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class CategoriasActividadController {
  constructor(private service: CategoriasActividadService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createCategoriaActividadSchema.parse(req.body);
      const categoria = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de actividad creada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = queryTiposCatalogoSchema.parse(req.query);
      const categorias = await this.service.findAll(query);

      const response: ApiResponse = {
        success: true,
        data: categorias,
        meta: {
          total: categorias.length
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

      const categoria = await this.service.findById(id);

      const response: ApiResponse = {
        success: true,
        data: categoria
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

      const validatedData = updateCategoriaActividadSchema.parse(req.body);
      const categoria = await this.service.update(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de actividad actualizada exitosamente',
        data: categoria
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

      const categoria = await this.service.delete(id);

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de actividad desactivada exitosamente',
        data: categoria
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
