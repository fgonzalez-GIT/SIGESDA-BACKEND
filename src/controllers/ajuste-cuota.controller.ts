import { Request, Response, NextFunction } from 'express';
import { AjusteCuotaService } from '@/services/ajuste-cuota.service';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
import {
  createAjusteCuotaSchema,
  updateAjusteCuotaSchema,
  queryAjusteCuotaSchema,
  queryHistorialAjusteCuotaSchema
} from '@/dto/ajuste-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller for managing manual adjustments to cuotas
 * FASE 4: Task 4.1 - Ajustes manuales por socio
 */
export class AjusteCuotaController {
  constructor(
    private service: AjusteCuotaService,
    private historialRepository: HistorialAjusteCuotaRepository
  ) {}

  /**
   * POST /api/ajustes-cuota
   * Create a new manual adjustment
   */
  async createAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createAjusteCuotaSchema.parse(req.body);
      const usuario = req.body.usuario || 'sistema'; // TODO: Get from auth when implemented

      const ajuste = await this.service.createAjuste(validatedData, usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual creado exitosamente',
        data: ajuste,
        meta: {
          ajusteId: ajuste.id,
          personaId: ajuste.personaId,
          tipoAjuste: ajuste.tipoAjuste
        }
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ajustes-cuota/:id
   * Get adjustment by ID
   */
  async getAjusteById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ajuste = await this.service.getAjusteById(parseInt(id));

      if (!ajuste) {
        const response: ApiResponse = {
          success: false,
          error: `Ajuste con ID ${id} no encontrado`
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: ajuste
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ajustes-cuota
   * Get all adjustments with optional filters
   */
  async getAjustes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = queryAjusteCuotaSchema.parse(req.query);
      const ajustes = await this.service.getAjustes(filters);

      const response: ApiResponse = {
        success: true,
        data: ajustes,
        meta: {
          total: ajustes.length,
          filters: filters
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ajustes-cuota/persona/:personaId
   * Get all adjustments for a specific persona
   */
  async getAjustesByPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const { soloActivos } = req.query;

      const ajustes = await this.service.getAjustesByPersonaId(
        parseInt(personaId),
        soloActivos === 'true'
      );

      const response: ApiResponse = {
        success: true,
        data: ajustes,
        meta: {
          personaId: parseInt(personaId),
          total: ajustes.length,
          soloActivos: soloActivos === 'true'
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/ajustes-cuota/:id
   * Update an existing adjustment
   */
  async updateAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateAjusteCuotaSchema.parse(req.body);
      const usuario = req.body.usuario || 'sistema';

      const ajuste = await this.service.updateAjuste(parseInt(id), validatedData, usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual actualizado exitosamente',
        data: ajuste
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ajustes-cuota/:id/deactivate
   * Deactivate an adjustment (soft delete)
   */
  async deactivateAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { usuario, motivo } = req.body;

      const ajuste = await this.service.deactivateAjuste(parseInt(id), usuario, motivo);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual desactivado exitosamente',
        data: ajuste
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ajustes-cuota/:id/activate
   * Reactivate an adjustment
   */
  async activateAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { usuario, motivo } = req.body;

      const ajuste = await this.service.activateAjuste(parseInt(id), usuario, motivo);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual reactivado exitosamente',
        data: ajuste
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/ajustes-cuota/:id
   * Permanently delete an adjustment (use with caution)
   */
  async deleteAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { usuario, motivo } = req.body;

      await this.service.deleteAjuste(parseInt(id), usuario, motivo);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual eliminado permanentemente'
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ajustes-cuota/stats
   * Get adjustment statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.query;

      const stats = await this.service.getStats(
        personaId ? parseInt(personaId as string) : undefined
      );

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ajustes-cuota/calcular
   * Calculate adjustment preview without applying it
   */
  async calcularAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ajusteId, montoOriginal } = req.body;

      if (!ajusteId || !montoOriginal) {
        const response: ApiResponse = {
          success: false,
          error: 'ajusteId y montoOriginal son requeridos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const ajuste = await this.service.getAjusteById(ajusteId);
      if (!ajuste) {
        const response: ApiResponse = {
          success: false,
          error: `Ajuste con ID ${ajusteId} no encontrado`
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const resultado = this.service.calcularAjuste(ajuste, montoOriginal);

      const response: ApiResponse = {
        success: true,
        data: resultado,
        meta: {
          ajusteId,
          montoOriginal
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ajustes-cuota/:id/historial
   * Get history for a specific adjustment
   */
  async getHistorial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const historial = await this.historialRepository.findByAjusteId(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: historial,
        meta: {
          ajusteId: parseInt(id),
          total: historial.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/historial-cuota
   * Get all history entries with filters
   */
  async getAllHistorial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = queryHistorialAjusteCuotaSchema.parse(req.query);

      const result = await this.historialRepository.findAll(filters);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          limit: filters.limit,
          offset: filters.offset,
          filters: filters
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/historial-cuota/stats
   * Get history statistics
   */
  async getHistorialStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId, fechaDesde, fechaHasta } = req.query;

      const stats = await this.historialRepository.getStats({
        personaId: personaId ? parseInt(personaId as string) : undefined,
        fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined
      });

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
