"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamiliarService = void 0;
const client_1 = require("@prisma/client");
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
        if (socio.tipo !== client_1.TipoPersona.SOCIO) {
            throw new Error(`La persona ${socio.nombre} ${socio.apellido} no es un socio`);
        }
        if (familiar.tipo !== client_1.TipoPersona.SOCIO) {
            throw new Error(`La persona ${familiar.nombre} ${familiar.apellido} no es un socio`);
        }
        if (socio.fechaBaja) {
            throw new Error(`El socio ${socio.nombre} ${socio.apellido} está dado de baja`);
        }
        if (familiar.fechaBaja) {
            throw new Error(`El socio ${familiar.nombre} ${familiar.apellido} está dado de baja`);
        }
        const existingRelation = await this.familiarRepository.findExistingRelation(data.socioId, data.familiarId);
        if (existingRelation) {
            throw new Error(`Ya existe una relación familiar entre ${socio.nombre} ${socio.apellido} y ${familiar.nombre} ${familiar.apellido}`);
        }
        this.validateParentesco(data.parentesco, socio, familiar);
        const relacion = await this.familiarRepository.create(data);
        logger_1.logger.info(`Relación familiar creada: ${socio.nombre} ${socio.apellido} - ${data.parentesco} - ${familiar.nombre} ${familiar.apellido} (ID: ${relacion.id})`);
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
        const socio = await this.personaRepository.findById(socioId);
        if (!socio) {
            throw new Error(`Socio con ID ${socioId} no encontrado`);
        }
        if (socio.tipo !== client_1.TipoPersona.SOCIO) {
            throw new Error(`La persona ${socio.nombre} ${socio.apellido} no es un socio`);
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
        const updatedRelacion = await this.familiarRepository.update(id, data);
        logger_1.logger.info(`Relación familiar actualizada: ID ${id} - Nuevo parentesco: ${data.parentesco || 'sin cambios'}`);
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
                if (!socio || socio.tipo !== client_1.TipoPersona.SOCIO || socio.fechaBaja) {
                    errors.push(`Socio ${familiar.socioId} inválido o inactivo`);
                    continue;
                }
                if (!familiarPerson || familiarPerson.tipo !== client_1.TipoPersona.SOCIO || familiarPerson.fechaBaja) {
                    errors.push(`Familiar ${familiar.familiarId} inválido o inactivo`);
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
        const socio = await this.personaRepository.findById(socioId);
        if (!socio) {
            throw new Error(`Socio con ID ${socioId} no encontrado`);
        }
        if (socio.tipo !== client_1.TipoPersona.SOCIO) {
            throw new Error(`La persona ${socio.nombre} ${socio.apellido} no es un socio`);
        }
        const familyTree = await this.familiarRepository.getFamilyTree(socioId);
        return {
            ...familyTree,
            socio: {
                id: socio.id,
                nombre: socio.nombre,
                apellido: socio.apellido,
                dni: socio.dni,
                numeroSocio: socio.numeroSocio
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