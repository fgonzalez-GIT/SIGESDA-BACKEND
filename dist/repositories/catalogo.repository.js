"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogoRepository = void 0;
class CatalogoRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTipoPersona(data) {
        return this.prisma.tipoPersonaCatalogo.create({
            data: {
                codigo: data.codigo,
                nombre: data.nombre,
                descripcion: data.descripcion,
                activo: data.activo ?? true,
                orden: data.orden ?? 0
            }
        });
    }
    async getTipoPersonaById(id) {
        return this.prisma.tipoPersonaCatalogo.findUnique({
            where: { id }
        });
    }
    async getTipoPersonaByCodigo(codigo) {
        return this.prisma.tipoPersonaCatalogo.findUnique({
            where: { codigo }
        });
    }
    async updateTipoPersona(id, data) {
        return this.prisma.tipoPersonaCatalogo.update({
            where: { id },
            data
        });
    }
    async deleteTipoPersona(id) {
        return this.prisma.tipoPersonaCatalogo.delete({
            where: { id }
        });
    }
    async toggleActivoTipoPersona(id, activo) {
        return this.prisma.tipoPersonaCatalogo.update({
            where: { id },
            data: { activo }
        });
    }
    async countPersonasConTipo(tipoPersonaId, soloActivos = true) {
        return this.prisma.personaTipo.count({
            where: {
                tipoPersonaId,
                ...(soloActivos && {
                    activo: true,
                    fechaDesasignacion: null
                })
            }
        });
    }
    async getAllTiposPersonaWithStats() {
        return this.prisma.tipoPersonaCatalogo.findMany({
            include: {
                _count: {
                    select: {
                        personasTipo: {
                            where: {
                                activo: true,
                                fechaDesasignacion: null
                            }
                        }
                    }
                }
            },
            orderBy: { orden: 'asc' }
        });
    }
    async createEspecialidad(data) {
        return this.prisma.especialidadDocente.create({
            data: {
                codigo: data.codigo,
                nombre: data.nombre,
                descripcion: data.descripcion,
                activo: data.activo ?? true,
                orden: data.orden ?? 0
            }
        });
    }
    async getEspecialidadById(id) {
        return this.prisma.especialidadDocente.findUnique({
            where: { id }
        });
    }
    async getEspecialidadByCodigo(codigo) {
        return this.prisma.especialidadDocente.findUnique({
            where: { codigo }
        });
    }
    async updateEspecialidad(id, data) {
        return this.prisma.especialidadDocente.update({
            where: { id },
            data
        });
    }
    async deleteEspecialidad(id) {
        return this.prisma.especialidadDocente.delete({
            where: { id }
        });
    }
    async toggleActivoEspecialidad(id, activo) {
        return this.prisma.especialidadDocente.update({
            where: { id },
            data: { activo }
        });
    }
    async countDocentesConEspecialidad(especialidadId, soloActivos = true) {
        return this.prisma.personaTipo.count({
            where: {
                especialidadId,
                ...(soloActivos && {
                    activo: true,
                    fechaDesasignacion: null
                }),
                tipoPersona: {
                    codigo: 'DOCENTE'
                }
            }
        });
    }
    async getAllEspecialidadesWithStats() {
        return this.prisma.especialidadDocente.findMany({
            include: {
                _count: {
                    select: {
                        personaTipos: {
                            where: {
                                activo: true,
                                fechaDesasignacion: null,
                                tipoPersona: {
                                    codigo: 'DOCENTE'
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { orden: 'asc' }
        });
    }
}
exports.CatalogoRepository = CatalogoRepository;
//# sourceMappingURL=catalogo.repository.js.map