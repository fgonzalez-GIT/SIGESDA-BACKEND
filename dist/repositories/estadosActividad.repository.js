"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadosActividadRepository = void 0;
class EstadosActividadRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.estados_actividades.findUnique({
            where: { codigo: data.codigo }
        });
        if (existing) {
            throw new Error(`Ya existe un estado de actividad con código: ${data.codigo}`);
        }
        let orden = data.orden;
        if (!orden || orden === 0) {
            const maxOrden = await this.prisma.estados_actividades.findFirst({
                select: { orden: true },
                orderBy: { orden: 'desc' }
            });
            orden = (maxOrden?.orden ?? 0) + 1;
        }
        return this.prisma.estados_actividades.create({
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
        return this.prisma.estados_actividades.findMany({
            where,
            orderBy,
            include: {
                _count: {
                    select: { actividades: true }
                }
            }
        });
    }
    async findById(id) {
        const estado = await this.prisma.estados_actividades.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { actividades: true }
                }
            }
        });
        if (!estado) {
            throw new Error(`Estado de actividad con ID ${id} no encontrado`);
        }
        return estado;
    }
    async update(id, data) {
        await this.findById(id);
        if (data.codigo) {
            const existing = await this.prisma.estados_actividades.findFirst({
                where: {
                    codigo: data.codigo,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new Error(`Ya existe un estado de actividad con código: ${data.codigo}`);
            }
        }
        return this.prisma.estados_actividades.update({
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
        const actividadesActivas = await this.prisma.actividades.count({
            where: {
                estadoId: id,
                activa: true
            }
        });
        if (actividadesActivas > 0) {
            throw new Error(`No se puede desactivar el estado "${estado.nombre}" porque tiene ${actividadesActivas} actividad(es) activa(s)`);
        }
        return this.prisma.estados_actividades.update({
            where: { id },
            data: { activo: false }
        });
    }
    async reorder(data) {
        const updates = data.ids.map((id, index) => this.prisma.estados_actividades.update({
            where: { id },
            data: { orden: index + 1 }
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Orden actualizado exitosamente', count: updates.length };
    }
}
exports.EstadosActividadRepository = EstadosActividadRepository;
//# sourceMappingURL=estadosActividad.repository.js.map