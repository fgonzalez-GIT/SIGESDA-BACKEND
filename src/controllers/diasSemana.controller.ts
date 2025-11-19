import { Request, Response, NextFunction } from 'express';
import { DiasSemanaService } from '@/services/diasSemana.service';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class DiasSemanaController {
  constructor(private service: DiasSemanaService) {}

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dias = await this.service.findAll();

      const response: ApiResponse = {
        success: true,
        data: dias,
        meta: {
          total: dias.length
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

      const dia = await this.service.findById(id);

      const response: ApiResponse = {
        success: true,
        data: dia
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
