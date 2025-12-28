"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cuota_batch_controller_1 = __importDefault(require("@/controllers/cuota-batch.controller"));
const router = (0, express_1.Router)();
router.get('/health', cuota_batch_controller_1.default.healthCheck);
router.post('/generar', cuota_batch_controller_1.default.generarCuotasBatch);
router.put('/update', cuota_batch_controller_1.default.updateCuotasBatch);
exports.default = router;
//# sourceMappingURL=cuota-batch.routes.js.map