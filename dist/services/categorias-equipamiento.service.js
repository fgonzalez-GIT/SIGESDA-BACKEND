"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriasEquipamientoService = void 0;
const logger_1 = require("@/utils/logger");
class CategoriasEquipamientoService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        logger_1.logger.info(`Creando categoría de equipamiento: ${data.codigo}`);
        data.codigo = data.codigo.toUpperCase();
        const categoria = await this.repository.create(data);
        logger_1.logger.info(`Categoría de equipamiento creada exitosamente: ${categoria.id}`);
        return categoria;
    }
    async findAll(options) {
        logger_1.logger.info(`Listando categorías de equipamiento con filtros:`, options);
        return this.repository.findAll(options);
    }
    async findById(id) {
        logger_1.logger.info(`Obteniendo categoría de equipamiento: ${id}`);
        return this.repository.findById(id);
    }
    async update(id, data) {
        logger_1.logger.info(`Actualizando categoría de equipamiento: ${id}`);
        if (data.codigo) {
            data.codigo = data.codigo.toUpperCase();
        }
        const categoria = await this.repository.update(id, data);
        logger_1.logger.info(`Categoría de equipamiento actualizada exitosamente: ${categoria.id}`);
        return categoria;
    }
    async delete(id) {
        logger_1.logger.info(`Desactivando categoría de equipamiento: ${id}`);
        const categoria = await this.repository.delete(id);
        logger_1.logger.info(`Categoría de equipamiento desactivada exitosamente: ${categoria.id}`);
        return categoria;
    }
    async reorder(data) {
        logger_1.logger.info(`Reordenando ${data.ids.length} categorías de equipamiento`);
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
exports.CategoriasEquipamientoService = CategoriasEquipamientoService;
//# sourceMappingURL=categorias-equipamiento.service.js.map