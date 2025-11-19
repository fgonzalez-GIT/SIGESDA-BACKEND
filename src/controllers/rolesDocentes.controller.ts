import { Request, Response, NextFunction } from 'express';
import { RolesDocentesService } from '@/services/rolesDocentes.service';
import {
  createRolDocenteSchema,
  updateRolDocenteSchema,
  queryTiposCatalogoSchema,
  reorderCatalogoSchema
} from '@/dto/catalogos-actividades.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class RolesDocentesController {
  constructor(private service: RolesDocentesService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createRolDocenteSchema.parse(req.body);
      const rol = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Rol de docente creado exitosamente',
        data: rol
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = queryTiposCatalogoSchema.parse(req.query);
      const roles = await this.service.findAll(query);

      const response: ApiResponse = {
        success: true,
        data: roles,
        meta: {
          total: roles.length
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

      const rol = await this.service.findById(id);

      const response: ApiResponse = {
        success: true,
        data: rol
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

      const validatedData = updateRolDocenteSchema.parse(req.body);
      const rol = await this.service.update(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Rol de docente actualizado exitosamente',
        data: rol
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

      const rol = await this.service.delete(id);

      const response: ApiResponse = {
        success: true,
        message: 'Rol de docente desactivado exitosamente',
        data: rol
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
