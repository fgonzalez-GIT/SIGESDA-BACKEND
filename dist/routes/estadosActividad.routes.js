"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const estadosActividad_controller_1 = require("@/controllers/estadosActividad.controller");
const estadosActividad_service_1 = require("@/services/estadosActividad.service");
const estadosActividad_repository_1 = require("@/repositories/estadosActividad.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const repository = new estadosActividad_repository_1.EstadosActividadRepository(database_1.prisma);
const service = new estadosActividad_service_1.EstadosActividadService(repository);
const controller = new estadosActividad_controller_1.EstadosActividadController(service);
router.patch('/reorder', controller.reorder.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
exports.default = router;
//# sourceMappingURL=estadosActividad.routes.js.map