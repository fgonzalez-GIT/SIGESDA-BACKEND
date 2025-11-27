"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriasEquipamientoRepository = void 0;
class CategoriasEquipamientoRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.categoriasEquipamiento.findUnique({
            where: { codigo: data.codigo }
        });
        if (existing) {
            throw new Error(`Ya existe una categoría de equipamiento con código: ${data.codigo}`);
        }
        let orden = data.orden;
        if (!orden || orden === 0) {
            const maxOrden = await this.prisma.categoriasEquipamiento.findFirst({
                select: { orden: true },
                orderBy: { orden: 'desc' }
            });
            orden = (maxOrden?.orden ?? 0) + 1;
        }
        return this.prisma.categoriasEquipamiento.create({
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
        return this.prisma.categoriasEquipamiento.findMany({
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
        const categoria = await this.prisma.categoriasEquipamiento.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { equipamientos: true }
                }
            }
        });
        if (!categoria) {
            throw new Error(`Categoría de equipamiento con ID ${id} no encontrada`);
        }
        return categoria;
    }
    async findByCodigo(codigo) {
        return this.prisma.categoriasEquipamiento.findUnique({
            where: { codigo }
        });
    }
    async update(id, data) {
        await this.findById(id);
        if (data.codigo) {
            const existing = await this.prisma.categoriasEquipamiento.findFirst({
                where: {
                    codigo: data.codigo,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new Error(`Ya existe una categoría de equipamiento con código: ${data.codigo}`);
            }
        }
        return this.prisma.categoriasEquipamiento.update({
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
        const categoria = await this.findById(id);
        const equipamientosActivos = await this.prisma.equipamiento.count({
            where: {
                categoriaEquipamientoId: id,
                activo: true
            }
        });
        if (equipamientosActivos > 0) {
            throw new Error(`No se puede desactivar la categoría "${categoria.nombre}" porque tiene ${equipamientosActivos} equipamiento(s) activo(s)`);
        }
        return this.prisma.categoriasEquipamiento.update({
            where: { id },
            data: { activo: false }
        });
    }
    async reorder(data) {
        const updates = data.ids.map((id, index) => this.prisma.categoriasEquipamiento.update({
            where: { id },
            data: { orden: index + 1 }
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Orden actualizado exitosamente', count: updates.length };
    }
}
exports.CategoriasEquipamientoRepository = CategoriasEquipamientoRepository;
//# sourceMappingURL=categorias-equipamiento.repository.js.map