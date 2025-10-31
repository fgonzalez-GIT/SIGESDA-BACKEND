"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaSocioRepository = void 0;
const client_1 = require("@prisma/client");
class CategoriaSocioRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const where = {};
        if (query && query.includeInactive === false) {
            where.activa = true;
        }
        if (query?.search) {
            where.OR = [
                { codigo: { contains: query.search, mode: 'insensitive' } },
                { nombre: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        return this.prisma.categoriaSocio.findMany({
            where,
            orderBy: { orden: 'asc' }
        });
    }
    async findById(id) {
        return this.prisma.categoriaSocio.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        personas: true,
                        cuotas: true
                    }
                }
            }
        });
    }
    async findByCodigo(codigo) {
        return this.prisma.categoriaSocio.findUnique({
            where: { codigo: codigo.toUpperCase() }
        });
    }
    async create(data) {
        return this.prisma.categoriaSocio.create({
            data: {
                ...data,
                montoCuota: new client_1.Prisma.Decimal(data.montoCuota),
                descuento: new client_1.Prisma.Decimal(data.descuento)
            }
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (updateData.montoCuota !== undefined) {
            updateData.montoCuota = new client_1.Prisma.Decimal(updateData.montoCuota);
        }
        if (updateData.descuento !== undefined) {
            updateData.descuento = new client_1.Prisma.Decimal(updateData.descuento);
        }
        return this.prisma.categoriaSocio.update({
            where: { id },
            data: updateData
        });
    }
    async delete(id) {
        const personasCount = await this.prisma.persona.count({
            where: { categoriaId: id }
        });
        if (personasCount > 0) {
            throw new Error(`No se puede eliminar la categoría porque tiene ${personasCount} socios asociados`);
        }
        const cuotasCount = await this.prisma.cuota.count({
            where: { categoriaId: id }
        });
        if (cuotasCount > 0) {
            throw new Error(`No se puede eliminar la categoría porque tiene ${cuotasCount} cuotas asociadas`);
        }
        return this.prisma.categoriaSocio.delete({
            where: { id }
        });
    }
    async getStats(id) {
        const [personasCount, cuotasStats] = await Promise.all([
            this.prisma.persona.count({
                where: { categoriaId: id }
            }),
            this.prisma.cuota.aggregate({
                where: { categoriaId: id },
                _count: { id: true },
                _sum: { montoTotal: true }
            })
        ]);
        return {
            totalPersonas: personasCount,
            totalCuotas: cuotasStats._count.id,
            totalRecaudado: parseFloat(cuotasStats._sum.montoTotal?.toString() || '0')
        };
    }
}
exports.CategoriaSocioRepository = CategoriaSocioRepository;
//# sourceMappingURL=categoria-socio.repository.js.map