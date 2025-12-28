"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposActividadRepository = void 0;
class TiposActividadRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.tipos_actividades.findUnique({
            where: { codigo: data.codigo }
        });
        if (existing) {
            throw new Error(`Ya existe un tipo de actividad con código: ${data.codigo}`);
        }
        let orden = data.orden;
        if (!orden || orden === 0) {
            const maxOrden = await this.prisma.tipos_actividades.findFirst({
                select: { orden: true },
                orderBy: { orden: 'desc' }
            });
            orden = (maxOrden?.orden ?? 0) + 1;
        }
        return this.prisma.tipos_actividades.create({
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
        return this.prisma.tipos_actividades.findMany({
            where,
            orderBy
        });
    }
    async findById(id) {
        const tipo = await this.prisma.tipos_actividades.findUnique({
            where: { id }
        });
        if (!tipo) {
            throw new Error(`Tipo de actividad con ID ${id} no encontrado`);
        }
        return tipo;
    }
    async update(id, data) {
        await this.findById(id);
        if (data.codigo) {
            const existing = await this.prisma.tipos_actividades.findFirst({
                where: {
                    codigo: data.codigo,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new Error(`Ya existe un tipo de actividad con código: ${data.codigo}`);
            }
        }
        return this.prisma.tipos_actividades.update({
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
        const tipo = await this.findById(id);
        return this.prisma.tipos_actividades.update({
            where: { id },
            data: { activo: false }
        });
    }
    async reorder(data) {
        const updates = data.ids.map((id, index) => this.prisma.tipos_actividades.update({
            where: { id },
            data: { orden: index + 1 }
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Orden actualizado exitosamente', count: updates.length };
    }
}
exports.TiposActividadRepository = TiposActividadRepository;
//# sourceMappingURL=tiposActividad.repository.js.map