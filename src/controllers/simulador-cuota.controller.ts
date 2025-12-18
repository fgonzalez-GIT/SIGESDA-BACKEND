import { Request, Response, NextFunction } from 'express';
import { SimuladorCuotaService } from '@/services/simulador-cuota.service';
import { CuotaService } from '@/services/cuota.service';
import { MotorReglasDescuentos } from '@/services/motor-reglas-descuentos.service';
import { AjusteCuotaService } from '@/services/ajuste-cuota.service';
import { ExencionCuotaService } from '@/services/exencion-cuota.service';
import {
  SimularGeneracionDto,
  SimularReglaDescuentoDto,
  CompararEscenariosDto,
  SimularImpactoMasivoDto,
  simularGeneracionSchema,
  simularReglaDescuentoSchema,
  compararEscenariosSchema,
  simularImpactoMasivoSchema
} from '@/dto/cuota.dto';
import { logger } from '@/utils/logger';

/**
 * SimuladorCuotaController
 *
 * Controlador para endpoints de simulación de cuotas
 * FASE 5 - Task 5.1: Simulador de impacto
 *
 * Endpoints:
 * - POST /api/simulador/cuotas/generacion - Simular generación de cuotas
 * - POST /api/simulador/cuotas/reglas - Simular cambios en reglas
 * - POST /api/simulador/cuotas/escenarios - Comparar escenarios
 * - POST /api/simulador/cuotas/impacto-masivo - Simular impacto masivo
 */
export class SimuladorCuotaController {
  private simuladorService: SimuladorCuotaService;

  constructor(
    cuotaService: CuotaService,
    motorReglasDescuentos: MotorReglasDescuentos,
    ajusteService?: AjusteCuotaService,
    exencionService?: ExencionCuotaService
  ) {
    this.simuladorService = new SimuladorCuotaService(
      cuotaService,
      motorReglasDescuentos,
      ajusteService,
      exencionService
    );
  }

  /**
   * POST /api/simulador/cuotas/generacion
   * Simula la generación de cuotas para un período sin persistir
   */
  simularGeneracion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: SimularGeneracionDto = simularGeneracionSchema.parse(req.body);

      logger.info(
        `[SIMULADOR API] Solicitud de simulación de generación para ${data.mes}/${data.anio}`
      );

      const resultado = await this.simuladorService.simularGeneracion(data);

      res.status(200).json({
        success: true,
        data: resultado,
        message: `Simulación completada: ${resultado.resumen.totalCuotas} cuotas, monto total: $${resultado.resumen.montoTotal.toFixed(2)}`
      });
    } catch (error) {
      logger.error(`[SIMULADOR API] Error en simulación de generación: ${error}`);
      next(error);
    }
  };

  /**
   * POST /api/simulador/cuotas/reglas
   * Simula el impacto de cambios en reglas de descuento
   */
  simularReglaDescuento = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: SimularReglaDescuentoDto = simularReglaDescuentoSchema.parse(req.body);

      logger.info(
        `[SIMULADOR API] Solicitud de simulación de reglas para ${data.mes}/${data.anio}`
      );

      const resultado = await this.simuladorService.simularReglaDescuento(data);

      res.status(200).json({
        success: true,
        data: resultado,
        message: `Impacto calculado: ${resultado.diferencia.montoTotal >= 0 ? '+' : ''}$${resultado.diferencia.montoTotal.toFixed(2)} (${resultado.diferencia.porcentaje.toFixed(2)}%)`
      });
    } catch (error) {
      logger.error(`[SIMULADOR API] Error en simulación de reglas: ${error}`);
      next(error);
    }
  };

  /**
   * POST /api/simulador/cuotas/escenarios
   * Compara múltiples escenarios de generación
   */
  compararEscenarios = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CompararEscenariosDto = compararEscenariosSchema.parse(req.body);

      logger.info(
        `[SIMULADOR API] Solicitud de comparación de ${data.escenarios.length} escenarios`
      );

      const resultado = await this.simuladorService.compararEscenarios(data);

      res.status(200).json({
        success: true,
        data: resultado,
        message: `Comparación completada. Mejor escenario: ${resultado.comparacion.mejorEscenario} ($${resultado.comparacion.mayorRecaudacion.toFixed(2)})`
      });
    } catch (error) {
      logger.error(`[SIMULADOR API] Error en comparación de escenarios: ${error}`);
      next(error);
    }
  };

  /**
   * POST /api/simulador/cuotas/impacto-masivo
   * Simula el impacto masivo de cambios en configuración
   */
  simularImpactoMasivo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: SimularImpactoMasivoDto = simularImpactoMasivoSchema.parse(req.body);

      logger.info(
        `[SIMULADOR API] Solicitud de simulación de impacto masivo para ${data.mes}/${data.anio}`
      );

      const resultado = await this.simuladorService.simularImpactoMasivo(data);

      res.status(200).json({
        success: true,
        data: resultado,
        message: `Impacto masivo calculado: ${resultado.resumen.diferenciaTotal >= 0 ? '+' : ''}$${resultado.resumen.diferenciaTotal.toFixed(2)} (${resultado.resumen.porcentajeCambio.toFixed(2)}%)`
      });
    } catch (error) {
      logger.error(`[SIMULADOR API] Error en simulación de impacto masivo: ${error}`);
      next(error);
    }
  };

  /**
   * GET /api/simulador/cuotas/health
   * Health check del simulador
   */
  healthCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'Simulador de cuotas operativo',
        version: '1.0.0',
        endpoints: [
          'POST /api/simulador/cuotas/generacion',
          'POST /api/simulador/cuotas/reglas',
          'POST /api/simulador/cuotas/escenarios',
          'POST /api/simulador/cuotas/impacto-masivo'
        ]
      });
    } catch (error) {
      next(error);
    }
  };
}
