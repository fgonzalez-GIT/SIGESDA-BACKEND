"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriaSocioRouter = void 0;
const express_1 = require("express");
const categoria_socio_controller_1 = require("@/controllers/categoria-socio.controller");
const categoria_socio_service_1 = require("@/services/categoria-socio.service");
const categoria_socio_repository_1 = require("@/repositories/categoria-socio.repository");
const database_1 = __importDefault(require("@/config/database"));
const prisma = database_1.default.getInstance();
const repository = new categoria_socio_repository_1.CategoriaSocioRepository(prisma);
const service = new categoria_socio_service_1.CategoriaSocioService(repository);
const controller = new categoria_socio_controller_1.CategoriaSocioController(service);
exports.categoriaSocioRouter = (0, express_1.Router)();
exports.categoriaSocioRouter.get('/', (req, res) => controller.getCategorias(req, res));
exports.categoriaSocioRouter.get('/:id', (req, res) => controller.getCategoriaById(req, res));
exports.categoriaSocioRouter.get('/codigo/:codigo', (req, res) => controller.getCategoriaByCodigo(req, res));
exports.categoriaSocioRouter.get('/:id/stats', (req, res) => controller.getStats(req, res));
exports.categoriaSocioRouter.post('/', (req, res) => controller.createCategoria(req, res));
exports.categoriaSocioRouter.put('/:id', (req, res) => controller.updateCategoria(req, res));
exports.categoriaSocioRouter.patch('/:id/toggle', (req, res) => controller.toggleActive(req, res));
exports.categoriaSocioRouter.post('/reorder', (req, res) => controller.reorder(req, res));
exports.categoriaSocioRouter.delete('/:id', (req, res) => controller.deleteCategoria(req, res));
//# sourceMappingURL=categoria-socio.routes.js.map