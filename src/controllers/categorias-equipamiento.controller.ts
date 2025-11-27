import { Request, Response, NextFunction } from 'express';
import { CategoriasEquipamientoService } from '@/services/categorias-equipamiento.service';
import {
  createCategoriaEquipamientoSchema,
  updateCategoriaEquipamientoSchema,
  reorderCategoriaEquipamientoSchema
} from '@/dto/categorias-equipamiento.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class CategoriasEquipamientoController {
  constructor(private service: CategoriasEquipamientoService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createCategoriaEquipamientoSchema.parse(req.body);
      const categoria = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de equipamiento creada exitosamente',
        data: categoria
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

      const categorias = await this.service.findAll(options);

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

      const validatedData = updateCategoriaEquipamientoSchema.parse(req.body);
      const categoria = await this.service.update(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de equipamiento actualizada exitosamente',
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
        message: 'Categoría de equipamiento desactivada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reorderCategoriaEquipamientoSchema.parse(req.body);
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
