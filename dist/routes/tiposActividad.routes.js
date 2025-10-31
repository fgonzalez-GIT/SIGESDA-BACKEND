"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tiposActividad_controller_1 = require("@/controllers/tiposActividad.controller");
const tiposActividad_service_1 = require("@/services/tiposActividad.service");
const tiposActividad_repository_1 = require("@/repositories/tiposActividad.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const repository = new tiposActividad_repository_1.TiposActividadRepository(database_1.prisma);
const service = new tiposActividad_service_1.TiposActividadService(repository);
const controller = new tiposActividad_controller_1.TiposActividadController(service);
router.patch('/reorder', controller.reorder.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
exports.default = router;
//# sourceMappingURL=tiposActividad.routes.js.map