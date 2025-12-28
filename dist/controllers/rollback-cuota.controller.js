"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollbackCuotaController = void 0;
const rollback_cuota_service_1 = require("@/services/rollback-cuota.service");
const cuota_dto_1 = require("@/dto/cuota.dto");
const logger_1 = require("@/utils/logger");
class RollbackCuotaController {
    constructor(rollbackService) {
        this.rollbackGeneracion = async (req, res, next) => {
            try {
                const data = cuota_dto_1.rollbackGeneracionSchema.parse(req.body);
                logger_1.logger.info(`[ROLLBACK API] Solicitud de rollback generación ${data.mes}/${data.anio} en modo ${data.modo}`);
                const resultado = await this.rollbackService.rollbackGeneracion(data);
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
            }
            catch (error) {
                logger_1.logger.error(`[ROLLBACK API] Error: ${error}`);
                next(error);
            }
        };
        this.rollbackCuota = async (req, res, next) => {
            try {
                const cuotaId = parseInt(req.params.id);
                const bodyData = req.body || {};
                const data = cuota_dto_1.rollbackCuotaSchema.parse({
                    cuotaId,
                    ...bodyData
                });
                logger_1.logger.info(`[ROLLBACK API] Solicitud de rollback cuota ${cuotaId} en modo ${data.modo}`);
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
            }
            catch (error) {
                logger_1.logger.error(`[ROLLBACK API] Error: ${error}`);
                next(error);
            }
        };
        this.validarRollback = async (req, res, next) => {
            try {
                const data = cuota_dto_1.validarRollbackSchema.parse(req.body);
                logger_1.logger.info(`[ROLLBACK API] Validación de rollback para ${data.mes}/${data.anio}`);
                const resultado = await this.rollbackService.validarRollback(data);
                res.status(200).json({
                    success: true,
                    data: resultado,
                    message: resultado.puedeHacerRollback
                        ? `Rollback posible: ${resultado.cuotasEliminables} cuotas pueden ser eliminadas`
                        : `Rollback bloqueado: ${resultado.errores.length} errores encontrados`
                });
            }
            catch (error) {
                logger_1.logger.error(`[ROLLBACK API] Error en validación: ${error}`);
                next(error);
            }
        };
        this.healthCheck = async (req, res, next) => {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.rollbackService = rollbackService || new rollback_cuota_service_1.RollbackCuotaService();
    }
}
exports.RollbackCuotaController = RollbackCuotaController;
//# sourceMappingURL=rollback-cuota.controller.js.map