"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajuste_cuota_controller_1 = require("@/controllers/ajuste-cuota.controller");
const ajuste_cuota_service_1 = require("@/services/ajuste-cuota.service");
const ajuste_cuota_repository_1 = require("@/repositories/ajuste-cuota.repository");
const historial_ajuste_cuota_repository_1 = require("@/repositories/historial-ajuste-cuota.repository");
const persona_repository_1 = require("@/repositories/persona.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const ajusteRepository = new ajuste_cuota_repository_1.AjusteCuotaRepository(database_1.prisma);
const historialRepository = new historial_ajuste_cuota_repository_1.HistorialAjusteCuotaRepository(database_1.prisma);
const personaRepository = new persona_repository_1.PersonaRepository(database_1.prisma);
const ajusteService = new ajuste_cuota_service_1.AjusteCuotaService(ajusteRepository, historialRepository, personaRepository);
const ajusteController = new ajuste_cuota_controller_1.AjusteCuotaController(ajusteService, historialRepository);
router.get('/', ajusteController.getAllHistorial.bind(ajusteController));
router.get('/stats', ajusteController.getHistorialStats.bind(ajusteController));
exports.default = router;
//# sourceMappingURL=historial-cuota.routes.js.map