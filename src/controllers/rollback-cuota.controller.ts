import { Request, Response, NextFunction } from 'express';
import { RollbackCuotaService } from '@/services/rollback-cuota.service';
import {
  RollbackGeneracionDto,
  RollbackCuotaDto,
  ValidarRollbackDto,
  rollbackGeneracionSchema,
  rollbackCuotaSchema,
  validarRollbackSchema
} from '@/dto/cuota.dto';
import { logger } from '@/utils/logger';

/**
 * RollbackCuotaController
 *
 * Controlador para endpoints de rollback de cuotas
 * FASE 5 - Task 5.3: Rollback de generación
 *
 * Endpoints:
 * - POST /api/rollback/cuotas/generacion - Rollback de generación masiva
 * - POST /api/rollback/cuotas/:id - Rollback de cuota individual
 * - POST /api/rollback/cuotas/validar - Validar si se puede hacer rollback
 */
export class RollbackCuotaController {
  private rollbackService: RollbackCuotaService;

  constructor(rollbackService?: RollbackCuotaService) {
    this.rollbackService = rollbackService || new RollbackCuotaService();
  }

  /**
   * POST /api/rollback/cuotas/generacion
   * Hace rollback de generación masiva de un período
   */
  rollbackGeneracion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: RollbackGeneracionDto = rollbackGeneracionSchema.parse(req.body);

      logger.info(
        `[ROLLBACK API] Solicitud de rollback generación ${data.mes}/${data.anio} en modo ${data.modo}`
      );

      const resultado = await this.rollbackService.rollbackGeneracion(data);

      // Si hay errores, retornar 400
      if (resultado.errores.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validación fallida',
          data: resultado
        });
        return;
      }

      const statusCode = data.modo === 'APLICAR' ? 200 : 200;

      res.status(statusCode).json({
        success: true,
        data: resultado,
        message: data.modo === 'APLICAR'
          ? `Rollback aplicado: ${resultado.cuotasEliminables} cuotas eliminadas, ${resultado.cuotasBloqueadas} bloqueadas`
          : `Preview generado: ${resultado.cuotasEliminables} cuotas serían eliminadas, ${resultado.cuotasBloqueadas} bloqueadas`
      });
    } catch (error) {
      logger.error(`[ROLLBACK API] Error: ${error}`);
      next(error);
    }
  };

  /**
   * POST /api/rollback/cuotas/:id
   * Hace rollback de una cuota individual
   */
  rollbackCuota = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cuotaId = parseInt(req.params.id);
      const bodyData = req.body || {};

      const data: RollbackCuotaDto = rollbackCuotaSchema.parse({
        cuotaId,
        ...bodyData
      });

      logger.info(
        `[ROLLBACK API] Solicitud de rollback cuota ${cuotaId} en modo ${data.modo}`
      );

      const resultado = await this.rollbackService.rollbackCuota(data);

      if (resultado.errores.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validación fallida',
          data: resultado
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: resultado,
        message: data.modo === 'APLICAR'
          ? `Cuota ${cuotaId} eliminada exitosamente`
          : `Preview: Cuota ${cuotaId} puede ser eliminada`
      });
    } catch (error) {
      logger.error(`[ROLLBACK API] Error: ${error}`);
      next(error);
    }
  };

  /**
   * POST /api/rollback/cuotas/validar
   * Valida si se puede hacer rollback de un período
   */
  validarRollback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: ValidarRollbackDto = validarRollbackSchema.parse(req.body);

      logger.info(
        `[ROLLBACK API] Validación de rollback para ${data.mes}/${data.anio}`
      );

      const resultado = await this.rollbackService.validarRollback(data);

      res.status(200).json({
        success: true,
        data: resultado,
        message: resultado.puedeHacerRollback
          ? `Rollback posible: ${resultado.cuotasEliminables} cuotas pueden ser eliminadas`
          : `Rollback bloqueado: ${resultado.errores.length} errores encontrados`
      });
    } catch (error) {
      logger.error(`[ROLLBACK API] Error en validación: ${error}`);
      next(error);
    }
  };

  /**
   * GET /api/rollback/cuotas/health
   * Health check
   */
  healthCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'Servicio de rollback operativo',
        version: '1.0.0',
        endpoints: [
          'POST /api/rollback/cuotas/generacion',
          'POST /api/rollback/cuotas/:id',
          'POST /api/rollback/cuotas/validar'
        ],
        warning: 'El rollback es una operación IRREVERSIBLE. Siempre use modo PREVIEW primero.'
      });
    } catch (error) {
      next(error);
    }
  };
}
