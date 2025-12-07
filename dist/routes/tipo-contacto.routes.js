"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tipo_contacto_controller_1 = require("@/controllers/tipo-contacto.controller");
const tipo_contacto_service_1 = require("@/services/tipo-contacto.service");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const tipoContactoService = new tipo_contacto_service_1.TipoContactoService(database_1.prisma);
const tipoContactoController = new tipo_contacto_controller_1.TipoContactoController(tipoContactoService);
router.get('/estadisticas/uso', tipoContactoController.getEstadisticasUso.bind(tipoContactoController));
router.post('/', tipoContactoController.create.bind(tipoContactoController));
router.get('/', tipoContactoController.findAll.bind(tipoContactoController));
router.get('/:id', tipoContactoController.findById.bind(tipoContactoController));
router.put('/:id', tipoContactoController.update.bind(tipoContactoController));
router.delete('/:id', tipoContactoController.delete.bind(tipoContactoController));
router.post('/:id/desactivar', tipoContactoController.deactivate.bind(tipoContactoController));
router.post('/:id/activar', tipoContactoController.activate.bind(tipoContactoController));
exports.default = router;
//# sourceMappingURL=tipo-contacto.routes.js.map