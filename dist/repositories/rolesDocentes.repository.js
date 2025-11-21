"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesDocentesRepository = void 0;
class RolesDocentesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.roles_docentes.findUnique({
            where: { codigo: data.codigo }
        });
        if (existing) {
            throw new Error(`Ya existe un rol de docente con código: ${data.codigo}`);
        }
        let orden = data.orden;
        if (!orden || orden === 0) {
            const maxOrden = await this.prisma.roles_docentes.findFirst({
                select: { orden: true },
                orderBy: { orden: 'desc' }
            });
            orden = (maxOrden?.orden ?? 0) + 1;
        }
        return this.prisma.roles_docentes.create({
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
        return this.prisma.roles_docentes.findMany({
            where,
            orderBy,
            include: {
                _count: {
                    select: { docentes_actividades: true }
                }
            }
        });
    }
    async findById(id) {
        const rol = await this.prisma.roles_docentes.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { docentes_actividades: true }
                }
            }
        });
        if (!rol) {
            throw new Error(`Rol de docente con ID ${id} no encontrado`);
        }
        return rol;
    }
    async update(id, data) {
        await this.findById(id);
        if (data.codigo) {
            const existing = await this.prisma.roles_docentes.findFirst({
                where: {
                    codigo: data.codigo,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new Error(`Ya existe un rol de docente con código: ${data.codigo}`);
            }
        }
        return this.prisma.roles_docentes.update({
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
        const rol = await this.findById(id);
        const asignacionesActivas = await this.prisma.docentes_actividades.count({
            where: {
                rolDocenteId: id,
                activo: true
            }
        });
        if (asignacionesActivas > 0) {
            throw new Error(`No se puede desactivar el rol "${rol.nombre}" porque tiene ${asignacionesActivas} asignación(es) activa(s)`);
        }
        return this.prisma.roles_docentes.update({
            where: { id },
            data: { activo: false }
        });
    }
    async reorder(data) {
        const updates = data.ids.map((id, index) => this.prisma.roles_docentes.update({
            where: { id },
            data: { orden: index + 1 }
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Orden actualizado exitosamente', count: updates.length };
    }
}
exports.RolesDocentesRepository = RolesDocentesRepository;
//# sourceMappingURL=rolesDocentes.repository.js.map