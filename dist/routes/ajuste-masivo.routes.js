"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajuste_masivo_controller_1 = require("@/controllers/ajuste-masivo.controller");
const ajuste_masivo_service_1 = require("@/services/ajuste-masivo.service");
const router = (0, express_1.Router)();
const ajusteMasivoService = new ajuste_masivo_service_1.AjusteMasivoService();
const ajusteMasivoController = new ajuste_masivo_controller_1.AjusteMasivoController(ajusteMasivoService);
router.get('/masivo/health', ajusteMasivoController.healthCheck);
router.post('/masivo', ajusteMasivoController.aplicarAjusteMasivo);
router.post('/modificar-items', ajusteMasivoController.modificarItemsMasivo);
router.post('/descuento-global', ajusteMasivoController.aplicarDescuentoGlobal);
exports.default = router;
//# sourceMappingURL=ajuste-masivo.routes.js.map