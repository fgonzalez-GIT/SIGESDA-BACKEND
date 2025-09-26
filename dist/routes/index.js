"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const persona_routes_1 = __importDefault(require("./persona.routes"));
const actividad_routes_1 = __importDefault(require("./actividad.routes"));
const aula_routes_1 = __importDefault(require("./aula.routes"));
const router = (0, express_1.Router)();
router.use('/personas', persona_routes_1.default);
router.use('/actividades', actividad_routes_1.default);
router.use('/aulas', aula_routes_1.default);
router.use('/socios', persona_routes_1.default);
router.use('/docentes', persona_routes_1.default);
router.use('/proveedores', persona_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map