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
                estadoEquipamientoId: data.estadoEquipamientoId,
                cantidad: data.cantidad ?? 1,
                descripcion: data.descripcion,
                observaciones: data.observaciones,
                activo: data.activo ?? true
            },
            include: {
                categoriaEquipamiento: true,
                estadoEquipamiento: true
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.activo !== undefined) {
            where.activo = query.activo;
        }
        if (query.estadoEquipamientoId !== undefined) {
            where.estadoEquipamientoId = query.estadoEquipamientoId;
        }
        if (query.conStock !== undefined && query.conStock) {
            where.cantidad = { gt: 0 };
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
                    estadoEquipamiento: true,
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
                estadoEquipamiento: true,
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
                estadoEquipamientoId: data.estadoEquipamientoId,
                cantidad: data.cantidad,
                descripcion: data.descripcion,
                observaciones: data.observaciones,
                activo: data.activo
            },
            include: {
                categoriaEquipamiento: true,
                estadoEquipamiento: true
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
    async getCantidadAsignada(equipamientoId) {
        const result = await this.prisma.aulaEquipamiento.aggregate({
            where: { equipamientoId },
            _sum: {
                cantidad: true
            }
        });
        return result._sum.cantidad || 0;
    }
    async getCantidadDisponible(equipamientoId) {
        const equipamiento = await this.prisma.equipamiento.findUnique({
            where: { id: equipamientoId },
            select: { cantidad: true }
        });
        if (!equipamiento) {
            throw new Error('Equipamiento no encontrado');
        }
        const cantidadAsignada = await this.getCantidadAsignada(equipamientoId);
        return equipamiento.cantidad - cantidadAsignada;
    }
    async findByEstado(estadoEquipamientoId) {
        return this.prisma.equipamiento.findMany({
            where: { estadoEquipamientoId },
            include: {
                categoriaEquipamiento: true,
                estadoEquipamiento: true
            },
            orderBy: { nombre: 'asc' }
        });
    }
    async findByIdWithDisponibilidad(equipamientoId) {
        const equipamiento = await this.findById(equipamientoId);
        if (!equipamiento)
            return null;
        const cantidadAsignada = await this.getCantidadAsignada(equipamientoId);
        const cantidadDisponible = equipamiento.cantidad - cantidadAsignada;
        return {
            ...equipamiento,
            disponibilidad: {
                cantidadTotal: equipamiento.cantidad,
                cantidadAsignada,
                cantidadDisponible,
                tieneDeficit: cantidadDisponible < 0
            }
        };
    }
}
exports.EquipamientoRepository = EquipamientoRepository;
//# sourceMappingURL=equipamiento.repository.js.map