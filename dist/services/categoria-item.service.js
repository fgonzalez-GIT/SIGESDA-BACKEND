"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaItemService = void 0;
const categoria_item_repository_1 = require("@/repositories/categoria-item.repository");
const error_middleware_1 = require("@/middleware/error.middleware");
class CategoriaItemService {
    constructor() {
        this.repository = new categoria_item_repository_1.CategoriaItemRepository();
    }
    async getAll(includeInactive = false) {
        return await this.repository.findAll({ includeInactive });
    }
    async getById(id) {
        const categoria = await this.repository.findById(id);
        if (!categoria) {
            throw new error_middleware_1.AppError('Categoría de ítem no encontrada', 404);
        }
        return categoria;
    }
    async getByCodigo(codigo) {
        const categoria = await this.repository.findByCodigo(codigo);
        if (!categoria) {
            throw new error_middleware_1.AppError(`Categoría de ítem con código '${codigo}' no encontrada`, 404);
        }
        return categoria;
    }
    async create(data) {
        const existente = await this.repository.findByCodigo(data.codigo);
        if (existente) {
            throw new error_middleware_1.AppError(`Ya existe una categoría con el código '${data.codigo}'`, 400);
        }
        const codigoRegex = /^[A-Z0-9_]+$/;
        if (!codigoRegex.test(data.codigo)) {
            throw new error_middleware_1.AppError('El código debe contener solo letras mayúsculas, números y guiones bajos', 400);
        }
        if (data.codigo.length < 2 || data.codigo.length > 50) {
            throw new error_middleware_1.AppError('El código debe tener entre 2 y 50 caracteres', 400);
        }
        if (data.nombre.length < 2 || data.nombre.length > 100) {
            throw new error_middleware_1.AppError('El nombre debe tener entre 2 y 100 caracteres', 400);
        }
        if (data.orden === undefined) {
            const categorias = await this.repository.findAll({ includeInactive: true });
            const maxOrden = categorias.reduce((max, cat) => Math.max(max, cat.orden), 0);
            data.orden = maxOrden + 1;
        }
        return await this.repository.create({
            codigo: data.codigo,
            nombre: data.nombre,
            descripcion: data.descripcion,
            icono: data.icono,
            color: data.color,
            activo: true,
            orden: data.orden
        });
    }
    async update(id, data) {
        const categoria = await this.repository.findById(id);
        if (!categoria) {
            throw new error_middleware_1.AppError('Categoría de ítem no encontrada', 404);
        }
        if (data.nombre && (data.nombre.length < 2 || data.nombre.length > 100)) {
            throw new error_middleware_1.AppError('El nombre debe tener entre 2 y 100 caracteres', 400);
        }
        return await this.repository.update(id, data);
    }
    async deactivate(id) {
        const categoria = await this.repository.findById(id);
        if (!categoria) {
            throw new error_middleware_1.AppError('Categoría de ítem no encontrada', 404);
        }
        if (!categoria.activo) {
            throw new error_middleware_1.AppError('La categoría ya está inactiva', 400);
        }
        const tiposActivos = categoria.tiposItems.filter(t => t.activo).length;
        if (tiposActivos > 0) {
            console.warn(`⚠️  Desactivando categoría '${categoria.nombre}' que tiene ${tiposActivos} tipo(s) de ítem activo(s)`);
        }
        return await this.repository.softDelete(id);
    }
    async activate(id) {
        const categoria = await this.repository.findById(id);
        if (!categoria) {
            throw new error_middleware_1.AppError('Categoría de ítem no encontrada', 404);
        }
        if (categoria.activo) {
            throw new error_middleware_1.AppError('La categoría ya está activa', 400);
        }
        return await this.repository.update(id, { activo: true });
    }
    async delete(id) {
        const categoria = await this.repository.findById(id);
        if (!categoria) {
            throw new error_middleware_1.AppError('Categoría de ítem no encontrada', 404);
        }
        const hasTipos = await this.repository.hasTiposItems(id);
        if (hasTipos) {
            throw new error_middleware_1.AppError('No se puede eliminar la categoría porque tiene tipos de ítems asociados. Desactívela en su lugar.', 400);
        }
        return await this.repository.delete(id);
    }
    async getUsageStats(id) {
        const stats = await this.repository.getUsageStats(id);
        if (!stats) {
            throw new error_middleware_1.AppError('Categoría de ítem no encontrada', 404);
        }
        return stats;
    }
    async reorder(ordenamiento) {
        const ordenes = ordenamiento.map(o => o.orden);
        const ordenesUnicos = new Set(ordenes);
        if (ordenes.length !== ordenesUnicos.size) {
            throw new error_middleware_1.AppError('Los órdenes deben ser únicos', 400);
        }
        const updates = ordenamiento.map(({ id, orden }) => this.repository.update(id, { orden }));
        await Promise.all(updates);
        return { success: true, updated: ordenamiento.length };
    }
    async validateForUse(id) {
        const categoria = await this.repository.findById(id);
        if (!categoria) {
            throw new error_middleware_1.AppError('Categoría de ítem no encontrada', 404);
        }
        if (!categoria.activo) {
            throw new error_middleware_1.AppError('La categoría de ítem está inactiva', 400);
        }
        return true;
    }
    async getSummary() {
        const categorias = await this.repository.findAll({ includeInactive: true });
        const summary = await Promise.all(categorias.map(async (cat) => {
            const stats = await this.repository.getUsageStats(cat.id);
            return {
                id: cat.id,
                codigo: cat.codigo,
                nombre: cat.nombre,
                icono: cat.icono,
                color: cat.color,
                activo: cat.activo,
                orden: cat.orden,
                totalTipos: stats?.totalTipos || 0,
                tiposActivos: stats?.tiposActivos || 0
            };
        }));
        return {
            categorias: summary,
            totalCategorias: categorias.length,
            categoriasActivas: categorias.filter(c => c.activo).length
        };
    }
}
exports.CategoriaItemService = CategoriaItemService;
//# sourceMappingURL=categoria-item.service.js.map