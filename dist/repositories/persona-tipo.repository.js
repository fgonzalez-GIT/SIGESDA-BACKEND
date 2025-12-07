"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaTipoRepository = void 0;
class PersonaTipoRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async asignarTipo(personaId, data) {
        let tipoPersonaId = data.tipoPersonaId;
        if (!tipoPersonaId && data.tipoPersonaCodigo) {
            const tipoPersona = await this.prisma.tipoPersonaCatalogo.findUnique({
                where: { codigo: data.tipoPersonaCodigo }
            });
            if (!tipoPersona) {
                throw new Error(`Tipo de persona con código ${data.tipoPersonaCodigo} no encontrado`);
            }
            tipoPersonaId = tipoPersona.id;
        }
        if (!tipoPersonaId) {
            throw new Error('Debe proporcionar tipoPersonaId o tipoPersonaCodigo');
        }
        const createData = {
            personaId,
            tipoPersonaId,
            activo: data.activo ?? true,
            observaciones: data.observaciones
        };
        if (data.categoriaId)
            createData.categoriaId = data.categoriaId;
        if (data.numeroSocio)
            createData.numeroSocio = data.numeroSocio;
        if (data.fechaIngreso)
            createData.fechaIngreso = new Date(data.fechaIngreso);
        if (data.especialidadId)
            createData.especialidadId = data.especialidadId;
        if (data.honorariosPorHora)
            createData.honorariosPorHora = data.honorariosPorHora;
        if (data.cuit)
            createData.cuit = data.cuit;
        if (data.razonSocialId)
            createData.razonSocialId = data.razonSocialId;
        return this.prisma.personaTipo.create({
            data: createData,
            include: {
                tipoPersona: true,
                categoria: true,
                especialidad: true
            }
        });
    }
    async findByPersonaId(personaId, soloActivos = false) {
        const where = { personaId };
        if (soloActivos) {
            where.activo = true;
            where.fechaDesasignacion = null;
        }
        return this.prisma.personaTipo.findMany({
            where,
            include: {
                tipoPersona: true,
                categoria: true,
                especialidad: true
            },
            orderBy: {
                fechaAsignacion: 'desc'
            }
        });
    }
    async findByPersonaAndTipo(personaId, tipoPersonaId) {
        return this.prisma.personaTipo.findUnique({
            where: {
                personaId_tipoPersonaId: {
                    personaId,
                    tipoPersonaId
                }
            },
            include: {
                tipoPersona: true,
                categoria: true,
                especialidad: true
            }
        });
    }
    async updateTipo(id, data) {
        const updateData = {};
        if (data.activo !== undefined)
            updateData.activo = data.activo;
        if (data.fechaDesasignacion)
            updateData.fechaDesasignacion = new Date(data.fechaDesasignacion);
        if (data.observaciones !== undefined)
            updateData.observaciones = data.observaciones;
        if (data.categoriaId !== undefined)
            updateData.categoriaId = data.categoriaId;
        if (data.fechaIngreso)
            updateData.fechaIngreso = new Date(data.fechaIngreso);
        if (data.fechaBaja)
            updateData.fechaBaja = new Date(data.fechaBaja);
        if (data.motivoBaja !== undefined)
            updateData.motivoBaja = data.motivoBaja;
        if (data.especialidadId !== undefined)
            updateData.especialidadId = data.especialidadId;
        if (data.honorariosPorHora !== undefined)
            updateData.honorariosPorHora = data.honorariosPorHora;
        if (data.cuit !== undefined)
            updateData.cuit = data.cuit;
        if (data.razonSocialId !== undefined)
            updateData.razonSocialId = data.razonSocialId;
        return this.prisma.personaTipo.update({
            where: { id },
            data: updateData,
            include: {
                tipoPersona: true,
                categoria: true,
                especialidad: true
            }
        });
    }
    async desasignarTipo(id, fechaDesasignacion) {
        return this.prisma.personaTipo.update({
            where: { id },
            data: {
                activo: false,
                fechaDesasignacion: fechaDesasignacion || new Date()
            },
            include: {
                tipoPersona: true
            }
        });
    }
    async eliminarTipo(id) {
        return this.prisma.personaTipo.delete({
            where: { id }
        });
    }
    async tieneTipoActivo(personaId, tipoPersonaCodigo) {
        const count = await this.prisma.personaTipo.count({
            where: {
                personaId,
                activo: true,
                fechaDesasignacion: null,
                tipoPersona: {
                    codigo: tipoPersonaCodigo
                }
            }
        });
        return count > 0;
    }
    async getNextNumeroSocio() {
        const lastSocio = await this.prisma.personaTipo.findFirst({
            where: {
                numeroSocio: { not: null }
            },
            orderBy: {
                numeroSocio: 'desc'
            }
        });
        return (lastSocio?.numeroSocio || 0) + 1;
    }
    async getTiposPersona(soloActivos = true) {
        return this.prisma.tipoPersonaCatalogo.findMany({
            where: soloActivos ? { activo: true } : undefined,
            orderBy: { orden: 'asc' }
        });
    }
    async getTipoPersonaByCodigo(codigo) {
        return this.prisma.tipoPersonaCatalogo.findUnique({
            where: { codigo }
        });
    }
    async getEspecialidadesDocentes(soloActivas = true) {
        return this.prisma.especialidadDocente.findMany({
            where: soloActivas ? { activo: true } : undefined,
            orderBy: { orden: 'asc' }
        });
    }
    async getEspecialidadByCodigo(codigo) {
        return this.prisma.especialidadDocente.findUnique({
            where: { codigo }
        });
    }
    async getRazonesSociales(soloActivas = true) {
        return this.prisma.razonSocial.findMany({
            where: soloActivas ? { activo: true } : undefined,
            orderBy: { orden: 'asc' }
        });
    }
    async getRazonSocialByCodigo(codigo) {
        return this.prisma.razonSocial.findUnique({
            where: { codigo }
        });
    }
    async agregarContacto(personaId, data) {
        if (data.principal && data.tipoContactoId) {
            await this.prisma.contactoPersona.updateMany({
                where: {
                    personaId,
                    tipoContactoId: data.tipoContactoId,
                    principal: true
                },
                data: {
                    principal: false
                }
            });
        }
        return this.prisma.contactoPersona.create({
            data: {
                personaId,
                tipoContactoId: data.tipoContactoId,
                valor: data.valor,
                principal: data.principal ?? false,
                observaciones: data.observaciones,
                activo: data.activo ?? true
            }
        });
    }
    async findContactosByPersonaId(personaId, soloActivos = false) {
        return this.prisma.contactoPersona.findMany({
            where: {
                personaId,
                ...(soloActivos && { activo: true })
            },
            include: {
                tipoContacto: true
            },
            orderBy: [
                { principal: 'desc' },
                { tipoContacto: { orden: 'asc' } },
                { createdAt: 'desc' }
            ]
        });
    }
    async findContactoById(id) {
        return this.prisma.contactoPersona.findUnique({
            where: { id }
        });
    }
    async updateContacto(id, data) {
        const contacto = await this.findContactoById(id);
        if (!contacto) {
            throw new Error(`Contacto con ID ${id} no encontrado`);
        }
        if (data.principal) {
            const tipoId = data.tipoContactoId || contacto.tipoContactoId;
            await this.prisma.contactoPersona.updateMany({
                where: {
                    personaId: contacto.personaId,
                    tipoContactoId: tipoId,
                    principal: true,
                    id: { not: id }
                },
                data: {
                    principal: false
                }
            });
        }
        return this.prisma.contactoPersona.update({
            where: { id },
            data
        });
    }
    async eliminarContacto(id) {
        return this.prisma.contactoPersona.delete({
            where: { id }
        });
    }
    async getContactoPrincipal(personaId, tipoContacto) {
        return this.prisma.contactoPersona.findFirst({
            where: {
                personaId,
                tipoContacto: tipoContacto,
                principal: true,
                activo: true
            }
        });
    }
}
exports.PersonaTipoRepository = PersonaTipoRepository;
//# sourceMappingURL=persona-tipo.repository.js.map