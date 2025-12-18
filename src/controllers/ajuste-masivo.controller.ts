import { Request, Response, NextFunction } from 'express';
import { AjusteMasivoService } from '@/services/ajuste-masivo.service';
import {
  AjusteMasivoDto,
  ModificarItemsMasivoDto,
  DescuentoGlobalDto,
  ajusteMasivoSchema,
  modificarItemsMasivoSchema,
  descuentoGlobalSchema
} from '@/dto/cuota.dto';
import { logger } from '@/utils/logger';

/**
 * AjusteMasivoController
 *
 * Controlador para endpoints de ajuste masivo de cuotas
 * FASE 5 - Task 5.2: Herramienta de ajuste masivo
 *
 * Endpoints:
 * - POST /api/ajustes/masivo - Ajuste masivo con filtros
 * - POST /api/ajustes/modificar-items - Modificar ítems en batch
 * - POST /api/ajustes/descuento-global - Descuento global a período
 */
export class AjusteMasivoController {
  private ajusteMasivoService: AjusteMasivoService;

  constructor(ajusteMasivoService?: AjusteMasivoService) {
    this.ajusteMasivoService = ajusteMasivoService || new AjusteMasivoService();
  }

  /**
   * POST /api/ajustes/masivo
   * Aplica ajuste masivo a múltiples cuotas según filtros
   */
  aplicarAjusteMasivo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: AjusteMasivoDto = ajusteMasivoSchema.parse(req.body);

      logger.info(
        `[AJUSTE MASIVO API] Solicitud de ajuste masivo en modo ${data.modo}`
      );

      const resultado = await this.ajusteMasivoService.aplicarAjusteMasivo(data);

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
          ? `Ajuste masivo aplicado: ${resultado.cuotasAfectadas} cuotas, impacto: ${resultado.impactoEconomico >= 0 ? '+' : ''}$${resultado.impactoEconomico.toFixed(2)}`
          : `Preview generado: ${resultado.cuotasAfectadas} cuotas afectadas, impacto: ${resultado.impactoEconomico >= 0 ? '+' : ''}$${resultado.impactoEconomico.toFixed(2)}`
      });
    } catch (error) {
      logger.error(`[AJUSTE MASIVO API] Error: ${error}`);
      next(error);
    }
  };

  /**
   * POST /api/ajustes/modificar-items
   * Modifica múltiples ítems de cuotas en batch
   */
  modificarItemsMasivo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: ModificarItemsMasivoDto = modificarItemsMasivoSchema.parse(req.body);

      logger.info(
        `[MODIFICAR ITEMS API] Solicitud de modificación masiva en modo ${data.modo}`
      );

      const resultado = await this.ajusteMasivoService.modificarItemsMasivo(data);

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
          ? `Modificación aplicada: ${resultado.itemsAfectados} ítems en ${resultado.cuotasAfectadas} cuotas`
          : `Preview generado: ${resultado.itemsAfectados} ítems afectados en ${resultado.cuotasAfectadas} cuotas`
      });
    } catch (error) {
      logger.error(`[MODIFICAR ITEMS API] Error: ${error}`);
      next(error);
    }
  };

  /**
   * POST /api/ajustes/descuento-global
   * Aplica descuento global a todas las cuotas de un período
   */
  aplicarDescuentoGlobal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: DescuentoGlobalDto = descuentoGlobalSchema.parse(req.body);

      logger.info(
        `[DESCUENTO GLOBAL API] Solicitud de descuento global ${data.tipoDescuento} ${data.valor} para ${data.mes}/${data.anio}`
      );

      const resultado = await this.ajusteMasivoService.aplicarDescuentoGlobal(data);

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
          ? `Descuento global aplicado: ${resultado.cuotasAfectadas} cuotas, descuento total: $${resultado.descuentoTotal.toFixed(2)}`
          : `Preview generado: ${resultado.cuotasAfectadas} cuotas afectadas, descuento total: $${resultado.descuentoTotal.toFixed(2)}`
      });
    } catch (error) {
      logger.error(`[DESCUENTO GLOBAL API] Error: ${error}`);
      next(error);
    }
  };

  /**
   * GET /api/ajustes/masivo/health
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
        message: 'Servicio de ajuste masivo operativo',
        version: '1.0.0',
        endpoints: [
          'POST /api/ajustes/masivo',
          'POST /api/ajustes/modificar-items',
          'POST /api/ajustes/descuento-global'
        ]
      });
    } catch (error) {
      next(error);
    }
  };
}
