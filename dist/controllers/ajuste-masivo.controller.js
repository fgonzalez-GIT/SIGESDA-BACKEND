"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjusteMasivoController = void 0;
const ajuste_masivo_service_1 = require("@/services/ajuste-masivo.service");
const cuota_dto_1 = require("@/dto/cuota.dto");
const logger_1 = require("@/utils/logger");
class AjusteMasivoController {
    constructor(ajusteMasivoService) {
        this.aplicarAjusteMasivo = async (req, res, next) => {
            try {
                const data = cuota_dto_1.ajusteMasivoSchema.parse(req.body);
                logger_1.logger.info(`[AJUSTE MASIVO API] Solicitud de ajuste masivo en modo ${data.modo}`);
                const resultado = await this.ajusteMasivoService.aplicarAjusteMasivo(data);
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
            }
            catch (error) {
                logger_1.logger.error(`[AJUSTE MASIVO API] Error: ${error}`);
                next(error);
            }
        };
        this.modificarItemsMasivo = async (req, res, next) => {
            try {
                const data = cuota_dto_1.modificarItemsMasivoSchema.parse(req.body);
                logger_1.logger.info(`[MODIFICAR ITEMS API] Solicitud de modificación masiva en modo ${data.modo}`);
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
            }
            catch (error) {
                logger_1.logger.error(`[MODIFICAR ITEMS API] Error: ${error}`);
                next(error);
            }
        };
        this.aplicarDescuentoGlobal = async (req, res, next) => {
            try {
                const data = cuota_dto_1.descuentoGlobalSchema.parse(req.body);
                logger_1.logger.info(`[DESCUENTO GLOBAL API] Solicitud de descuento global ${data.tipoDescuento} ${data.valor} para ${data.mes}/${data.anio}`);
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
            }
            catch (error) {
                logger_1.logger.error(`[DESCUENTO GLOBAL API] Error: ${error}`);
                next(error);
            }
        };
        this.healthCheck = async (req, res, next) => {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.ajusteMasivoService = ajusteMasivoService || new ajuste_masivo_service_1.AjusteMasivoService();
    }
}
exports.AjusteMasivoController = AjusteMasivoController;
//# sourceMappingURL=ajuste-masivo.controller.js.map