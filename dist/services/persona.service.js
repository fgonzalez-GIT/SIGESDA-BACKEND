"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaService = void 0;
const logger_1 = require("@/utils/logger");
const error_middleware_1 = require("@/middleware/error.middleware");
const enums_1 = require("@/types/enums");
class PersonaService {
    constructor(personaRepository, personaTipoRepository) {
        this.personaRepository = personaRepository;
        this.personaTipoRepository = personaTipoRepository;
    }
    async createPersona(data) {
        const existingDni = await this.personaRepository.findByDni(data.dni);
        if (existingDni) {
            throw new error_middleware_1.AppError(`Ya existe una persona con DNI ${data.dni}`, enums_1.HttpStatus.CONFLICT);
        }
        if (data.email) {
            const existingEmail = await this.personaRepository.findByEmail(data.email);
            if (existingEmail) {
                throw new error_middleware_1.AppError(`Ya existe una persona con email ${data.email}`, enums_1.HttpStatus.CONFLICT);
            }
        }
        const tipos = data.tipos || [];
        if (tipos.length === 0) {
            tipos.push({
                tipoPersonaCodigo: 'NO_SOCIO'
            });
        }
        for (const tipo of tipos) {
            let tipoCodigo = tipo.tipoPersonaCodigo;
            if (!tipoCodigo && tipo.tipoPersonaId) {
                const tiposCatalogo = await this.personaTipoRepository.getTiposPersona(false);
                const tipoCatalogo = tiposCatalogo.find(t => t.id === tipo.tipoPersonaId);
                if (tipoCatalogo) {
                    tipoCodigo = tipoCatalogo.codigo;
                }
            }
            if (tipoCodigo === 'SOCIO') {
                if (!tipo.numeroSocio) {
                    const nextNumero = await this.personaTipoRepository.getNextNumeroSocio();
                    tipo.numeroSocio = nextNumero;
                }
                if (!tipo.categoriaId) {
                    tipo.categoriaId = 1;
                }
                if (!tipo.fechaIngreso) {
                    tipo.fechaIngreso = new Date().toISOString();
                }
            }
            if (tipoCodigo === 'DOCENTE') {
                if (!tipo.especialidadId) {
                    tipo.especialidadId = 1;
                }
            }
            if (tipoCodigo === 'PROVEEDOR') {
                if (!tipo.cuit || !tipo.razonSocial) {
                    throw new error_middleware_1.AppError('El tipo PROVEEDOR requiere CUIT y razón social', enums_1.HttpStatus.BAD_REQUEST);
                }
            }
        }
        const persona = await this.personaRepository.create({
            ...data,
            tipos,
            contactos: data.contactos || []
        });
        logger_1.logger.info(`Persona creada: ${persona.nombre} ${persona.apellido} (ID: ${persona.id})`);
        return persona;
    }
    async getPersonas(query) {
        const result = await this.personaRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            data: result.data,
            total: result.total,
            pages,
            page: query.page
        };
    }
    async getPersonaById(id, includeRelations = true) {
        const persona = await this.personaRepository.findById(id, includeRelations);
        if (!persona) {
            throw new error_middleware_1.AppError(`Persona con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        return persona;
    }
    async updatePersona(id, data) {
        const existingPersona = await this.personaRepository.findById(id, false);
        if (!existingPersona) {
            throw new error_middleware_1.AppError(`Persona con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        if (data.dni && data.dni !== existingPersona.dni) {
            const existingDni = await this.personaRepository.findByDni(data.dni);
            if (existingDni) {
                throw new error_middleware_1.AppError(`Ya existe una persona con DNI ${data.dni}`, enums_1.HttpStatus.CONFLICT);
            }
        }
        if (data.email && data.email !== existingPersona.email) {
            const existingEmail = await this.personaRepository.findByEmail(data.email);
            if (existingEmail) {
                throw new error_middleware_1.AppError(`Ya existe una persona con email ${data.email}`, enums_1.HttpStatus.CONFLICT);
            }
        }
        const updatedPersona = await this.personaRepository.update(id, data);
        logger_1.logger.info(`Persona actualizada: ${updatedPersona.nombre} ${updatedPersona.apellido} (ID: ${id})`);
        return updatedPersona;
    }
    async deletePersona(id, hard = false, motivo) {
        const existingPersona = await this.personaRepository.findById(id, false);
        if (!existingPersona) {
            throw new error_middleware_1.AppError(`Persona con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        let deletedPersona;
        if (hard) {
            deletedPersona = await this.personaRepository.hardDelete(id);
            logger_1.logger.info(`Persona eliminada (hard): ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
        }
        else {
            deletedPersona = await this.personaRepository.softDelete(id, motivo);
            logger_1.logger.info(`Persona desactivada (soft): ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
        }
        return deletedPersona;
    }
    async searchPersonas(searchTerm, tipoPersonaCodigo, limit = 20) {
        return this.personaRepository.search(searchTerm, tipoPersonaCodigo, limit);
    }
    async getSocios(params) {
        return this.personaRepository.getSocios(params);
    }
    async getDocentes(params) {
        return this.personaRepository.getDocentes(params);
    }
    async getProveedores(activos = true) {
        return this.personaRepository.getProveedores(activos);
    }
    async getPersonasByTipo(tipoPersonaCodigo, soloActivos = true) {
        return this.personaRepository.findByTipo(tipoPersonaCodigo, soloActivos);
    }
    async checkDniExists(dni) {
        const persona = await this.personaRepository.findByDni(dni);
        if (!persona) {
            return {
                exists: false,
                isActive: false,
                persona: null
            };
        }
        const isActive = await this.personaRepository.isActiva(persona.id);
        return {
            exists: true,
            isActive,
            persona
        };
    }
    async reactivatePersona(id, data) {
        const persona = await this.personaRepository.findById(id, true);
        if (!persona) {
            throw new error_middleware_1.AppError(`Persona con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        const isActive = await this.personaRepository.isActiva(id);
        if (isActive) {
            throw new error_middleware_1.AppError(`La persona con ID ${id} ya está activa`, enums_1.HttpStatus.BAD_REQUEST);
        }
        if (data) {
            await this.updatePersona(id, data);
        }
        await this.personaTipoRepository.asignarTipo(id, {
            tipoPersonaCodigo: 'NO_SOCIO'
        });
        const reactivatedPersona = await this.personaRepository.findById(id, true);
        logger_1.logger.info(`Persona reactivada: ${reactivatedPersona.nombre} ${reactivatedPersona.apellido} (ID: ${id})`);
        return reactivatedPersona;
    }
    async hasTipoActivo(personaId, tipoPersonaCodigo) {
        return this.personaRepository.hasTipoActivo(personaId, tipoPersonaCodigo);
    }
    async getEstadoPersona(personaId) {
        const tiposActivos = await this.personaRepository.countTiposActivos(personaId);
        const todosTipos = await this.personaTipoRepository.findByPersonaId(personaId, false);
        return {
            activa: tiposActivos > 0,
            tiposActivos,
            tiposInactivos: todosTipos.length - tiposActivos
        };
    }
}
exports.PersonaService = PersonaService;
//# sourceMappingURL=persona.service.js.map