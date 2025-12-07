"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactoPersonaController = void 0;
const contacto_dto_1 = require("@/dto/contacto.dto");
const enums_1 = require("@/types/enums");
class ContactoPersonaController {
    constructor(contactoService) {
        this.contactoService = contactoService;
    }
    async agregarContacto(req, res, next) {
        try {
            const { personaId } = req.params;
            const validatedData = contacto_dto_1.createContactoPersonaSchema.parse(req.body);
            const contacto = await this.contactoService.agregarContacto(parseInt(personaId), validatedData);
            const response = {
                success: true,
                message: `Contacto ${contacto.tipoContacto.nombre} agregado exitosamente`,
                data: contacto
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getContactosByPersona(req, res, next) {
        try {
            const { personaId } = req.params;
            const { soloActivos } = req.query;
            const contactos = await this.contactoService.getContactosByPersona(parseInt(personaId), soloActivos === 'true');
            const response = {
                success: true,
                data: contactos,
                meta: {
                    total: contactos.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getContactoById(req, res, next) {
        try {
            const { contactoId } = req.params;
            const contacto = await this.contactoService.getContactoById(parseInt(contactoId));
            const response = {
                success: true,
                data: contacto
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateContacto(req, res, next) {
        try {
            const { contactoId } = req.params;
            const validatedData = contacto_dto_1.updateContactoPersonaSchema.parse(req.body);
            const contacto = await this.contactoService.updateContacto(parseInt(contactoId), validatedData);
            const response = {
                success: true,
                message: 'Contacto actualizado exitosamente',
                data: contacto
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async eliminarContacto(req, res, next) {
        try {
            const { contactoId } = req.params;
            const contacto = await this.contactoService.eliminarContacto(parseInt(contactoId));
            const response = {
                success: true,
                message: 'Contacto eliminado exitosamente',
                data: contacto
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async eliminarContactoPermanente(req, res, next) {
        try {
            const { contactoId } = req.params;
            const contacto = await this.contactoService.eliminarContactoPermanente(parseInt(contactoId));
            const response = {
                success: true,
                message: 'Contacto eliminado PERMANENTEMENTE',
                data: contacto
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ContactoPersonaController = ContactoPersonaController;
//# sourceMappingURL=contacto-persona.controller.js.map