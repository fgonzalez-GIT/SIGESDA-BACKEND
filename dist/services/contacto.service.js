"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactoService = void 0;
const contacto_repository_1 = require("@/repositories/contacto.repository");
const error_middleware_1 = require("@/middleware/error.middleware");
const enums_1 = require("@/types/enums");
const logger_1 = require("@/utils/logger");
class ContactoService {
    constructor(prisma) {
        this.contactoRepository = new contacto_repository_1.ContactoRepository(prisma);
    }
    async agregarContacto(personaId, data) {
        const existe = await this.contactoRepository.existeContactoDuplicado(personaId, data.valor);
        if (existe) {
            throw new error_middleware_1.AppError('Ya existe un contacto activo con ese valor para esta persona', enums_1.HttpStatus.CONFLICT);
        }
        const contacto = await this.contactoRepository.agregarContacto(personaId, data);
        logger_1.logger.info(`Contacto agregado a persona ${personaId}`, {
            contactoId: contacto.id,
            tipoContacto: contacto.tipoContacto.codigo,
            principal: contacto.principal
        });
        return contacto;
    }
    async getContactosByPersona(personaId, soloActivos = true) {
        return this.contactoRepository.getContactosByPersona(personaId, soloActivos);
    }
    async getContactoById(contactoId) {
        const contacto = await this.contactoRepository.getContactoById(contactoId);
        if (!contacto) {
            throw new error_middleware_1.AppError('Contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
        }
        return contacto;
    }
    async updateContacto(contactoId, data) {
        const contactoActual = await this.getContactoById(contactoId);
        if (data.valor && data.valor !== contactoActual.valor) {
            const existe = await this.contactoRepository.existeContactoDuplicado(contactoActual.personaId, data.valor, contactoId);
            if (existe) {
                throw new error_middleware_1.AppError('Ya existe un contacto activo con ese valor para esta persona', enums_1.HttpStatus.CONFLICT);
            }
        }
        const contacto = await this.contactoRepository.updateContacto(contactoId, data);
        logger_1.logger.info(`Contacto actualizado`, {
            contactoId: contacto.id,
            tipoContacto: contacto.tipoContacto.codigo
        });
        return contacto;
    }
    async eliminarContacto(contactoId) {
        const contacto = await this.contactoRepository.eliminarContacto(contactoId);
        logger_1.logger.info(`Contacto eliminado (soft delete)`, {
            contactoId: contacto.id,
            tipoContacto: contacto.tipoContacto.codigo
        });
        return contacto;
    }
    async eliminarContactoPermanente(contactoId) {
        const contacto = await this.contactoRepository.eliminarContactoPermanente(contactoId);
        logger_1.logger.warn(`Contacto eliminado PERMANENTEMENTE`, {
            contactoId: contacto.id,
            tipoContacto: contacto.tipoContacto.codigo
        });
        return contacto;
    }
}
exports.ContactoService = ContactoService;
//# sourceMappingURL=contacto.service.js.map