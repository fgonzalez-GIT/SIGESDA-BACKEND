"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categorias_equipamiento_controller_1 = require("@/controllers/categorias-equipamiento.controller");
const categorias_equipamiento_service_1 = require("@/services/categorias-equipamiento.service");
const categorias_equipamiento_repository_1 = require("@/repositories/categorias-equipamiento.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const repository = new categorias_equipamiento_repository_1.CategoriasEquipamientoRepository(database_1.prisma);
const service = new categorias_equipamiento_service_1.CategoriasEquipamientoService(repository);
const controller = new categorias_equipamiento_controller_1.CategoriasEquipamientoController(service);
router.patch('/reorder', controller.reorder.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
exports.default = router;
//# sourceMappingURL=categorias-equipamiento.routes.js.map