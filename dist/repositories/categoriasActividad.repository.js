"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriasActividadRepository = void 0;
class CategoriasActividadRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.categorias_actividades.findUnique({
            where: { codigo: data.codigo }
        });
        if (existing) {
            throw new Error(`Ya existe una categoría de actividad con código: ${data.codigo}`);
        }
        let orden = data.orden;
        if (!orden || orden === 0) {
            const maxOrden = await this.prisma.categorias_actividades.findFirst({
                select: { orden: true },
                orderBy: { orden: 'desc' }
            });
            orden = (maxOrden?.orden ?? 0) + 1;
        }
        return this.prisma.categorias_actividades.create({
            data: {
                codigo: data.codigo,
                nombre: data.nombre,
                descripcion: data.descripcion ?? null,
                activo: data.activo ?? true,
                orden
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (!query.includeInactive) {
            where.activo = true;
        }
        if (query.search) {
            where.OR = [
                { codigo: { contains: query.search, mode: 'insensitive' } },
                { nombre: { contains: query.search, mode: 'insensitive' } },
                { descripcion: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        const orderBy = {};
        orderBy[query.orderBy] = query.orderDir;
        return this.prisma.categorias_actividades.findMany({
            where,
            orderBy
        });
    }
    async findById(id) {
        const categoria = await this.prisma.categorias_actividades.findUnique({
            where: { id }
        });
        if (!categoria) {
            throw new Error(`Categoría de actividad con ID ${id} no encontrada`);
        }
        return categoria;
    }
    async update(id, data) {
        await this.findById(id);
        if (data.codigo) {
            const existing = await this.prisma.categorias_actividades.findFirst({
                where: {
                    codigo: data.codigo,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new Error(`Ya existe una categoría de actividad con código: ${data.codigo}`);
            }
        }
        return this.prisma.categorias_actividades.update({
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
        const actividadesActivas = await this.prisma.actividades.count({
            where: {
                categoria_id: id,
                estado_id: { in: [1, 2, 3] }
            }
        });
        if (actividadesActivas > 0) {
            throw new Error(`No se puede desactivar la categoría "${categoria.nombre}" porque tiene ${actividadesActivas} actividad(es) activa(s)`);
        }
        return this.prisma.categorias_actividades.update({
            where: { id },
            data: { activo: false }
        });
    }
    async reorder(data) {
        const updates = data.ids.map((id, index) => this.prisma.categorias_actividades.update({
            where: { id },
            data: { orden: index + 1 }
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Orden actualizado exitosamente', count: updates.length };
    }
}
exports.CategoriasActividadRepository = CategoriasActividadRepository;
//# sourceMappingURL=categoriasActividad.repository.js.map