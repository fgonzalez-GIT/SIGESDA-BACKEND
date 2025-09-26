"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
class PersonaService {
    constructor(personaRepository) {
        this.personaRepository = personaRepository;
    }
    async createPersona(data) {
        const existingDni = await this.personaRepository.findByDni(data.dni);
        if (existingDni) {
            throw new Error(`Ya existe una persona con DNI ${data.dni}`);
        }
        if (data.email) {
            const existingEmail = await this.personaRepository.findByEmail(data.email);
            if (existingEmail) {
                throw new Error(`Ya existe una persona con email ${data.email}`);
            }
        }
        if (data.tipo === client_1.TipoPersona.SOCIO && !data.numeroSocio) {
            const nextNumero = await this.personaRepository.getNextNumeroSocio();
            data.numeroSocio = nextNumero;
        }
        const persona = await this.personaRepository.create(data);
        logger_1.logger.info(`Persona created: ${persona.tipo} - ${persona.nombre} ${persona.apellido} (ID: ${persona.id})`);
        return persona;
    }
    async getPersonas(query) {
        const result = await this.personaRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            ...result,
            pages
        };
    }
    async getPersonaById(id) {
        return this.personaRepository.findById(id);
    }
    async updatePersona(id, data) {
        const existingPersona = await this.personaRepository.findById(id);
        if (!existingPersona) {
            throw new Error(`Persona con ID ${id} no encontrada`);
        }
        if (data.dni && data.dni !== existingPersona.dni) {
            const existingDni = await this.personaRepository.findByDni(data.dni);
            if (existingDni) {
                throw new Error(`Ya existe una persona con DNI ${data.dni}`);
            }
        }
        if (data.email && data.email !== existingPersona.email) {
            const existingEmail = await this.personaRepository.findByEmail(data.email);
            if (existingEmail) {
                throw new Error(`Ya existe una persona con email ${data.email}`);
            }
        }
        const updatedPersona = await this.personaRepository.update(id, data);
        logger_1.logger.info(`Persona updated: ${updatedPersona.nombre} ${updatedPersona.apellido} (ID: ${id})`);
        return updatedPersona;
    }
    async deletePersona(id, hard = false, motivo) {
        const existingPersona = await this.personaRepository.findById(id);
        if (!existingPersona) {
            throw new Error(`Persona con ID ${id} no encontrada`);
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
        return deletedPersona;
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
}
exports.PersonaService = PersonaService;
//# sourceMappingURL=persona.service.js.map