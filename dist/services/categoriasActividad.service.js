"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriasActividadService = void 0;
const logger_1 = require("@/utils/logger");
class CategoriasActividadService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        logger_1.logger.info(`Creando categoría de actividad: ${data.codigo}`);
        data.codigo = data.codigo.toUpperCase();
        const categoria = await this.repository.create(data);
        logger_1.logger.info(`Categoría de actividad creada exitosamente: ${categoria.id}`);
        return categoria;
    }
    async findAll(query) {
        logger_1.logger.info(`Listando categorías de actividad con filtros:`, query);
        return this.repository.findAll(query);
    }
    async findById(id) {
        logger_1.logger.info(`Obteniendo categoría de actividad: ${id}`);
        return this.repository.findById(id);
    }
    async update(id, data) {
        logger_1.logger.info(`Actualizando categoría de actividad: ${id}`);
        if (data.codigo) {
            data.codigo = data.codigo.toUpperCase();
        }
        const categoria = await this.repository.update(id, data);
        logger_1.logger.info(`Categoría de actividad actualizada exitosamente: ${categoria.id}`);
        return categoria;
    }
    async delete(id) {
        logger_1.logger.info(`Desactivando categoría de actividad: ${id}`);
        const categoria = await this.repository.delete(id);
        logger_1.logger.info(`Categoría de actividad desactivada exitosamente: ${categoria.id}`);
        return categoria;
    }
    async reorder(data) {
        logger_1.logger.info(`Reordenando ${data.ids.length} categorías de actividad`);
        return this.repository.reorder(data);
    }
    async getActivas() {
        return this.repository.findAll({
            includeInactive: false,
            orderBy: 'orden',
            orderDir: 'asc'
        });
    }
}
exports.CategoriasActividadService = CategoriasActividadService;
//# sourceMappingURL=categoriasActividad.service.js.map