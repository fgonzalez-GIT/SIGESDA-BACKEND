"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaTipoController = void 0;
const persona_tipo_dto_1 = require("@/dto/persona-tipo.dto");
const enums_1 = require("@/types/enums");
class PersonaTipoController {
    constructor(personaTipoService) {
        this.personaTipoService = personaTipoService;
    }
    async asignarTipo(req, res, next) {
        try {
            const { personaId } = req.params;
            const validatedData = persona_tipo_dto_1.createPersonaTipoSchema.parse(req.body);
            const personaTipo = await this.personaTipoService.asignarTipo(parseInt(personaId), validatedData);
            const response = {
                success: true,
                message: `Tipo ${personaTipo.tipoPersona.nombre} asignado exitosamente`,
                data: personaTipo
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getTiposByPersona(req, res, next) {
        try {
            const { personaId } = req.params;
            const { soloActivos } = req.query;
            const tipos = await this.personaTipoService.getTiposByPersona(parseInt(personaId), soloActivos === 'true');
            const response = {
                success: true,
                data: tipos
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateTipo(req, res, next) {
        try {
            const { personaId, tipoId } = req.params;
            const validatedData = persona_tipo_dto_1.updatePersonaTipoSchema.parse(req.body);
            const personaTipo = await this.personaTipoService.updateTipo(parseInt(tipoId), validatedData);
            const response = {
                success: true,
                message: 'Tipo de persona actualizado exitosamente',
                data: personaTipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async desasignarTipo(req, res, next) {
        try {
            const { personaId, tipoPersonaId } = req.params;
            const { fechaDesasignacion } = req.query;
            const personaTipo = await this.personaTipoService.desasignarTipo(parseInt(personaId), parseInt(tipoPersonaId), fechaDesasignacion ? new Date(fechaDesasignacion) : undefined);
            const response = {
                success: true,
                message: `Tipo ${personaTipo.tipoPersona.nombre} desasignado exitosamente`,
                data: personaTipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async eliminarTipo(req, res, next) {
        try {
            const { personaId, tipoPersonaId } = req.params;
            const personaTipo = await this.personaTipoService.eliminarTipo(parseInt(personaId), parseInt(tipoPersonaId));
            const response = {
                success: true,
                message: 'Tipo de persona eliminado permanentemente',
                data: personaTipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async agregarContacto(req, res, next) {
        try {
            const { personaId } = req.params;
            const validatedData = persona_tipo_dto_1.createContactoPersonaSchema.parse(req.body);
            const contacto = await this.personaTipoService.agregarContacto(parseInt(personaId), validatedData);
            const response = {
                success: true,
                message: `Contacto ${contacto.tipoContacto} agregado exitosamente`,
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
            const contactos = await this.personaTipoService.getContactosByPersona(parseInt(personaId), soloActivos === 'true');
            const response = {
                success: true,
                data: contactos
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
            const validatedData = persona_tipo_dto_1.updateContactoPersonaSchema.parse(req.body);
            const contacto = await this.personaTipoService.updateContacto(parseInt(contactoId), validatedData);
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
            const contacto = await this.personaTipoService.eliminarContacto(parseInt(contactoId));
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
    async getTiposPersona(req, res, next) {
        try {
            const { soloActivos } = req.query;
            const tipos = await this.personaTipoService.getTiposPersona(soloActivos !== 'false');
            const response = {
                success: true,
                data: tipos
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getTipoPersonaByCodigo(req, res, next) {
        try {
            const { codigo } = req.params;
            const tipo = await this.personaTipoService.getTipoPersonaByCodigo(codigo);
            const response = {
                success: true,
                data: tipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEspecialidadesDocentes(req, res, next) {
        try {
            const { soloActivas } = req.query;
            const especialidades = await this.personaTipoService.getEspecialidadesDocentes(soloActivas !== 'false');
            const response = {
                success: true,
                data: especialidades
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEspecialidadByCodigo(req, res, next) {
        try {
            const { codigo } = req.params;
            const especialidad = await this.personaTipoService.getEspecialidadByCodigo(codigo);
            const response = {
                success: true,
                data: especialidad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getRazonesSociales(req, res, next) {
        try {
            const { soloActivas } = req.query;
            const razones = await this.personaTipoService.getRazonesSociales(soloActivas !== 'false');
            const response = {
                success: true,
                data: razones
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getRazonSocialByCodigo(req, res, next) {
        try {
            const { codigo } = req.params;
            const razon = await this.personaTipoService.getRazonSocialByCodigo(codigo);
            const response = {
                success: true,
                data: razon
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PersonaTipoController = PersonaTipoController;
//# sourceMappingURL=persona-tipo.controller.js.map