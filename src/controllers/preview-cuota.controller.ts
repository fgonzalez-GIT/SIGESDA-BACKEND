import { Request, Response, NextFunction } from 'express';
import { PreviewCuotaService } from '@/services/preview-cuota.service';
import {
  PreviewCuotaDto,
  PreviewCuotasSocioDto,
  CompararCuotaDto,
  previewCuotaSchema,
  previewCuotasSocioSchema,
  compararCuotaSchema
} from '@/dto/cuota.dto';
import { logger } from '@/utils/logger';

/**
 * PreviewCuotaController
 *
 * Controlador para endpoints de preview de cuotas
 * FASE 5 - Task 5.4: Preview en UI
 *
 * Endpoints:
 * - POST /api/preview/cuotas - Preview de cuota individual
 * - POST /api/preview/cuotas/socio - Preview de múltiples cuotas de un socio
 * - POST /api/preview/cuotas/comparar - Comparar cuota antes/después
 * - GET /api/preview/cuotas/health - Health check
 */
export class PreviewCuotaController {
  private previewService: PreviewCuotaService;

  constructor(previewService?: PreviewCuotaService) {
    this.previewService = previewService || new PreviewCuotaService();
  }

  /**
   * POST /api/preview/cuotas
   * Genera preview detallado de una cuota (existente o simulada)
   */
  previewCuota = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: PreviewCuotaDto = previewCuotaSchema.parse(req.body);

      logger.info('[PREVIEW API] Solicitud de preview de cuota', { data });

      const resultado = await this.previewService.previewCuota(data);

      res.status(200).json({
        success: true,
        data: resultado,
        message: data.cuotaId
          ? `Preview de cuota ${data.cuotaId} generado`
          : `Preview simulado generado para socio ${data.socioId}`
      });
    } catch (error) {
      logger.error('[PREVIEW API] Error en preview de cuota', { error });
      next(error);
    }
  };

  /**
   * POST /api/preview/cuotas/socio
   * Genera preview de múltiples cuotas de un socio
   */
  previewCuotasSocio = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: PreviewCuotasSocioDto = previewCuotasSocioSchema.parse(req.body);

      logger.info('[PREVIEW API] Solicitud de preview de socio', { data });

      const resultado = await this.previewService.previewCuotasSocio(data);

      res.status(200).json({
        success: true,
        data: resultado,
        message: `Preview generado: ${resultado.cuotas.length} cuotas encontradas`
      });
    } catch (error) {
      logger.error('[PREVIEW API] Error en preview de socio', { error });
      next(error);
    }
  };

  /**
   * POST /api/preview/cuotas/comparar
   * Compara cuota antes/después de aplicar cambios
   */
  compararCuota = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CompararCuotaDto = compararCuotaSchema.parse(req.body);

      logger.info('[PREVIEW API] Solicitud de comparación de cuota', { data });

      const resultado = await this.previewService.compararCuota(data);

      const diferenciaText = resultado.diferencias.montoTotal === 0
        ? 'sin cambios'
        : resultado.diferencias.montoTotal > 0
        ? `aumento de $${resultado.diferencias.montoTotal.toFixed(2)}`
        : `reducción de $${Math.abs(resultado.diferencias.montoTotal).toFixed(2)}`;

      res.status(200).json({
        success: true,
        data: resultado,
        message: `Comparación generada: ${diferenciaText}`
      });
    } catch (error) {
      logger.error('[PREVIEW API] Error en comparación', { error });
      next(error);
    }
  };

  /**
   * GET /api/preview/cuotas/health
   * Health check del servicio de preview
   */
  healthCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'Servicio de preview operativo',
        version: '1.0.0',
        endpoints: [
          'POST /api/preview/cuotas',
          'POST /api/preview/cuotas/socio',
          'POST /api/preview/cuotas/comparar',
          'GET /api/preview/cuotas/health'
        ],
        features: {
          formatosDisponibles: ['COMPLETO', 'RESUMIDO', 'SIMPLE'],
          tiposPreview: [
            'Cuota existente (por ID)',
            'Cuota simulada (por datos)',
            'Múltiples cuotas de socio',
            'Comparación antes/después'
          ],
          incluye: [
            'Desglose detallado de ítems',
            'Explicación de descuentos',
            'Historial de cambios (opcional)',
            'Cálculo paso a paso',
            'Explicaciones human-readable'
          ]
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
