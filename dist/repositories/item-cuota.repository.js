"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemCuotaRepository = void 0;
const database_1 = require("@/config/database");
class ItemCuotaRepository {
    async findByCuotaId(cuotaId) {
        return await database_1.prisma.itemCuota.findMany({
            where: { cuotaId },
            include: {
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                }
            },
            orderBy: [
                { tipoItem: { orden: 'asc' } },
                { createdAt: 'asc' }
            ]
        });
    }
    async findById(id) {
        return await database_1.prisma.itemCuota.findUnique({
            where: { id },
            include: {
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                },
                cuota: {
                    include: {
                        categoria: true,
                        recibo: true
                    }
                }
            }
        });
    }
    async create(data) {
        return await database_1.prisma.itemCuota.create({
            data,
            include: {
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                }
            }
        });
    }
    async createMany(items) {
        return await database_1.prisma.itemCuota.createMany({
            data: items,
            skipDuplicates: false
        });
    }
    async update(id, data) {
        return await database_1.prisma.itemCuota.update({
            where: { id },
            data,
            include: {
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                }
            }
        });
    }
    async delete(id) {
        return await database_1.prisma.itemCuota.delete({
            where: { id }
        });
    }
    async deleteByCuotaId(cuotaId) {
        return await database_1.prisma.itemCuota.deleteMany({
            where: { cuotaId }
        });
    }
    async countByCuotaId(cuotaId) {
        return await database_1.prisma.itemCuota.count({
            where: { cuotaId }
        });
    }
    async getSummaryByCuotaId(cuotaId) {
        const items = await this.findByCuotaId(cuotaId);
        const summary = {
            base: 0,
            actividades: 0,
            descuentos: 0,
            recargos: 0,
            bonificaciones: 0,
            otros: 0,
            total: 0,
            itemsCount: items.length
        };
        for (const item of items) {
            const monto = Number(item.monto);
            const categoria = item.tipoItem.categoriaItem.codigo;
            const categoriasQueRestan = ['DESCUENTO', 'BONIFICACION', 'AJUSTE'];
            if (categoriasQueRestan.includes(categoria)) {
                summary.total -= monto;
            }
            else {
                summary.total += monto;
            }
            switch (categoria) {
                case 'BASE':
                    summary.base += monto;
                    break;
                case 'ACTIVIDAD':
                    summary.actividades += monto;
                    break;
                case 'DESCUENTO':
                    summary.descuentos += monto;
                    break;
                case 'RECARGO':
                    summary.recargos += monto;
                    break;
                case 'BONIFICACION':
                    summary.bonificaciones += monto;
                    break;
                case 'OTRO':
                    summary.otros += monto;
                    break;
            }
        }
        return summary;
    }
    async findAutomaticosByCuotaId(cuotaId) {
        return await database_1.prisma.itemCuota.findMany({
            where: {
                cuotaId,
                esAutomatico: true
            },
            include: {
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                }
            },
            orderBy: [
                { tipoItem: { orden: 'asc' } },
                { createdAt: 'asc' }
            ]
        });
    }
    async findManualesByCuotaId(cuotaId) {
        return await database_1.prisma.itemCuota.findMany({
            where: {
                cuotaId,
                esAutomatico: false
            },
            include: {
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findEditablesByCuotaId(cuotaId) {
        return await database_1.prisma.itemCuota.findMany({
            where: {
                cuotaId,
                esEditable: true
            },
            include: {
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                }
            }
        });
    }
    async findByTipoItemCodigo(codigo, options) {
        return await database_1.prisma.itemCuota.findMany({
            where: {
                tipoItem: {
                    codigo
                }
            },
            include: {
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                },
                cuota: {
                    include: {
                        recibo: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: options?.limit,
            skip: options?.offset
        });
    }
    async findByCategoriaCodigo(codigo, options) {
        return await database_1.prisma.itemCuota.findMany({
            where: {
                tipoItem: {
                    categoriaItem: {
                        codigo
                    }
                }
            },
            include: {
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                },
                cuota: true
            },
            orderBy: { createdAt: 'desc' },
            take: options?.limit,
            skip: options?.offset
        });
    }
    async calculateTotalByCuotaId(cuotaId) {
        const items = await database_1.prisma.itemCuota.findMany({
            where: { cuotaId },
            select: { monto: true }
        });
        return items.reduce((sum, item) => sum + Number(item.monto), 0);
    }
    async replaceAllByCuotaId(cuotaId, newItems) {
        return await database_1.prisma.$transaction(async (tx) => {
            await tx.itemCuota.deleteMany({
                where: { cuotaId }
            });
            await tx.itemCuota.createMany({
                data: newItems
            });
            return await tx.itemCuota.findMany({
                where: { cuotaId },
                include: {
                    tipoItem: {
                        include: {
                            categoriaItem: true
                        }
                    }
                },
                orderBy: [
                    { tipoItem: { orden: 'asc' } },
                    { createdAt: 'asc' }
                ]
            });
        });
    }
    async getGlobalStats() {
        const totalItems = await database_1.prisma.itemCuota.count();
        const totalAutomaticos = await database_1.prisma.itemCuota.count({
            where: { esAutomatico: true }
        });
        const totalManuales = await database_1.prisma.itemCuota.count({
            where: { esAutomatico: false }
        });
        const items = await database_1.prisma.itemCuota.findMany({
            select: {
                monto: true,
                tipoItem: {
                    select: {
                        categoriaItem: {
                            select: {
                                codigo: true
                            }
                        }
                    }
                }
            }
        });
        const montoTotal = items.reduce((sum, item) => {
            const monto = Number(item.monto);
            const categoria = item.tipoItem.categoriaItem.codigo;
            const categoriasQueRestan = ['DESCUENTO', 'BONIFICACION', 'AJUSTE'];
            return categoriasQueRestan.includes(categoria)
                ? sum - monto
                : sum + monto;
        }, 0);
        const itemsPorCategoria = await database_1.prisma.itemCuota.groupBy({
            by: ['tipoItemId'],
            _count: true,
            _sum: {
                monto: true
            }
        });
        return {
            totalItems,
            totalAutomaticos,
            totalManuales,
            montoTotal,
            promedioMonto: totalItems > 0 ? montoTotal / totalItems : 0,
            itemsPorTipo: itemsPorCategoria.length
        };
    }
    async hasItems(cuotaId) {
        const count = await this.countByCuotaId(cuotaId);
        return count > 0;
    }
    async getDesgloseByCuotaId(cuotaId) {
        const items = await this.findByCuotaId(cuotaId);
        const summary = await this.getSummaryByCuotaId(cuotaId);
        const desglose = {
            cuotaId,
            items: items.map(item => ({
                id: item.id,
                tipo: item.tipoItem.codigo,
                nombre: item.tipoItem.nombre,
                categoria: item.tipoItem.categoriaItem.codigo,
                categoriaIcono: item.tipoItem.categoriaItem.icono,
                concepto: item.concepto,
                monto: Number(item.monto),
                cantidad: Number(item.cantidad),
                porcentaje: item.porcentaje ? Number(item.porcentaje) : null,
                esAutomatico: item.esAutomatico,
                esEditable: item.esEditable,
                observaciones: item.observaciones,
                metadata: item.metadata
            })),
            resumen: summary,
            totalItems: items.length
        };
        return desglose;
    }
}
exports.ItemCuotaRepository = ItemCuotaRepository;
//# sourceMappingURL=item-cuota.repository.js.map