"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rollback_cuota_controller_1 = require("@/controllers/rollback-cuota.controller");
const rollback_cuota_service_1 = require("@/services/rollback-cuota.service");
const router = (0, express_1.Router)();
const rollbackService = new rollback_cuota_service_1.RollbackCuotaService();
const rollbackController = new rollback_cuota_controller_1.RollbackCuotaController(rollbackService);
router.get('/health', rollbackController.healthCheck);
router.post('/validar', rollbackController.validarRollback);
router.post('/generacion', rollbackController.rollbackGeneracion);
router.post('/:id', rollbackController.rollbackCuota);
exports.default = router;
//# sourceMappingURL=rollback-cuota.routes.js.map