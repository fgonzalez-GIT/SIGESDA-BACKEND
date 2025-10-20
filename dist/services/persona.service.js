"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
const error_middleware_1 = require("@/middleware/error.middleware");
const enums_1 = require("@/types/enums");
class PersonaService {
    constructor(personaRepository) {
        this.personaRepository = personaRepository;
    }
    addEstadoField(persona) {
        return {
            ...persona,
            estado: persona.fechaBaja === null ? 'activo' : 'inactivo'
        };
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
        if (data.tipo === client_1.TipoPersona.SOCIO && !data.numeroSocio) {
            const nextNumero = await this.personaRepository.getNextNumeroSocio();
            data.numeroSocio = nextNumero;
        }
        const persona = await this.personaRepository.create(data);
        logger_1.logger.info(`Persona created: ${persona.tipo} - ${persona.nombre} ${persona.apellido} (ID: ${persona.id})`);
        return this.addEstadoField(persona);
    }
    async getPersonas(query) {
        const result = await this.personaRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            data: result.data.map(p => this.addEstadoField(p)),
            total: result.total,
            pages
        };
    }
    async getPersonaById(id) {
        const persona = await this.personaRepository.findById(id);
        return persona ? this.addEstadoField(persona) : null;
    }
    async updatePersona(id, data) {
        const existingPersona = await this.personaRepository.findById(id);
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
        logger_1.logger.info(`Persona updated: ${updatedPersona.nombre} ${updatedPersona.apellido} (ID: ${id})`);
        return this.addEstadoField(updatedPersona);
    }
    async deletePersona(id, hard = false, motivo) {
        const existingPersona = await this.personaRepository.findById(id);
        if (!existingPersona) {
            throw new error_middleware_1.AppError(`Persona con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        let deletedPersona;
        if (hard) {
            deletedPersona = await this.personaRepository.hardDelete(id);
            logger_1.logger.info(`Persona hard deleted: ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
        }
        else {
            deletedPersona = await this.personaRepository.softDelete(id, motivo);
            logger_1.logger.info(`Persona soft deleted: ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
        }
        return this.addEstadoField(deletedPersona);
    }
    async getSocios(categoria, activos = true) {
        return this.personaRepository.getSocios(categoria, activos);
    }
    async getDocentes() {
        const result = await this.personaRepository.findAll({
            tipo: client_1.TipoPersona.DOCENTE,
            page: 1,
            limit: 100
        });
        return result.data;
    }
    async getProveedores() {
        const result = await this.personaRepository.findAll({
            tipo: client_1.TipoPersona.PROVEEDOR,
            page: 1,
            limit: 100
        });
        return result.data;
    }
    async searchPersonas(searchTerm, tipo) {
        const result = await this.personaRepository.findAll({
            search: searchTerm,
            tipo,
            page: 1,
            limit: 20
        });
        return result.data;
    }
    async checkDniExists(dni) {
        const persona = await this.personaRepository.findByDni(dni);
        if (!persona) {
            return {
                exists: false,
                isInactive: false,
                persona: null
            };
        }
        const isInactive = persona.fechaBaja !== null;
        return {
            exists: true,
            isInactive,
            persona
        };
    }
    async reactivatePersona(id, data) {
        const existingPersona = await this.personaRepository.findById(id);
        if (!existingPersona) {
            throw new error_middleware_1.AppError(`Persona con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        if (existingPersona.fechaBaja === null) {
            throw new error_middleware_1.AppError(`La persona con ID ${id} ya tiene estado activo`, enums_1.HttpStatus.BAD_REQUEST);
        }
        if (data.dni && data.dni !== existingPersona.dni) {
            throw new error_middleware_1.AppError('El DNI no coincide con el registro', enums_1.HttpStatus.BAD_REQUEST);
        }
        if (data.email && data.email !== existingPersona.email) {
            const existingEmail = await this.personaRepository.findByEmail(data.email);
            if (existingEmail && existingEmail.id !== id) {
                throw new error_middleware_1.AppError(`Ya existe una persona con email ${data.email}`, enums_1.HttpStatus.CONFLICT);
            }
        }
        const updateData = {
            ...data,
            fechaBaja: null,
            motivoBaja: null
        };
        if (data.tipo === client_1.TipoPersona.SOCIO && !existingPersona.fechaIngreso) {
            updateData.fechaIngreso = new Date();
        }
        if (data.tipo === client_1.TipoPersona.SOCIO && !existingPersona.numeroSocio) {
            const nextNumero = await this.personaRepository.getNextNumeroSocio();
            updateData.numeroSocio = nextNumero;
        }
        const reactivatedPersona = await this.personaRepository.update(id, updateData);
        logger_1.logger.info(`Persona reactivated: ${reactivatedPersona.nombre} ${reactivatedPersona.apellido} (ID: ${id})`);
        return reactivatedPersona;
    }
}
exports.PersonaService = PersonaService;
//# sourceMappingURL=persona.service.js.map