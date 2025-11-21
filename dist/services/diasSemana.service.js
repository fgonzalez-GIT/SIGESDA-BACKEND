"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiasSemanaService = void 0;
const logger_1 = require("@/utils/logger");
class DiasSemanaService {
    constructor(repository) {
        this.repository = repository;
    }
    async findAll() {
        logger_1.logger.info(`Listando días de la semana`);
        return this.repository.findAll();
    }
    async findById(id) {
        logger_1.logger.info(`Obteniendo día de la semana: ${id}`);
        return this.repository.findById(id);
    }
    async findByCodigo(codigo) {
        logger_1.logger.info(`Obteniendo día de la semana por código: ${codigo}`);
        return this.repository.findByCodigo(codigo);
    }
}
exports.DiasSemanaService = DiasSemanaService;
//# sourceMappingURL=diasSemana.service.js.map