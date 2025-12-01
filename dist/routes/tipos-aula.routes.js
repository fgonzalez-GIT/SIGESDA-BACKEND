"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tipos_aula_controller_1 = require("@/controllers/tipos-aula.controller");
const tipos_aula_service_1 = require("@/services/tipos-aula.service");
const tipos_aula_repository_1 = require("@/repositories/tipos-aula.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const repository = new tipos_aula_repository_1.TiposAulaRepository(database_1.prisma);
const service = new tipos_aula_service_1.TiposAulaService(repository);
const controller = new tipos_aula_controller_1.TiposAulaController(service);
router.patch('/reorder', controller.reorder.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
exports.default = router;
//# sourceMappingURL=tipos-aula.routes.js.map