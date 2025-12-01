"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const estados_aula_controller_1 = require("@/controllers/estados-aula.controller");
const estados_aula_service_1 = require("@/services/estados-aula.service");
const estados_aula_repository_1 = require("@/repositories/estados-aula.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const repository = new estados_aula_repository_1.EstadosAulaRepository(database_1.prisma);
const service = new estados_aula_service_1.EstadosAulaService(repository);
const controller = new estados_aula_controller_1.EstadosAulaController(service);
router.patch('/reorder', controller.reorder.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
exports.default = router;
//# sourceMappingURL=estados-aula.routes.js.map