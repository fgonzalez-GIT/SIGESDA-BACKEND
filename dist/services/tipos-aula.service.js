"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposAulaService = void 0;
const logger_1 = require("@/utils/logger");
class TiposAulaService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        logger_1.logger.info(`Creando tipo de aula: ${data.codigo}`);
        data.codigo = data.codigo.toUpperCase();
        const tipo = await this.repository.create(data);
        logger_1.logger.info(`Tipo de aula creado exitosamente: ${tipo.id}`);
        return tipo;
    }
    async findAll(options) {
        logger_1.logger.info(`Listando tipos de aula con filtros:`, options);
        return this.repository.findAll(options);
    }
    async findById(id) {
        logger_1.logger.info(`Obteniendo tipo de aula: ${id}`);
        return this.repository.findById(id);
    }
    async update(id, data) {
        logger_1.logger.info(`Actualizando tipo de aula: ${id}`);
        if (data.codigo) {
            data.codigo = data.codigo.toUpperCase();
        }
        const tipo = await this.repository.update(id, data);
        logger_1.logger.info(`Tipo de aula actualizado exitosamente: ${tipo.id}`);
        return tipo;
    }
    async delete(id) {
        logger_1.logger.info(`Desactivando tipo de aula: ${id}`);
        const tipo = await this.repository.delete(id);
        logger_1.logger.info(`Tipo de aula desactivado exitosamente: ${tipo.id}`);
        return tipo;
    }
    async reorder(data) {
        logger_1.logger.info(`Reordenando ${data.ids.length} tipos de aula`);
        return this.repository.reorder(data);
    }
    async getActivos() {
        return this.repository.findAll({
            includeInactive: false,
            orderBy: 'orden',
            orderDir: 'asc'
        });
    }
}
exports.TiposAulaService = TiposAulaService;
//# sourceMappingURL=tipos-aula.service.js.map