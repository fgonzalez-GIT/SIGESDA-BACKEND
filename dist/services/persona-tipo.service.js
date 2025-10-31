"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaTipoService = void 0;
const logger_1 = require("@/utils/logger");
const error_middleware_1 = require("@/middleware/error.middleware");
const enums_1 = require("@/types/enums");
class PersonaTipoService {
    constructor(personaTipoRepository, personaRepository) {
        this.personaTipoRepository = personaTipoRepository;
        this.personaRepository = personaRepository;
    }
    async asignarTipo(personaId, data) {
        const persona = await this.personaRepository.findById(personaId, false);
        if (!persona) {
            throw new error_middleware_1.AppError(`Persona con ID ${personaId} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        let tipoPersonaCodigo = data.tipoPersonaCodigo;
        if (!tipoPersonaCodigo && data.tipoPersonaId) {
            const tipoCatalogo = await this.personaTipoRepository.getTiposPersona(false);
            const tipo = tipoCatalogo.find(t => t.id === data.tipoPersonaId);
            if (!tipo) {
                throw new error_middleware_1.AppError(`Tipo de persona con ID ${data.tipoPersonaId} no encontrado`, enums_1.HttpStatus.NOT_FOUND);
            }
            tipoPersonaCodigo = tipo.codigo;
        }
        if (!tipoPersonaCodigo) {
            throw new error_middleware_1.AppError('Debe proporcionar tipoPersonaId o tipoPersonaCodigo', enums_1.HttpStatus.BAD_REQUEST);
        }
        const validation = validatePersonaTipoData(tipoPersonaCodigo, data);
        if (!validation.valid) {
            throw new error_middleware_1.AppError(`Datos inválidos para tipo ${tipoPersonaCodigo}: ${validation.errors.join(', ')}`, enums_1.HttpStatus.BAD_REQUEST);
        }
        const tieneYa = await this.personaTipoRepository.tieneTipoActivo(personaId, tipoPersonaCodigo);
        if (tieneYa) {
            throw new error_middleware_1.AppError(`La persona ya tiene el tipo ${tipoPersonaCodigo} asignado`, enums_1.HttpStatus.CONFLICT);
        }
        if (tipoPersonaCodigo === 'SOCIO' && !data.numeroSocio) {
            const nextNumero = await this.personaTipoRepository.getNextNumeroSocio();
            data.numeroSocio = nextNumero;
            logger_1.logger.info(`Auto-asignado número de socio: ${nextNumero} a persona ${personaId}`);
        }
        if (tipoPersonaCodigo === 'SOCIO' && !data.fechaIngreso) {
            data.fechaIngreso = new Date().toISOString();
        }
        if (tipoPersonaCodigo === 'SOCIO' && !data.categoriaId) {
            data.categoriaId = 1;
            logger_1.logger.info(`Auto-asignada categoría GENERAL a socio persona ${personaId}`);
        }
        if (tipoPersonaCodigo === 'DOCENTE' && !data.especialidadId) {
            data.especialidadId = 1;
            logger_1.logger.info(`Auto-asignada especialidad GENERAL a docente persona ${personaId}`);
        }
        const personaTipo = await this.personaTipoRepository.asignarTipo(personaId, data);
        logger_1.logger.info(`Tipo ${tipoPersonaCodigo} asignado a persona ${personaId}`);
        return personaTipo;
    }
    async getTiposByPersona(personaId, soloActivos = false) {
        const persona = await this.personaRepository.findById(personaId, false);
        if (!persona) {
            throw new error_middleware_1.AppError(`Persona con ID ${personaId} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        return this.personaTipoRepository.findByPersonaId(personaId, soloActivos);
    }
    async updateTipo(personaTipoId, data) {
        const personaTipo = await this.personaTipoRepository.findByPersonaAndTipo(data.personaId, data.tipoPersonaId);
        if (!personaTipo) {
            throw new error_middleware_1.AppError(`Tipo de persona con ID ${personaTipoId} no encontrado`, enums_1.HttpStatus.NOT_FOUND);
        }
        const updated = await this.personaTipoRepository.updateTipo(personaTipoId, data);
        logger_1.logger.info(`Tipo de persona ${personaTipoId} actualizado`);
        return updated;
    }
    async desasignarTipo(personaId, tipoPersonaId, fechaDesasignacion) {
        const personaTipo = await this.personaTipoRepository.findByPersonaAndTipo(personaId, tipoPersonaId);
        if (!personaTipo) {
            throw new error_middleware_1.AppError(`Tipo de persona no encontrado para persona ${personaId}`, enums_1.HttpStatus.NOT_FOUND);
        }
        if (!personaTipo.activo) {
            throw new error_middleware_1.AppError('Este tipo ya está desasignado', enums_1.HttpStatus.BAD_REQUEST);
        }
        const tiposActivos = await this.personaTipoRepository.findByPersonaId(personaId, true);
        if (tiposActivos.length === 1) {
            throw new error_middleware_1.AppError('No se puede desasignar el único tipo activo. Una persona debe tener al menos un tipo.', enums_1.HttpStatus.BAD_REQUEST);
        }
        const desasignado = await this.personaTipoRepository.desasignarTipo(personaTipo.id, fechaDesasignacion);
        logger_1.logger.info(`Tipo ${personaTipo.tipoPersona.codigo} desasignado de persona ${personaId}`);
        return desasignado;
    }
    async eliminarTipo(personaId, tipoPersonaId) {
        const personaTipo = await this.personaTipoRepository.findByPersonaAndTipo(personaId, tipoPersonaId);
        if (!personaTipo) {
            throw new error_middleware_1.AppError(`Tipo de persona no encontrado para persona ${personaId}`, enums_1.HttpStatus.NOT_FOUND);
        }
        const tipos = await this.personaTipoRepository.findByPersonaId(personaId, false);
        if (tipos.length === 1) {
            throw new error_middleware_1.AppError('No se puede eliminar el único tipo. Una persona debe tener al menos un tipo.', enums_1.HttpStatus.BAD_REQUEST);
        }
        const eliminado = await this.personaTipoRepository.eliminarTipo(personaTipo.id);
        logger_1.logger.info(`Tipo ${personaTipo.tipoPersona.codigo} eliminado de persona ${personaId}`);
        return eliminado;
    }
    async agregarContacto(personaId, data) {
        const persona = await this.personaRepository.findById(personaId, false);
        if (!persona) {
            throw new error_middleware_1.AppError(`Persona con ID ${personaId} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        const contacto = await this.personaTipoRepository.agregarContacto(personaId, data);
        logger_1.logger.info(`Contacto ${data.tipoContacto} agregado a persona ${personaId}`);
        return contacto;
    }
    async getContactosByPersona(personaId, soloActivos = false) {
        const persona = await this.personaRepository.findById(personaId, false);
        if (!persona) {
            throw new error_middleware_1.AppError(`Persona con ID ${personaId} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        return this.personaTipoRepository.findContactosByPersonaId(personaId, soloActivos);
    }
    async updateContacto(contactoId, data) {
        const contacto = await this.personaTipoRepository.findContactoById(contactoId);
        if (!contacto) {
            throw new error_middleware_1.AppError(`Contacto con ID ${contactoId} no encontrado`, enums_1.HttpStatus.NOT_FOUND);
        }
        const updated = await this.personaTipoRepository.updateContacto(contactoId, data);
        logger_1.logger.info(`Contacto ${contactoId} actualizado`);
        return updated;
    }
    async eliminarContacto(contactoId) {
        const contacto = await this.personaTipoRepository.findContactoById(contactoId);
        if (!contacto) {
            throw new error_middleware_1.AppError(`Contacto con ID ${contactoId} no encontrado`, enums_1.HttpStatus.NOT_FOUND);
        }
        const eliminado = await this.personaTipoRepository.eliminarContacto(contactoId);
        logger_1.logger.info(`Contacto ${contactoId} eliminado`);
        return eliminado;
    }
    async getTiposPersona(soloActivos = true) {
        return this.personaTipoRepository.getTiposPersona(soloActivos);
    }
    async getTipoPersonaByCodigo(codigo) {
        const tipo = await this.personaTipoRepository.getTipoPersonaByCodigo(codigo);
        if (!tipo) {
            throw new error_middleware_1.AppError(`Tipo de persona con código ${codigo} no encontrado`, enums_1.HttpStatus.NOT_FOUND);
        }
        return tipo;
    }
    async getEspecialidadesDocentes(soloActivas = true) {
        return this.personaTipoRepository.getEspecialidadesDocentes(soloActivas);
    }
    async getEspecialidadByCodigo(codigo) {
        const especialidad = await this.personaTipoRepository.getEspecialidadByCodigo(codigo);
        if (!especialidad) {
            throw new error_middleware_1.AppError(`Especialidad con código ${codigo} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        return especialidad;
    }
}
exports.PersonaTipoService = PersonaTipoService;
function validatePersonaTipoData(tipoPersonaCodigo, data) {
    const errors = [];
    switch (tipoPersonaCodigo) {
        case 'SOCIO':
            break;
        case 'DOCENTE':
            break;
        case 'PROVEEDOR':
            if (!data.cuit) {
                errors.push('PROVEEDOR requiere CUIT');
            }
            if (!data.razonSocial) {
                errors.push('PROVEEDOR requiere razón social');
            }
            break;
        case 'NO_SOCIO':
            break;
        default:
            errors.push(`Tipo de persona inválido: ${tipoPersonaCodigo}`);
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
//# sourceMappingURL=persona-tipo.service.js.map