"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rolesDocentes_controller_1 = require("@/controllers/rolesDocentes.controller");
const rolesDocentes_service_1 = require("@/services/rolesDocentes.service");
const rolesDocentes_repository_1 = require("@/repositories/rolesDocentes.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const repository = new rolesDocentes_repository_1.RolesDocentesRepository(database_1.prisma);
const service = new rolesDocentes_service_1.RolesDocentesService(repository);
const controller = new rolesDocentes_controller_1.RolesDocentesController(service);
router.patch('/reorder', controller.reorder.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
exports.default = router;
//# sourceMappingURL=rolesDocentes.routes.js.map