"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadosActividadService = void 0;
const logger_1 = require("@/utils/logger");
class EstadosActividadService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        logger_1.logger.info(`Creando estado de actividad: ${data.codigo}`);
        data.codigo = data.codigo.toUpperCase();
        const estado = await this.repository.create(data);
        logger_1.logger.info(`Estado de actividad creado exitosamente: ${estado.id}`);
        return estado;
    }
    async findAll(query) {
        logger_1.logger.info(`Listando estados de actividad con filtros:`, query);
        return this.repository.findAll(query);
    }
    async findById(id) {
        logger_1.logger.info(`Obteniendo estado de actividad: ${id}`);
        return this.repository.findById(id);
    }
    async update(id, data) {
        logger_1.logger.info(`Actualizando estado de actividad: ${id}`);
        if (data.codigo) {
            data.codigo = data.codigo.toUpperCase();
        }
        const estado = await this.repository.update(id, data);
        logger_1.logger.info(`Estado de actividad actualizado exitosamente: ${estado.id}`);
        return estado;
    }
    async delete(id) {
        logger_1.logger.info(`Desactivando estado de actividad: ${id}`);
        const estado = await this.repository.delete(id);
        logger_1.logger.info(`Estado de actividad desactivado exitosamente: ${estado.id}`);
        return estado;
    }
    async reorder(data) {
        logger_1.logger.info(`Reordenando ${data.ids.length} estados de actividad`);
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
exports.EstadosActividadService = EstadosActividadService;
//# sourceMappingURL=estadosActividad.service.js.map