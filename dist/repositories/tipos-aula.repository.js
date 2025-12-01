"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposAulaRepository = void 0;
class TiposAulaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.tipoAula.findUnique({
            where: { codigo: data.codigo }
        });
        if (existing) {
            throw new Error(`Ya existe un tipo de aula con código: ${data.codigo}`);
        }
        let orden = data.orden;
        if (!orden || orden === 0) {
            const maxOrden = await this.prisma.tipoAula.findFirst({
                select: { orden: true },
                orderBy: { orden: 'desc' }
            });
            orden = (maxOrden?.orden ?? 0) + 1;
        }
        return this.prisma.tipoAula.create({
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
        return this.prisma.tipoAula.findMany({
            where,
            orderBy,
            include: {
                _count: {
                    select: { aulas: true }
                }
            }
        });
    }
    async findById(id) {
        const tipo = await this.prisma.tipoAula.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { aulas: true }
                }
            }
        });
        if (!tipo) {
            throw new Error(`Tipo de aula con ID ${id} no encontrado`);
        }
        return tipo;
    }
    async findByCodigo(codigo) {
        return this.prisma.tipoAula.findUnique({
            where: { codigo }
        });
    }
    async update(id, data) {
        await this.findById(id);
        if (data.codigo) {
            const existing = await this.prisma.tipoAula.findFirst({
                where: {
                    codigo: data.codigo,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new Error(`Ya existe un tipo de aula con código: ${data.codigo}`);
            }
        }
        return this.prisma.tipoAula.update({
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
        const aulasActivas = await this.prisma.aula.count({
            where: {
                tipoAulaId: id,
                activa: true
            }
        });
        if (aulasActivas > 0) {
            throw new Error(`No se puede desactivar el tipo "${tipo.nombre}" porque tiene ${aulasActivas} aula(s) activa(s)`);
        }
        return this.prisma.tipoAula.update({
            where: { id },
            data: { activo: false }
        });
    }
    async reorder(data) {
        const updates = data.ids.map((id, index) => this.prisma.tipoAula.update({
            where: { id },
            data: { orden: index + 1 }
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Orden actualizado exitosamente', count: updates.length };
    }
}
exports.TiposAulaRepository = TiposAulaRepository;
//# sourceMappingURL=tipos-aula.repository.js.map