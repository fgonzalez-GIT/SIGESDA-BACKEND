"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipamientoRepository = void 0;
class EquipamientoRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.equipamiento.create({
            data: {
                codigo: data.codigo,
                nombre: data.nombre,
                categoriaEquipamientoId: data.categoriaEquipamientoId,
                descripcion: data.descripcion,
                observaciones: data.observaciones,
                activo: data.activo ?? true
            },
            include: {
                categoriaEquipamiento: true
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.activo !== undefined) {
            where.activo = query.activo;
        }
        if (query.search) {
            where.OR = [
                { nombre: { contains: query.search, mode: 'insensitive' } },
                { descripcion: { contains: query.search, mode: 'insensitive' } },
                { observaciones: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await Promise.all([
            this.prisma.equipamiento.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: [
                    { activo: 'desc' },
                    { nombre: 'asc' }
                ],
                include: {
                    categoriaEquipamiento: true,
                    _count: {
                        select: {
                            aulas_equipamientos: true
                        }
                    }
                }
            }),
            this.prisma.equipamiento.count({ where })
        ]);
        return { data, total };
    }
    async findById(id) {
        return this.prisma.equipamiento.findUnique({
            where: { id },
            include: {
                categoriaEquipamiento: true,
                aulas_equipamientos: {
                    include: {
                        aula: {
                            select: {
                                id: true,
                                nombre: true,
                                capacidad: true,
                                ubicacion: true,
                                activa: true
                            }
                        }
                    },
                    orderBy: {
                        aula: {
                            nombre: 'asc'
                        }
                    }
                }
            }
        });
    }
    async findByNombre(nombre) {
        return this.prisma.equipamiento.findUnique({
            where: { nombre }
        });
    }
    async findByCodigo(codigo) {
        return this.prisma.equipamiento.findUnique({
            where: { codigo }
        });
    }
    async findMaxCodigoByCategoriaPrefix(prefix) {
        const result = await this.prisma.equipamiento.findFirst({
            where: {
                codigo: {
                    startsWith: prefix
                }
            },
            orderBy: {
                codigo: 'desc'
            },
            select: {
                codigo: true
            }
        });
        return result?.codigo || null;
    }
    async update(id, data) {
        return this.prisma.equipamiento.update({
            where: { id },
            data: {
                nombre: data.nombre,
                categoriaEquipamientoId: data.categoriaEquipamientoId,
                descripcion: data.descripcion,
                observaciones: data.observaciones,
                activo: data.activo
            },
            include: {
                categoriaEquipamiento: true
            }
        });
    }
    async delete(id) {
        return this.prisma.equipamiento.delete({
            where: { id }
        });
    }
    async softDelete(id) {
        return this.prisma.equipamiento.update({
            where: { id },
            data: { activo: false }
        });
    }
    async checkUsageInAulas(id) {
        return this.prisma.aulaEquipamiento.count({
            where: { equipamientoId: id }
        });
    }
}
exports.EquipamientoRepository = EquipamientoRepository;
//# sourceMappingURL=equipamiento.repository.js.map