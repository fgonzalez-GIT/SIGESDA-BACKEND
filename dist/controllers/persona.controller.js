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
                    page: query.page,
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
            const persona = await this.personaService.getPersonaById(id);
            if (!persona) {
                const response = {
                    success: false,
                    error: 'Persona no encontrada'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
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
            const persona = await this.personaService.updatePersona(id, validatedData);
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
            const persona = await this.personaService.deletePersona(id, isHardDelete, motivo);
            const response = {
                success: true,
                message: `Persona ${isHardDelete ? 'eliminada permanentemente' : 'dada de baja'}`,
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
            const { categoria, activos } = req.query;
            const isActivos = activos !== 'false';
            const socios = await this.personaService.getSocios(categoria, isActivos);
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
            const docentes = await this.personaService.getDocentes();
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
            const proveedores = await this.personaService.getProveedores();
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
            const { q: searchTerm, tipo } = req.query;
            if (!searchTerm || typeof searchTerm !== 'string') {
                const response = {
                    success: false,
                    error: 'Parámetro de búsqueda "q" es requerido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const personas = await this.personaService.searchPersonas(searchTerm, tipo);
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
}
exports.PersonaController = PersonaController;
//# sourceMappingURL=persona.controller.js.map