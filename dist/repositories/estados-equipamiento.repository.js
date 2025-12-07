"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadosEquipamientoRepository = void 0;
class EstadosEquipamientoRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.estadoEquipamiento.findUnique({
            where: { codigo: data.codigo }
        });
        if (existing) {
            throw new Error(`Ya existe un estado de equipamiento con código: ${data.codigo}`);
        }
        let orden = data.orden;
        if (!orden || orden === 0) {
            const maxOrden = await this.prisma.estadoEquipamiento.findFirst({
                select: { orden: true },
                orderBy: { orden: 'desc' }
            });
            orden = (maxOrden?.orden ?? 0) + 1;
        }
        return this.prisma.estadoEquipamiento.create({
            data: {
                codigo: data.codigo,
                nombre: data.nombre,
                descripcion: data.descripcion ?? null,
                activo: data.activo ?? true,
                orden
            }
        });
    }
    async findAll(options) {
        const where = {};
        if (!options?.includeInactive) {
            where.activo = true;
        }
        if (options?.search) {
            where.OR = [
                { codigo: { contains: options.search, mode: 'insensitive' } },
                { nombre: { contains: options.search, mode: 'insensitive' } },
                { descripcion: { contains: options.search, mode: 'insensitive' } }
            ];
        }
        const orderBy = {};
        orderBy[options?.orderBy || 'orden'] = options?.orderDir || 'asc';
        return this.prisma.estadoEquipamiento.findMany({
            where,
            orderBy,
            include: {
                _count: {
                    select: { equipamientos: true }
                }
            }
        });
    }
    async findById(id) {
        const estado = await this.prisma.estadoEquipamiento.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { equipamientos: true }
                }
            }
        });
        if (!estado) {
            throw new Error(`Estado de equipamiento con ID ${id} no encontrado`);
        }
        return estado;
    }
    async findByCodigo(codigo) {
        return this.prisma.estadoEquipamiento.findUnique({
            where: { codigo }
        });
    }
    async update(id, data) {
        await this.findById(id);
        if (data.codigo) {
            const existing = await this.prisma.estadoEquipamiento.findFirst({
                where: {
                    codigo: data.codigo,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new Error(`Ya existe un estado de equipamiento con código: ${data.codigo}`);
            }
        }
        return this.prisma.estadoEquipamiento.update({
            where: { id },
            data: {
                ...(data.codigo && { codigo: data.codigo }),
                ...(data.nombre && { nombre: data.nombre }),
                ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
                ...(data.activo !== undefined && { activo: data.activo }),
                ...(data.orden !== undefined && { orden: data.orden })
            }
        });
    }
    async delete(id) {
        const estado = await this.findById(id);
        const equipamientosActivos = await this.prisma.equipamiento.count({
            where: {
                estadoEquipamientoId: id,
                activo: true
            }
        });
        if (equipamientosActivos > 0) {
            throw new Error(`No se puede desactivar el estado "${estado.nombre}" porque tiene ${equipamientosActivos} equipamiento(s) activo(s)`);
        }
        return this.prisma.estadoEquipamiento.update({
            where: { id },
            data: { activo: false }
        });
    }
    async reorder(data) {
        const updates = data.ids.map((id, index) => this.prisma.estadoEquipamiento.update({
            where: { id },
            data: { orden: index + 1 }
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Orden actualizado exitosamente', count: updates.length };
    }
}
exports.EstadosEquipamientoRepository = EstadosEquipamientoRepository;
//# sourceMappingURL=estados-equipamiento.repository.js.map