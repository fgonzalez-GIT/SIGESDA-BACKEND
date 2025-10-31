"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamiliarService = void 0;
const client_1 = require("@prisma/client");
const enums_1 = require("@/types/enums");
const logger_1 = require("@/utils/logger");
class FamiliarService {
    constructor(familiarRepository, personaRepository) {
        this.familiarRepository = familiarRepository;
        this.personaRepository = personaRepository;
    }
    async createFamiliar(data) {
        const [socio, familiar] = await Promise.all([
            this.personaRepository.findById(data.socioId),
            this.personaRepository.findById(data.familiarId)
        ]);
        if (!socio) {
            throw new Error(`Socio con ID ${data.socioId} no encontrado`);
        }
        if (!familiar) {
            throw new Error(`Familiar con ID ${data.familiarId} no encontrado`);
        }
        logger_1.logger.info(`Creando relación familiar entre ${socio.nombre} ${socio.apellido} (${socio.tipo}) y ${familiar.nombre} ${familiar.apellido} (${familiar.tipo})`);
        if (socio.fechaBaja) {
            throw new Error(`La persona ${socio.nombre} ${socio.apellido} está dado de baja`);
        }
        if (familiar.fechaBaja) {
            throw new Error(`La persona ${familiar.nombre} ${familiar.apellido} está dado de baja`);
        }
        const existingRelation = await this.familiarRepository.findExistingRelation(data.socioId, data.familiarId);
        if (existingRelation) {
            throw new Error(`Ya existe una relación familiar entre ${socio.nombre} ${socio.apellido} y ${familiar.nombre} ${familiar.apellido}`);
        }
        this.validateParentesco(data.parentesco, socio, familiar);
        if (data.descuento && (data.descuento < 0 || data.descuento > 100)) {
            throw new Error('El descuento debe estar entre 0 y 100');
        }
        const relacion = await this.familiarRepository.create(data);
        logger_1.logger.info(`Relación familiar creada: ${socio.nombre} ${socio.apellido} - ${data.parentesco} - ${familiar.nombre} ${familiar.apellido} (ID: ${relacion.id}, Descuento: ${data.descuento || 0}%)`);
        return relacion;
    }
    async getFamiliares(query) {
        const result = await this.familiarRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            ...result,
            pages
        };
    }
    async getFamiliarById(id) {
        return this.familiarRepository.findById(id);
    }
    async getFamiliarsBySocio(socioId, includeInactivos = false) {
        const persona = await this.personaRepository.findById(socioId);
        if (!persona) {
            throw new Error(`Persona con ID ${socioId} no encontrada`);
        }
        return this.familiarRepository.findBySocioId(socioId, includeInactivos);
    }
    async updateFamiliar(id, data) {
        const existingRelacion = await this.familiarRepository.findById(id);
        if (!existingRelacion) {
            throw new Error(`Relación familiar con ID ${id} no encontrada`);
        }
        if (data.parentesco) {
            this.validateParentesco(data.parentesco, existingRelacion.socio, existingRelacion.familiar);
        }
        if (data.descuento !== undefined && (data.descuento < 0 || data.descuento > 100)) {
            throw new Error('El descuento debe estar entre 0 y 100');
        }
        const updatedRelacion = await this.familiarRepository.update(id, data);
        logger_1.logger.info(`Relación familiar actualizada: ID ${id} - Cambios: ${JSON.stringify(data)}`);
        return updatedRelacion;
    }
    async deleteFamiliar(id) {
        const existingRelacion = await this.familiarRepository.findById(id);
        if (!existingRelacion) {
            throw new Error(`Relación familiar con ID ${id} no encontrada`);
        }
        const deletedRelacion = await this.familiarRepository.delete(id);
        logger_1.logger.info(`Relación familiar eliminada: ${existingRelacion.socio.nombre} ${existingRelacion.socio.apellido} - ${existingRelacion.parentesco} - ${existingRelacion.familiar.nombre} ${existingRelacion.familiar.apellido}`);
        return deletedRelacion;
    }
    async createBulkFamiliares(data) {
        const errors = [];
        const validFamiliares = [];
        for (const familiar of data.familiares) {
            try {
                const [socio, familiarPerson] = await Promise.all([
                    this.personaRepository.findById(familiar.socioId),
                    this.personaRepository.findById(familiar.familiarId)
                ]);
                if (!socio || socio.fechaBaja) {
                    errors.push(`Persona ${familiar.socioId} no encontrada o inactiva`);
                    continue;
                }
                if (!familiarPerson || familiarPerson.fechaBaja) {
                    errors.push(`Persona ${familiar.familiarId} no encontrada o inactiva`);
                    continue;
                }
                const isSocioRelation = socio.tipo === enums_1.TipoPersona.SOCIO || familiarPerson.tipo === enums_1.TipoPersona.SOCIO;
                if (!isSocioRelation) {
                    errors.push(`Al menos una de las personas debe ser un socio (${familiar.socioId} y ${familiar.familiarId})`);
                    continue;
                }
                const existing = await this.familiarRepository.findExistingRelation(familiar.socioId, familiar.familiarId);
                if (existing) {
                    errors.push(`Relación ya existe entre ${socio.nombre} ${socio.apellido} y ${familiarPerson.nombre} ${familiarPerson.apellido}`);
                    continue;
                }
                validFamiliares.push(familiar);
            }
            catch (error) {
                errors.push(`Error validando relación ${familiar.socioId}-${familiar.familiarId}: ${error}`);
            }
        }
        const result = validFamiliares.length > 0
            ? await this.familiarRepository.createBulk(validFamiliares)
            : { count: 0 };
        logger_1.logger.info(`Creación masiva de familiares: ${result.count} creados, ${errors.length} errores`);
        return {
            count: result.count,
            errors
        };
    }
    async deleteBulkFamiliares(data) {
        const result = await this.familiarRepository.deleteBulk(data.ids);
        logger_1.logger.info(`Eliminación masiva de familiares: ${result.count} eliminados`);
        return result;
    }
    async searchFamiliares(searchData) {
        return this.familiarRepository.search(searchData);
    }
    async getParentescoStats() {
        return this.familiarRepository.getParentescoStats();
    }
    async getFamilyTree(socioId) {
        const persona = await this.personaRepository.findById(socioId);
        if (!persona) {
            throw new Error(`Persona con ID ${socioId} no encontrada`);
        }
        const familyTree = await this.familiarRepository.getFamilyTree(socioId);
        return {
            ...familyTree,
            persona: {
                id: persona.id,
                tipo: persona.tipo,
                nombre: persona.nombre,
                apellido: persona.apellido,
                dni: persona.dni,
                numeroSocio: persona.numeroSocio
            }
        };
    }
    async getTiposParentesco() {
        return Object.values(client_1.TipoParentesco);
    }
    validateParentesco(parentesco, socio, familiar) {
        if (socio.fechaNacimiento && familiar.fechaNacimiento) {
            const socioAge = new Date().getFullYear() - new Date(socio.fechaNacimiento).getFullYear();
            const familiarAge = new Date().getFullYear() - new Date(familiar.fechaNacimiento).getFullYear();
            if ((parentesco === client_1.TipoParentesco.HIJO || parentesco === client_1.TipoParentesco.HIJA) && familiarAge >= socioAge) {
                logger_1.logger.warn(`Advertencia: Se está estableciendo como ${parentesco} a una persona de edad similar o mayor`);
            }
            if ((parentesco === client_1.TipoParentesco.PADRE || parentesco === client_1.TipoParentesco.MADRE) && familiarAge <= socioAge) {
                logger_1.logger.warn(`Advertencia: Se está estableciendo como ${parentesco} a una persona de edad similar o menor`);
            }
        }
    }
}
exports.FamiliarService = FamiliarService;
//# sourceMappingURL=familiar.service.js.map