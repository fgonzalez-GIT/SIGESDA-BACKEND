"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposActividadService = void 0;
const logger_1 = require("@/utils/logger");
class TiposActividadService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        logger_1.logger.info(`Creando tipo de actividad: ${data.codigo}`);
        data.codigo = data.codigo.toUpperCase();
        const tipo = await this.repository.create(data);
        logger_1.logger.info(`Tipo de actividad creado exitosamente: ${tipo.id}`);
        return tipo;
    }
    async findAll(query) {
        logger_1.logger.info(`Listando tipos de actividad con filtros:`, query);
        return this.repository.findAll(query);
    }
    async findById(id) {
        logger_1.logger.info(`Obteniendo tipo de actividad: ${id}`);
        return this.repository.findById(id);
    }
    async update(id, data) {
        logger_1.logger.info(`Actualizando tipo de actividad: ${id}`);
        if (data.codigo) {
            data.codigo = data.codigo.toUpperCase();
        }
        const tipo = await this.repository.update(id, data);
        logger_1.logger.info(`Tipo de actividad actualizado exitosamente: ${tipo.id}`);
        return tipo;
    }
    async delete(id) {
        logger_1.logger.info(`Desactivando tipo de actividad: ${id}`);
        const tipo = await this.repository.delete(id);
        logger_1.logger.info(`Tipo de actividad desactivado exitosamente: ${tipo.id}`);
        return tipo;
    }
    async reorder(data) {
        logger_1.logger.info(`Reordenando ${data.ids.length} tipos de actividad`);
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
exports.TiposActividadService = TiposActividadService;
//# sourceMappingURL=tiposActividad.service.js.map