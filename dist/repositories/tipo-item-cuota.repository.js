"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoItemCuotaRepository = void 0;
const database_1 = require("@/config/database");
class TipoItemCuotaRepository {
    async findAll(options) {
        const where = {};
        if (!options?.includeInactive) {
            where.activo = true;
        }
        if (options?.categoriaItemId) {
            where.categoriaItemId = options.categoriaItemId;
        }
        return await database_1.prisma.tipoItemCuota.findMany({
            where,
            include: {
                categoriaItem: true
            },
            orderBy: { orden: 'asc' }
        });
    }
    async findById(id) {
        return await database_1.prisma.tipoItemCuota.findUnique({
            where: { id },
            include: {
                categoriaItem: true,
                itemsCuota: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
    async findByCodigo(codigo) {
        return await database_1.prisma.tipoItemCuota.findUnique({
            where: { codigo },
            include: {
                categoriaItem: true
            }
        });
    }
    async findByCategoriaCodigo(categoriaCodigo, options) {
        const where = {
            categoriaItem: {
                codigo: categoriaCodigo
            }
        };
        if (!options?.includeInactive) {
            where.activo = true;
        }
        return await database_1.prisma.tipoItemCuota.findMany({
            where,
            include: {
                categoriaItem: true
            },
            orderBy: { orden: 'asc' }
        });
    }
    async findCalculados(options) {
        const where = {
            esCalculado: true
        };
        if (!options?.includeInactive) {
            where.activo = true;
        }
        return await database_1.prisma.tipoItemCuota.findMany({
            where,
            include: {
                categoriaItem: true
            },
            orderBy: { orden: 'asc' }
        });
    }
    async findManuales(options) {
        const where = {
            esCalculado: false
        };
        if (!options?.includeInactive) {
            where.activo = true;
        }
        return await database_1.prisma.tipoItemCuota.findMany({
            where,
            include: {
                categoriaItem: true
            },
            orderBy: { orden: 'asc' }
        });
    }
    async create(data) {
        return await database_1.prisma.tipoItemCuota.create({
            data,
            include: {
                categoriaItem: true
            }
        });
    }
    async update(id, data) {
        return await database_1.prisma.tipoItemCuota.update({
            where: { id },
            data,
            include: {
                categoriaItem: true
            }
        });
    }
    async softDelete(id) {
        return await database_1.prisma.tipoItemCuota.update({
            where: { id },
            data: { activo: false }
        });
    }
    async delete(id) {
        return await database_1.prisma.tipoItemCuota.delete({
            where: { id }
        });
    }
    async hasItemsCuota(id) {
        const count = await database_1.prisma.itemCuota.count({
            where: { tipoItemId: id }
        });
        return count > 0;
    }
    async countActive() {
        return await database_1.prisma.tipoItemCuota.count({
            where: { activo: true }
        });
    }
    async countByCategoria(categoriaItemId) {
        return await database_1.prisma.tipoItemCuota.count({
            where: {
                categoriaItemId,
                activo: true
            }
        });
    }
    async getUsageStats(id) {
        const tipo = await database_1.prisma.tipoItemCuota.findUnique({
            where: { id },
            include: {
                categoriaItem: true,
                itemsCuota: {
                    include: {
                        cuota: true
                    }
                }
            }
        });
        if (!tipo)
            return null;
        const totalItems = tipo.itemsCuota.length;
        const montoTotal = tipo.itemsCuota.reduce((sum, item) => sum + Number(item.monto), 0);
        const cuotasUnicas = new Set(tipo.itemsCuota.map(i => i.cuotaId));
        return {
            tipo: {
                id: tipo.id,
                codigo: tipo.codigo,
                nombre: tipo.nombre,
                categoria: tipo.categoriaItem.nombre
            },
            totalItemsGenerados: totalItems,
            cuotasAfectadas: cuotasUnicas.size,
            montoTotalAcumulado: montoTotal,
            promedioMonto: totalItems > 0 ? montoTotal / totalItems : 0
        };
    }
    async activate(id) {
        return await database_1.prisma.tipoItemCuota.update({
            where: { id },
            data: { activo: true }
        });
    }
    async deactivate(id) {
        return await database_1.prisma.tipoItemCuota.update({
            where: { id },
            data: { activo: false }
        });
    }
    async updateOrden(id, orden) {
        return await database_1.prisma.tipoItemCuota.update({
            where: { id },
            data: { orden }
        });
    }
    async updateFormula(id, formula) {
        return await database_1.prisma.tipoItemCuota.update({
            where: { id },
            data: { formula }
        });
    }
}
exports.TipoItemCuotaRepository = TipoItemCuotaRepository;
//# sourceMappingURL=tipo-item-cuota.repository.js.map