import { Request, Response, NextFunction } from 'express';
import { EquipamientoService } from '@/services/equipamiento.service';
import {
  createEquipamientoSchema,
  updateEquipamientoSchema,
  equipamientoQuerySchema
} from '@/dto/equipamiento.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class EquipamientoController {
  constructor(private equipamientoService: EquipamientoService) {}

  async createEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createEquipamientoSchema.parse(req.body);
      const equipamiento = await this.equipamientoService.createEquipamiento(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Equipamiento creado exitosamente',
        data: equipamiento
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getEquipamientos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = equipamientoQuerySchema.parse(req.query);
      const result = await this.equipamientoService.getEquipamientos(query);

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

  async getEquipamientoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const equipamiento = await this.equipamientoService.getEquipamientoById(parseInt(id));

      if (!equipamiento) {
        const response: ApiResponse = {
          success: false,
          error: 'Equipamiento no encontrado'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: equipamiento
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateEquipamientoSchema.parse(req.body);
      const equipamiento = await this.equipamientoService.updateEquipamiento(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Equipamiento actualizado exitosamente',
        data: equipamiento
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { hard } = req.query;
      const equipamiento = await this.equipamientoService.deleteEquipamiento(
        parseInt(id),
        hard === 'true'
      );

      const response: ApiResponse = {
        success: true,
        message: hard === 'true'
          ? 'Equipamiento eliminado permanentemente'
          : 'Equipamiento desactivado exitosamente',
        data: equipamiento
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async reactivateEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const equipamiento = await this.equipamientoService.reactivateEquipamiento(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Equipamiento reactivado exitosamente',
        data: equipamiento
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getEquipamientoStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await this.equipamientoService.getEquipamientoStats(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const disponibilidad = await this.equipamientoService.getDisponibilidadEquipamiento(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: disponibilidad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
