"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diasSemana_controller_1 = require("@/controllers/diasSemana.controller");
const diasSemana_service_1 = require("@/services/diasSemana.service");
const diasSemana_repository_1 = require("@/repositories/diasSemana.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const repository = new diasSemana_repository_1.DiasSemanaRepository(database_1.prisma);
const service = new diasSemana_service_1.DiasSemanaService(repository);
const controller = new diasSemana_controller_1.DiasSemanaController(service);
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
exports.default = router;
//# sourceMappingURL=diasSemana.routes.js.map