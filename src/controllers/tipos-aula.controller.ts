import { Request, Response, NextFunction } from 'express';
import { TiposAulaService } from '@/services/tipos-aula.service';
import {
  createTipoAulaSchema,
  updateTipoAulaSchema,
  reorderTipoAulaSchema
} from '@/dto/tipos-aula.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class TiposAulaController {
  constructor(private service: TiposAulaService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createTipoAulaSchema.parse(req.body);
      const tipo = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de aula creado exitosamente',
        data: tipo
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

      const tipos = await this.service.findAll(options);

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

      const validatedData = updateTipoAulaSchema.parse(req.body);
      const tipo = await this.service.update(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de aula actualizado exitosamente',
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
        message: 'Tipo de aula desactivado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reorderTipoAulaSchema.parse(req.body);
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
