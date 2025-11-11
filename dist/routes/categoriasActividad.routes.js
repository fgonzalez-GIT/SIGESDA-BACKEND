"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoriasActividad_controller_1 = require("@/controllers/categoriasActividad.controller");
const categoriasActividad_service_1 = require("@/services/categoriasActividad.service");
const categoriasActividad_repository_1 = require("@/repositories/categoriasActividad.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const repository = new categoriasActividad_repository_1.CategoriasActividadRepository(database_1.prisma);
const service = new categoriasActividad_service_1.CategoriasActividadService(repository);
const controller = new categoriasActividad_controller_1.CategoriasActividadController(service);
router.patch('/reorder', controller.reorder.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
exports.default = router;
//# sourceMappingURL=categoriasActividad.routes.js.map