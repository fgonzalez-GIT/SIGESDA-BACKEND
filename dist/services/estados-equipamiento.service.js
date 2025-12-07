"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadosEquipamientoService = void 0;
const logger_1 = require("@/utils/logger");
class EstadosEquipamientoService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        logger_1.logger.info(`Creando estado de equipamiento: ${data.codigo}`);
        data.codigo = data.codigo.toUpperCase();
        const estado = await this.repository.create(data);
        logger_1.logger.info(`Estado de equipamiento creado exitosamente: ${estado.id}`);
        return estado;
    }
    async findAll(options) {
        logger_1.logger.info(`Listando estados de equipamiento con filtros:`, options);
        return this.repository.findAll(options);
    }
    async findById(id) {
        logger_1.logger.info(`Obteniendo estado de equipamiento: ${id}`);
        return this.repository.findById(id);
    }
    async update(id, data) {
        logger_1.logger.info(`Actualizando estado de equipamiento: ${id}`);
        if (data.codigo) {
            data.codigo = data.codigo.toUpperCase();
        }
        const estado = await this.repository.update(id, data);
        logger_1.logger.info(`Estado de equipamiento actualizado exitosamente: ${estado.id}`);
        return estado;
    }
    async delete(id) {
        logger_1.logger.info(`Desactivando estado de equipamiento: ${id}`);
        const estado = await this.repository.delete(id);
        logger_1.logger.info(`Estado de equipamiento desactivado exitosamente: ${estado.id}`);
        return estado;
    }
    async reorder(data) {
        logger_1.logger.info(`Reordenando ${data.ids.length} estados de equipamiento`);
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
exports.EstadosEquipamientoService = EstadosEquipamientoService;
//# sourceMappingURL=estados-equipamiento.service.js.map