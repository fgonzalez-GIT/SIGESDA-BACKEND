"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadosAulaService = void 0;
const logger_1 = require("@/utils/logger");
class EstadosAulaService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        logger_1.logger.info(`Creando estado de aula: ${data.codigo}`);
        data.codigo = data.codigo.toUpperCase();
        const estado = await this.repository.create(data);
        logger_1.logger.info(`Estado de aula creado exitosamente: ${estado.id}`);
        return estado;
    }
    async findAll(options) {
        logger_1.logger.info(`Listando estados de aula con filtros:`, options);
        return this.repository.findAll(options);
    }
    async findById(id) {
        logger_1.logger.info(`Obteniendo estado de aula: ${id}`);
        return this.repository.findById(id);
    }
    async update(id, data) {
        logger_1.logger.info(`Actualizando estado de aula: ${id}`);
        if (data.codigo) {
            data.codigo = data.codigo.toUpperCase();
        }
        const estado = await this.repository.update(id, data);
        logger_1.logger.info(`Estado de aula actualizado exitosamente: ${estado.id}`);
        return estado;
    }
    async delete(id) {
        logger_1.logger.info(`Desactivando estado de aula: ${id}`);
        const estado = await this.repository.delete(id);
        logger_1.logger.info(`Estado de aula desactivado exitosamente: ${estado.id}`);
        return estado;
    }
    async reorder(data) {
        logger_1.logger.info(`Reordenando ${data.ids.length} estados de aula`);
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
exports.EstadosAulaService = EstadosAulaService;
//# sourceMappingURL=estados-aula.service.js.map