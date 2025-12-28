"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimuladorCuotaController = void 0;
const simulador_cuota_service_1 = require("@/services/simulador-cuota.service");
const cuota_dto_1 = require("@/dto/cuota.dto");
const logger_1 = require("@/utils/logger");
class SimuladorCuotaController {
    constructor(cuotaService, motorReglasDescuentos, ajusteService, exencionService) {
        this.simularGeneracion = async (req, res, next) => {
            try {
                const data = cuota_dto_1.simularGeneracionSchema.parse(req.body);
                logger_1.logger.info(`[SIMULADOR API] Solicitud de simulación de generación para ${data.mes}/${data.anio}`);
                const resultado = await this.simuladorService.simularGeneracion(data);
                res.status(200).json({
                    success: true,
                    data: resultado,
                    message: `Simulación completada: ${resultado.resumen.totalCuotas} cuotas, monto total: $${resultado.resumen.montoTotal.toFixed(2)}`
                });
            }
            catch (error) {
                logger_1.logger.error(`[SIMULADOR API] Error en simulación de generación: ${error}`);
                next(error);
            }
        };
        this.simularReglaDescuento = async (req, res, next) => {
            try {
                const data = cuota_dto_1.simularReglaDescuentoSchema.parse(req.body);
                logger_1.logger.info(`[SIMULADOR API] Solicitud de simulación de reglas para ${data.mes}/${data.anio}`);
                const resultado = await this.simuladorService.simularReglaDescuento(data);
                res.status(200).json({
                    success: true,
                    data: resultado,
                    message: `Impacto calculado: ${resultado.diferencia.montoTotal >= 0 ? '+' : ''}$${resultado.diferencia.montoTotal.toFixed(2)} (${resultado.diferencia.porcentaje.toFixed(2)}%)`
                });
            }
            catch (error) {
                logger_1.logger.error(`[SIMULADOR API] Error en simulación de reglas: ${error}`);
                next(error);
            }
        };
        this.compararEscenarios = async (req, res, next) => {
            try {
                const data = cuota_dto_1.compararEscenariosSchema.parse(req.body);
                logger_1.logger.info(`[SIMULADOR API] Solicitud de comparación de ${data.escenarios.length} escenarios`);
                const resultado = await this.simuladorService.compararEscenarios(data);
                res.status(200).json({
                    success: true,
                    data: resultado,
                    message: `Comparación completada. Mejor escenario: ${resultado.comparacion.mejorEscenario} ($${resultado.comparacion.mayorRecaudacion.toFixed(2)})`
                });
            }
            catch (error) {
                logger_1.logger.error(`[SIMULADOR API] Error en comparación de escenarios: ${error}`);
                next(error);
            }
        };
        this.simularImpactoMasivo = async (req, res, next) => {
            try {
                const data = cuota_dto_1.simularImpactoMasivoSchema.parse(req.body);
                logger_1.logger.info(`[SIMULADOR API] Solicitud de simulación de impacto masivo para ${data.mes}/${data.anio}`);
                const resultado = await this.simuladorService.simularImpactoMasivo(data);
                res.status(200).json({
                    success: true,
                    data: resultado,
                    message: `Impacto masivo calculado: ${resultado.resumen.diferenciaTotal >= 0 ? '+' : ''}$${resultado.resumen.diferenciaTotal.toFixed(2)} (${resultado.resumen.porcentajeCambio.toFixed(2)}%)`
                });
            }
            catch (error) {
                logger_1.logger.error(`[SIMULADOR API] Error en simulación de impacto masivo: ${error}`);
                next(error);
            }
        };
        this.healthCheck = async (req, res, next) => {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.simuladorService = new simulador_cuota_service_1.SimuladorCuotaService(cuotaService, motorReglasDescuentos, ajusteService, exencionService);
    }
}
exports.SimuladorCuotaController = SimuladorCuotaController;
//# sourceMappingURL=simulador-cuota.controller.js.map