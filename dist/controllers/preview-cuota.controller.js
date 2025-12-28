"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewCuotaController = void 0;
const preview_cuota_service_1 = require("@/services/preview-cuota.service");
const cuota_dto_1 = require("@/dto/cuota.dto");
const logger_1 = require("@/utils/logger");
class PreviewCuotaController {
    constructor(previewService) {
        this.previewCuota = async (req, res, next) => {
            try {
                const data = cuota_dto_1.previewCuotaSchema.parse(req.body);
                logger_1.logger.info('[PREVIEW API] Solicitud de preview de cuota', { data });
                const resultado = await this.previewService.previewCuota(data);
                res.status(200).json({
                    success: true,
                    data: resultado,
                    message: data.cuotaId
                        ? `Preview de cuota ${data.cuotaId} generado`
                        : `Preview simulado generado para socio ${data.socioId}`
                });
            }
            catch (error) {
                logger_1.logger.error('[PREVIEW API] Error en preview de cuota', { error });
                next(error);
            }
        };
        this.previewCuotasSocio = async (req, res, next) => {
            try {
                const data = cuota_dto_1.previewCuotasSocioSchema.parse(req.body);
                logger_1.logger.info('[PREVIEW API] Solicitud de preview de socio', { data });
                const resultado = await this.previewService.previewCuotasSocio(data);
                res.status(200).json({
                    success: true,
                    data: resultado,
                    message: `Preview generado: ${resultado.cuotas.length} cuotas encontradas`
                });
            }
            catch (error) {
                logger_1.logger.error('[PREVIEW API] Error en preview de socio', { error });
                next(error);
            }
        };
        this.compararCuota = async (req, res, next) => {
            try {
                const data = cuota_dto_1.compararCuotaSchema.parse(req.body);
                logger_1.logger.info('[PREVIEW API] Solicitud de comparación de cuota', { data });
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
            }
            catch (error) {
                logger_1.logger.error('[PREVIEW API] Error en comparación', { error });
                next(error);
            }
        };
        this.healthCheck = async (req, res, next) => {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.previewService = previewService || new preview_cuota_service_1.PreviewCuotaService();
    }
}
exports.PreviewCuotaController = PreviewCuotaController;
//# sourceMappingURL=preview-cuota.controller.js.map