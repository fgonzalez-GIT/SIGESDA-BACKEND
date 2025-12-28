"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const preview_cuota_controller_1 = require("@/controllers/preview-cuota.controller");
const preview_cuota_service_1 = require("@/services/preview-cuota.service");
const router = (0, express_1.Router)();
const previewService = new preview_cuota_service_1.PreviewCuotaService();
const previewController = new preview_cuota_controller_1.PreviewCuotaController(previewService);
router.get('/health', previewController.healthCheck);
router.post('/', previewController.previewCuota);
router.post('/socio', previewController.previewCuotasSocio);
router.post('/comparar', previewController.compararCuota);
exports.default = router;
//# sourceMappingURL=preview-cuota.routes.js.map