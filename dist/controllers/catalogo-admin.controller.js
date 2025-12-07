"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogoAdminController = void 0;
const catalogo_dto_1 = require("@/dto/catalogo.dto");
const enums_1 = require("@/types/enums");
class CatalogoAdminController {
    constructor(catalogoService) {
        this.catalogoService = catalogoService;
    }
    async createTipoPersona(req, res, next) {
        try {
            const validatedData = catalogo_dto_1.createTipoPersonaSchema.parse(req.body);
            const tipo = await this.catalogoService.createTipoPersona(validatedData);
            const response = {
                success: true,
                message: `Tipo de persona '${tipo.nombre}' creado exitosamente`,
                data: tipo
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllTiposPersonaWithStats(req, res, next) {
        try {
            const tipos = await this.catalogoService.getAllTiposPersonaWithStats();
            const response = {
                success: true,
                data: tipos.map(tipo => ({
                    ...tipo,
                    personasActivas: tipo._count.personasTipo,
                    esProtegido: ['NO_SOCIO', 'SOCIO', 'DOCENTE', 'PROVEEDOR'].includes(tipo.codigo)
                }))
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getTipoPersonaById(req, res, next) {
        try {
            const { id } = req.params;
            const tipo = await this.catalogoService.getTipoPersonaById(parseInt(id));
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
    async updateTipoPersona(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = catalogo_dto_1.updateTipoPersonaSchema.parse(req.body);
            const tipo = await this.catalogoService.updateTipoPersona(parseInt(id), validatedData);
            const response = {
                success: true,
                message: `Tipo de persona '${tipo.nombre}' actualizado exitosamente`,
                data: tipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTipoPersona(req, res, next) {
        try {
            const { id } = req.params;
            const tipo = await this.catalogoService.deleteTipoPersona(parseInt(id));
            const response = {
                success: true,
                message: `Tipo de persona '${tipo.nombre}' eliminado exitosamente`,
                data: tipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleActivoTipoPersona(req, res, next) {
        try {
            const { id } = req.params;
            const { activo } = catalogo_dto_1.toggleActivoSchema.parse(req.body);
            const tipo = await this.catalogoService.toggleActivoTipoPersona(parseInt(id), activo);
            const response = {
                success: true,
                message: `Tipo de persona '${tipo.nombre}' ${activo ? 'activado' : 'desactivado'} exitosamente`,
                data: tipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async createEspecialidad(req, res, next) {
        try {
            const validatedData = catalogo_dto_1.createEspecialidadSchema.parse(req.body);
            const especialidad = await this.catalogoService.createEspecialidad(validatedData);
            const response = {
                success: true,
                message: `Especialidad '${especialidad.nombre}' creada exitosamente`,
                data: especialidad
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllEspecialidadesWithStats(req, res, next) {
        try {
            const especialidades = await this.catalogoService.getAllEspecialidadesWithStats();
            const response = {
                success: true,
                data: especialidades.map(esp => ({
                    ...esp,
                    docentesActivos: esp._count.personaTipos,
                    esProtegida: esp.codigo === 'GENERAL'
                }))
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEspecialidadById(req, res, next) {
        try {
            const { id } = req.params;
            const especialidad = await this.catalogoService.getEspecialidadById(parseInt(id));
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
    async updateEspecialidad(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = catalogo_dto_1.updateEspecialidadSchema.parse(req.body);
            const especialidad = await this.catalogoService.updateEspecialidad(parseInt(id), validatedData);
            const response = {
                success: true,
                message: `Especialidad '${especialidad.nombre}' actualizada exitosamente`,
                data: especialidad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteEspecialidad(req, res, next) {
        try {
            const { id } = req.params;
            const especialidad = await this.catalogoService.deleteEspecialidad(parseInt(id));
            const response = {
                success: true,
                message: `Especialidad '${especialidad.nombre}' eliminada exitosamente`,
                data: especialidad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleActivoEspecialidad(req, res, next) {
        try {
            const { id } = req.params;
            const { activo } = catalogo_dto_1.toggleActivoSchema.parse(req.body);
            const especialidad = await this.catalogoService.toggleActivoEspecialidad(parseInt(id), activo);
            const response = {
                success: true,
                message: `Especialidad '${especialidad.nombre}' ${activo ? 'activada' : 'desactivada'} exitosamente`,
                data: especialidad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CatalogoAdminController = CatalogoAdminController;
//# sourceMappingURL=catalogo-admin.controller.js.map