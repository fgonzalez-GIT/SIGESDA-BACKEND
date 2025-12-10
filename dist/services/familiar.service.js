"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamiliarService = void 0;
const client_1 = require("@prisma/client");
const enums_1 = require("@/types/enums");
const logger_1 = require("@/utils/logger");
const parentesco_helper_1 = require("@/utils/parentesco.helper");
class FamiliarService {
    constructor(familiarRepository, personaRepository) {
        this.familiarRepository = familiarRepository;
        this.personaRepository = personaRepository;
    }
    async createFamiliar(data) {
        const [personaA, personaB] = await Promise.all([
            this.personaRepository.findById(data.socioId),
            this.personaRepository.findById(data.familiarId)
        ]);
        if (!personaA) {
            throw new Error(`Persona con ID ${data.socioId} no encontrada`);
        }
        if (!personaB) {
            throw new Error(`Persona con ID ${data.familiarId} no encontrada`);
        }
        if (data.socioId === data.familiarId) {
            throw new Error('Una persona no puede tener una relación familiar consigo misma');
        }
        logger_1.logger.info(`Creando relación familiar BIDIRECCIONAL entre ${personaA.nombre} ${personaA.apellido} (${personaA.tipo}) y ${personaB.nombre} ${personaB.apellido} (${personaB.tipo})`);
        if (personaA.fechaBaja) {
            throw new Error(`La persona ${personaA.nombre} ${personaA.apellido} está dada de baja`);
        }
        if (personaB.fechaBaja) {
            throw new Error(`La persona ${personaB.nombre} ${personaB.apellido} está dada de baja`);
        }
        const existingRelationAB = await this.familiarRepository.findExistingRelation(data.socioId, data.familiarId);
        const existingRelationBA = await this.familiarRepository.findExistingRelation(data.familiarId, data.socioId);
        if (existingRelationAB || existingRelationBA) {
            throw new Error(`Ya existe una relación familiar entre ${personaA.nombre} ${personaA.apellido} y ${personaB.nombre} ${personaB.apellido}`);
        }
        this.validateParentesco(data.parentesco, personaA, personaB);
        if (data.descuento && (data.descuento < 0 || data.descuento > 100)) {
            throw new Error('El descuento debe estar entre 0 y 100');
        }
        const validacionA = (0, parentesco_helper_1.validateParentescoGenero)(data.parentesco, personaA.genero);
        if (validacionA.warning) {
            logger_1.logger.warn(`⚠️  ${validacionA.warning} - Persona: ${personaA.nombre} ${personaA.apellido} (ID: ${personaA.id})`);
        }
        const parentescoComplementario = (0, parentesco_helper_1.getParentescoComplementarioConGenero)(data.parentesco, personaA.genero);
        const gradoParentesco = (0, parentesco_helper_1.getGradoParentesco)(data.parentesco);
        const validacionB = (0, parentesco_helper_1.validateParentescoGenero)(parentescoComplementario, personaA.genero);
        if (validacionB.warning) {
            logger_1.logger.warn(`⚠️  ${validacionB.warning} - Persona: ${personaB.nombre} ${personaB.apellido} (ID: ${personaB.id})`);
        }
        logger_1.logger.info(`   🧬 Género persona A (${personaA.nombre}): ${personaA.genero || 'NO_ESPECIFICADO'}`);
        logger_1.logger.info(`   🧬 Género persona B (${personaB.nombre}): ${personaB.genero || 'NO_ESPECIFICADO'}`);
        logger_1.logger.info(`   🔗 Parentesco complementario calculado: ${parentescoComplementario} (basado en género de persona A)`);
        const relacionPrincipal = await this.familiarRepository.create(data);
        const relacionInversa = await this.familiarRepository.create({
            socioId: data.familiarId,
            familiarId: data.socioId,
            parentesco: parentescoComplementario,
            descuento: data.descuento || 0,
            permisoResponsableFinanciero: data.permisoResponsableFinanciero || false,
            permisoContactoEmergencia: data.permisoContactoEmergencia || false,
            permisoAutorizadoRetiro: data.permisoAutorizadoRetiro || false,
            descripcion: data.descripcion
                ? `${data.descripcion} [Relación complementaria de ID ${relacionPrincipal.id}]`
                : `Relación complementaria automática de ID ${relacionPrincipal.id}`,
            grupoFamiliarId: data.grupoFamiliarId
        });
        const descripcionBidireccional = (0, parentesco_helper_1.getRelacionBidireccionalDescripcion)(`${personaA.nombre} ${personaA.apellido}`, data.parentesco, `${personaB.nombre} ${personaB.apellido}`);
        const tieneSocios = personaA.tipo === 'SOCIO' || personaB.tipo === 'SOCIO';
        const logPrefix = tieneSocios ? '💰' : '👥';
        logger_1.logger.info(`${logPrefix} Relación familiar bidireccional creada: ${descripcionBidireccional}`);
        logger_1.logger.info(`   ➤ Relación A→B (ID: ${relacionPrincipal.id}): ${personaA.nombre} [${personaA.tipo}] → ${data.parentesco} → ${personaB.nombre} [${personaB.tipo}]`);
        logger_1.logger.info(`   ➤ Relación B→A (ID: ${relacionInversa.id}): ${personaB.nombre} [${personaB.tipo}] → ${parentescoComplementario} → ${personaA.nombre} [${personaA.tipo}]`);
        logger_1.logger.info(`   ➤ Grado: ${gradoParentesco}`);
        if (tieneSocios) {
            logger_1.logger.info(`   💰 NOTA: Relación involucra SOCIO(S) - Aplicable para beneficios de cuota familiar`);
            if (data.descuento && data.descuento > 0) {
                logger_1.logger.info(`   💰 Descuento familiar aplicado: ${data.descuento}%`);
            }
            if (data.grupoFamiliarId) {
                logger_1.logger.info(`   💰 Grupo familiar asignado: ${data.grupoFamiliarId}`);
            }
        }
        return relacionPrincipal;
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
        const relacionInversa = await this.familiarRepository.findInverseRelation(id);
        const updatedRelacion = await this.familiarRepository.update(id, data);
        if (relacionInversa) {
            const updateDataInversa = {};
            if (data.descuento !== undefined) {
                updateDataInversa.descuento = data.descuento;
            }
            if (data.permisoResponsableFinanciero !== undefined) {
                updateDataInversa.permisoResponsableFinanciero = data.permisoResponsableFinanciero;
            }
            if (data.permisoContactoEmergencia !== undefined) {
                updateDataInversa.permisoContactoEmergencia = data.permisoContactoEmergencia;
            }
            if (data.permisoAutorizadoRetiro !== undefined) {
                updateDataInversa.permisoAutorizadoRetiro = data.permisoAutorizadoRetiro;
            }
            if (data.grupoFamiliarId !== undefined) {
                updateDataInversa.grupoFamiliarId = data.grupoFamiliarId;
            }
            if (data.activo !== undefined) {
                updateDataInversa.activo = data.activo;
            }
            if (data.parentesco) {
                const personaA = await this.personaRepository.findById(existingRelacion.socioId);
                const personaB = await this.personaRepository.findById(existingRelacion.familiarId);
                if (personaA && personaB) {
                    const validacionA = (0, parentesco_helper_1.validateParentescoGenero)(data.parentesco, personaA.genero);
                    if (validacionA.warning) {
                        logger_1.logger.warn(`⚠️  ${validacionA.warning} - Persona: ${personaA.nombre} ${personaA.apellido} (ID: ${personaA.id})`);
                    }
                    const parentescoComplementario = (0, parentesco_helper_1.getParentescoComplementarioConGenero)(data.parentesco, personaA.genero);
                    updateDataInversa.parentesco = parentescoComplementario;
                    const validacionB = (0, parentesco_helper_1.validateParentescoGenero)(parentescoComplementario, personaA.genero);
                    if (validacionB.warning) {
                        logger_1.logger.warn(`⚠️  ${validacionB.warning} - Persona: ${personaA.nombre} ${personaA.apellido} (ID: ${personaA.id})`);
                    }
                    logger_1.logger.info(`   🔗 Parentesco complementario actualizado: ${parentescoComplementario} (basado en género de persona A: ${personaA.genero || 'NO_ESPECIFICADO'})`);
                }
                else {
                    updateDataInversa.parentesco = (0, parentesco_helper_1.getParentescoComplementario)(data.parentesco);
                    logger_1.logger.warn(`⚠️  No se pudo obtener género de personas - Usando lógica de parentesco sin género`);
                }
            }
            if (data.descripcion !== undefined) {
                updateDataInversa.descripcion = data.descripcion
                    ? `${data.descripcion} [Relación complementaria de ID ${id}]`
                    : `Relación complementaria automática de ID ${id}`;
            }
            await this.familiarRepository.update(relacionInversa.id, updateDataInversa);
            logger_1.logger.info(`✅ Relación familiar actualizada BIDIRECCIONALMENTE: ID ${id} ↔ ID ${relacionInversa.id}`);
            logger_1.logger.info(`   Cambios sincronizados: ${JSON.stringify(data)}`);
        }
        else {
            logger_1.logger.warn(`⚠️  Relación inversa no encontrada para ID ${id} - Actualización NO sincronizada`);
            logger_1.logger.info(`Relación familiar actualizada: ID ${id} - Cambios: ${JSON.stringify(data)}`);
        }
        return updatedRelacion;
    }
    async deleteFamiliar(id) {
        const existingRelacion = await this.familiarRepository.findById(id);
        if (!existingRelacion) {
            throw new Error(`Relación familiar con ID ${id} no encontrada`);
        }
        const relacionInversa = await this.familiarRepository.findInverseRelation(id);
        let relacionInversaInfo = null;
        if (relacionInversa) {
            relacionInversaInfo = {
                id: relacionInversa.id,
                socioNombre: relacionInversa.socio?.nombre || 'N/A',
                socioApellido: relacionInversa.socio?.apellido || 'N/A',
                parentesco: relacionInversa.parentesco,
                familiarNombre: relacionInversa.familiar?.nombre || 'N/A',
                familiarApellido: relacionInversa.familiar?.apellido || 'N/A'
            };
        }
        const deletedRelacion = await this.familiarRepository.delete(id);
        if (relacionInversa) {
            await this.familiarRepository.delete(relacionInversa.id);
            logger_1.logger.info(`✅ Relación familiar eliminada BIDIRECCIONALMENTE:`);
            logger_1.logger.info(`   ➤ Relación A→B (ID: ${id}): ${existingRelacion.socio?.nombre || 'N/A'} ${existingRelacion.socio?.apellido || 'N/A'} → ${existingRelacion.parentesco} → ${existingRelacion.familiar?.nombre || 'N/A'} ${existingRelacion.familiar?.apellido || 'N/A'}`);
            if (relacionInversaInfo) {
                logger_1.logger.info(`   ➤ Relación B→A (ID: ${relacionInversaInfo.id}): ${relacionInversaInfo.socioNombre} ${relacionInversaInfo.socioApellido} → ${relacionInversaInfo.parentesco} → ${relacionInversaInfo.familiarNombre} ${relacionInversaInfo.familiarApellido}`);
            }
        }
        else {
            logger_1.logger.warn(`⚠️  Relación inversa no encontrada para ID ${id} - Eliminación NO sincronizada`);
            logger_1.logger.info(`Relación familiar eliminada: ${existingRelacion.socio?.nombre || 'N/A'} ${existingRelacion.socio?.apellido || 'N/A'} - ${existingRelacion.parentesco} - ${existingRelacion.familiar?.nombre || 'N/A'} ${existingRelacion.familiar?.apellido || 'N/A'}`);
        }
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
        const validacionGenero = (0, parentesco_helper_1.validateParentescoGenero)(parentesco, socio.genero);
        if (validacionGenero.warning) {
            logger_1.logger.warn(`⚠️  ${validacionGenero.warning} - Persona: ${socio.nombre} ${socio.apellido} (ID: ${socio.id})`);
        }
        if (socio.fechaNacimiento && familiar.fechaNacimiento) {
            const socioAge = new Date().getFullYear() - new Date(socio.fechaNacimiento).getFullYear();
            const familiarAge = new Date().getFullYear() - new Date(familiar.fechaNacimiento).getFullYear();
            if ((parentesco === client_1.TipoParentesco.HIJO || parentesco === client_1.TipoParentesco.HIJA) && familiarAge >= socioAge) {
                logger_1.logger.warn(`Advertencia: Se está estableciendo como ${parentesco} a una persona de edad similar o mayor`);
            }
            if ((parentesco === client_1.TipoParentesco.PADRE || parentesco === client_1.TipoParentesco.MADRE) && familiarAge <= socioAge) {
                logger_1.logger.warn(`Advertencia: Se está estableciendo como ${parentesco} a una persona de edad similar o menor`);
            }
            if ((parentesco === client_1.TipoParentesco.CONYUGE ||
                parentesco === client_1.TipoParentesco.ESPOSA ||
                parentesco === client_1.TipoParentesco.ESPOSO) &&
                Math.abs(socioAge - familiarAge) > 25) {
                logger_1.logger.warn(`Advertencia: Gran diferencia de edad entre cónyuges ` +
                    `(${Math.abs(socioAge - familiarAge)} años de diferencia)`);
            }
        }
    }
}
exports.FamiliarService = FamiliarService;
//# sourceMappingURL=familiar.service.js.map