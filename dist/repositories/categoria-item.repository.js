"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaItemRepository = void 0;
const database_1 = require("@/config/database");
class CategoriaItemRepository {
    async findAll(options) {
        const where = {};
        if (!options?.includeInactive) {
            where.activo = true;
        }
        return await database_1.prisma.categoriaItem.findMany({
            where,
            orderBy: { orden: 'asc' }
        });
    }
    async findById(id) {
        return await database_1.prisma.categoriaItem.findUnique({
            where: { id },
            include: {
                tiposItems: true
            }
        });
    }
    async findByCodigo(codigo) {
        return await database_1.prisma.categoriaItem.findUnique({
            where: { codigo },
            include: {
                tiposItems: true
            }
        });
    }
    async create(data) {
        return await database_1.prisma.categoriaItem.create({
            data
        });
    }
    async update(id, data) {
        return await database_1.prisma.categoriaItem.update({
            where: { id },
            data
        });
    }
    async softDelete(id) {
        return await database_1.prisma.categoriaItem.update({
            where: { id },
            data: { activo: false }
        });
    }
    async delete(id) {
        return await database_1.prisma.categoriaItem.delete({
            where: { id }
        });
    }
    async hasTiposItems(id) {
        const count = await database_1.prisma.tipoItemCuota.count({
            where: { categoriaItemId: id }
        });
        return count > 0;
    }
    async countActive() {
        return await database_1.prisma.categoriaItem.count({
            where: { activo: true }
        });
    }
    async getUsageStats(id) {
        const categoria = await database_1.prisma.categoriaItem.findUnique({
            where: { id },
            include: {
                tiposItems: {
                    include: {
                        itemsCuota: true
                    }
                }
            }
        });
        if (!categoria)
            return null;
        const totalTipos = categoria.tiposItems.length;
        const tiposActivos = categoria.tiposItems.filter(t => t.activo).length;
        const totalItems = categoria.tiposItems.reduce((sum, tipo) => sum + tipo.itemsCuota.length, 0);
        return {
            categoria: {
                id: categoria.id,
                codigo: categoria.codigo,
                nombre: categoria.nombre
            },
            totalTipos,
            tiposActivos,
            tiposInactivos: totalTipos - tiposActivos,
            totalItemsGenerados: totalItems
        };
    }
}
exports.CategoriaItemRepository = CategoriaItemRepository;
//# sourceMappingURL=categoria-item.repository.js.map