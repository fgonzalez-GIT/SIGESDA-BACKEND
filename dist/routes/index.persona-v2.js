"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const persona_routes_new_1 = __importDefault(require("./persona.routes.new"));
const persona_tipo_routes_1 = __importDefault(require("./persona-tipo.routes"));
const router = (0, express_1.Router)();
router.use('/personas', persona_routes_new_1.default);
router.use('/', persona_tipo_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.persona-v2.js.map