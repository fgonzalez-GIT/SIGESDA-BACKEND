"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaSocioService = void 0;
const logger_1 = require("@/utils/logger");
class CategoriaSocioService {
    constructor(categoriaSocioRepository) {
        this.categoriaSocioRepository = categoriaSocioRepository;
    }
    async getCategorias(query) {
        return this.categoriaSocioRepository.findAll(query);
    }
    async getCategoriaById(id) {
        const categoria = await this.categoriaSocioRepository.findById(id);
        if (!categoria) {
            throw new Error(`Categoría con ID ${id} no encontrada`);
        }
        return categoria;
    }
    async getCategoriaByCodigo(codigo) {
        const categoria = await this.categoriaSocioRepository.findByCodigo(codigo);
        if (!categoria) {
            throw new Error(`Categoría con código ${codigo} no encontrada`);
        }
        return categoria;
    }
    async createCategoria(data) {
        const existingCodigo = await this.categoriaSocioRepository.findByCodigo(data.codigo);
        if (existingCodigo) {
            throw new Error(`Ya existe una categoría con el código ${data.codigo}`);
        }
        const categoria = await this.categoriaSocioRepository.create(data);
        logger_1.logger.info(`Categoría creada: ${categoria.nombre} (${categoria.codigo}) - ID: ${categoria.id}`);
        return categoria;
    }
    async updateCategoria(id, data) {
        await this.getCategoriaById(id);
        if (data.codigo) {
            const existing = await this.categoriaSocioRepository.findByCodigo(data.codigo);
            if (existing && existing.id !== id) {
                throw new Error(`Ya existe una categoría con el código ${data.codigo}`);
            }
        }
        const updatedCategoria = await this.categoriaSocioRepository.update(id, data);
        logger_1.logger.info(`Categoría actualizada: ${updatedCategoria.nombre} (${updatedCategoria.codigo}) - ID: ${id}`);
        return updatedCategoria;
    }
    async deleteCategoria(id) {
        const categoria = await this.getCategoriaById(id);
        await this.categoriaSocioRepository.delete(id);
        logger_1.logger.info(`Categoría eliminada: ${categoria.nombre} (${categoria.codigo}) - ID: ${id}`);
    }
    async getStats(id) {
        const categoria = await this.getCategoriaById(id);
        const stats = await this.categoriaSocioRepository.getStats(id);
        return {
            categoria,
            stats
        };
    }
    async toggleActive(id) {
        const categoria = await this.getCategoriaById(id);
        return this.categoriaSocioRepository.update(id, {
            activa: !categoria.activa
        });
    }
    async reorder(categoriaIds) {
        const updatePromises = categoriaIds.map((id, index) => this.categoriaSocioRepository.update(id, { orden: index + 1 }));
        await Promise.all(updatePromises);
        logger_1.logger.info(`Orden de categorías actualizado: ${categoriaIds.length} categorías reordenadas`);
    }
}
exports.CategoriaSocioService = CategoriaSocioService;
//# sourceMappingURL=categoria-socio.service.js.map