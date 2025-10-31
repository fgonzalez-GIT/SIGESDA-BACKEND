"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaController = void 0;
const persona_dto_1 = require("@/dto/persona.dto");
const enums_1 = require("@/types/enums");
class PersonaController {
    constructor(personaService) {
        this.personaService = personaService;
    }
    async createPersona(req, res, next) {
        try {
            const validatedData = persona_dto_1.createPersonaSchema.parse(req.body);
            const persona = await this.personaService.createPersona(validatedData);
            const response = {
                success: true,
                message: 'Persona creada exitosamente',
                data: persona
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getPersonas(req, res, next) {
        try {
            const query = persona_dto_1.personaQuerySchema.parse(req.query);
            const result = await this.personaService.getPersonas(query);
            const response = {
                success: true,
                data: result.data,
                meta: {
                    page: result.page,
                    limit: query.limit,
                    total: result.total,
                    totalPages: result.pages
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getPersonaById(req, res, next) {
        try {
            const { id } = req.params;
            const { includeRelations } = req.query;
            const persona = await this.personaService.getPersonaById(parseInt(id), includeRelations !== 'false');
            const response = {
                success: true,
                data: persona
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePersona(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = persona_dto_1.updatePersonaSchema.parse(req.body);
            const persona = await this.personaService.updatePersona(parseInt(id), validatedData);
            const response = {
                success: true,
                message: 'Persona actualizada exitosamente',
                data: persona
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deletePersona(req, res, next) {
        try {
            const { id } = req.params;
            const { hard, motivo } = req.query;
            const isHardDelete = hard === 'true';
            const persona = await this.personaService.deletePersona(parseInt(id), isHardDelete, motivo);
            const response = {
                success: true,
                message: isHardDelete
                    ? 'Persona eliminada permanentemente'
                    : 'Persona desactivada (todos los tipos desasignados)',
                data: persona
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getSocios(req, res, next) {
        try {
            const { categoriaId, activos, conNumeroSocio } = req.query;
            const socios = await this.personaService.getSocios({
                categoriaId: categoriaId ? parseInt(categoriaId) : undefined,
                activos: activos !== 'false',
                conNumeroSocio: conNumeroSocio === 'true'
            });
            const response = {
                success: true,
                data: socios
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getDocentes(req, res, next) {
        try {
            const { especialidadId, activos } = req.query;
            const docentes = await this.personaService.getDocentes({
                especialidadId: especialidadId ? parseInt(especialidadId) : undefined,
                activos: activos !== 'false'
            });
            const response = {
                success: true,
                data: docentes
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getProveedores(req, res, next) {
        try {
            const { activos } = req.query;
            const proveedores = await this.personaService.getProveedores(activos !== 'false');
            const response = {
                success: true,
                data: proveedores
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async searchPersonas(req, res, next) {
        try {
            const { q: searchTerm, tipo, limit } = req.query;
            if (!searchTerm || typeof searchTerm !== 'string') {
                const response = {
                    success: false,
                    error: 'Parámetro de búsqueda "q" es requerido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const personas = await this.personaService.searchPersonas(searchTerm, tipo, limit ? parseInt(limit) : 20);
            const response = {
                success: true,
                data: personas
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async checkDni(req, res, next) {
        try {
            const { dni } = req.params;
            if (!/^\d{7,8}$/.test(dni)) {
                const response = {
                    success: false,
                    error: 'DNI inválido',
                    message: 'El DNI debe contener entre 7 y 8 dígitos numéricos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const result = await this.personaService.checkDniExists(dni);
            const response = {
                success: true,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async reactivatePersona(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = req.body && Object.keys(req.body).length > 0
                ? persona_dto_1.updatePersonaSchema.parse(req.body)
                : undefined;
            const persona = await this.personaService.reactivatePersona(parseInt(id), validatedData);
            const response = {
                success: true,
                message: 'Persona reactivada exitosamente (tipo NO_SOCIO asignado)',
                data: persona
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEstadoPersona(req, res, next) {
        try {
            const { id } = req.params;
            const estado = await this.personaService.getEstadoPersona(parseInt(id));
            const response = {
                success: true,
                data: estado
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async checkTipoActivo(req, res, next) {
        try {
            const { id, tipoCodigo } = req.params;
            const tieneTipo = await this.personaService.hasTipoActivo(parseInt(id), tipoCodigo);
            const response = {
                success: true,
                data: {
                    personaId: parseInt(id),
                    tipoPersonaCodigo: tipoCodigo,
                    tieneActivo: tieneTipo
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PersonaController = PersonaController;
//# sourceMappingURL=persona.controller.js.map