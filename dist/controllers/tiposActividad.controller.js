"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposActividadController = void 0;
const catalogos_actividades_dto_1 = require("@/dto/catalogos-actividades.dto");
const enums_1 = require("@/types/enums");
class TiposActividadController {
    constructor(service) {
        this.service = service;
    }
    async create(req, res, next) {
        try {
            const validatedData = catalogos_actividades_dto_1.createTipoActividadSchema.parse(req.body);
            const tipo = await this.service.create(validatedData);
            const response = {
                success: true,
                message: 'Tipo de actividad creado exitosamente',
                data: tipo
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async findAll(req, res, next) {
        try {
            const query = catalogos_actividades_dto_1.queryTiposCatalogoSchema.parse(req.query);
            const tipos = await this.service.findAll(query);
            const response = {
                success: true,
                data: tipos,
                meta: {
                    total: tipos.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async findById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    error: 'ID inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const tipo = await this.service.findById(id);
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
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    error: 'ID inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const validatedData = catalogos_actividades_dto_1.updateTipoActividadSchema.parse(req.body);
            const tipo = await this.service.update(id, validatedData);
            const response = {
                success: true,
                message: 'Tipo de actividad actualizado exitosamente',
                data: tipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    error: 'ID inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const tipo = await this.service.delete(id);
            const response = {
                success: true,
                message: 'Tipo de actividad desactivado exitosamente',
                data: tipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async reorder(req, res, next) {
        try {
            const validatedData = catalogos_actividades_dto_1.reorderCatalogoSchema.parse(req.body);
            const result = await this.service.reorder(validatedData);
            const response = {
                success: true,
                message: result.message,
                data: { count: result.count }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TiposActividadController = TiposActividadController;
//# sourceMappingURL=tiposActividad.controller.js.map