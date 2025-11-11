"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriasActividadController = void 0;
const catalogos_actividades_dto_1 = require("@/dto/catalogos-actividades.dto");
const enums_1 = require("@/types/enums");
class CategoriasActividadController {
    constructor(service) {
        this.service = service;
    }
    async create(req, res, next) {
        try {
            const validatedData = catalogos_actividades_dto_1.createCategoriaActividadSchema.parse(req.body);
            const categoria = await this.service.create(validatedData);
            const response = {
                success: true,
                message: 'Categoría de actividad creada exitosamente',
                data: categoria
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
            const categorias = await this.service.findAll(query);
            const response = {
                success: true,
                data: categorias,
                meta: {
                    total: categorias.length
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
            const categoria = await this.service.findById(id);
            const response = {
                success: true,
                data: categoria
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
            const validatedData = catalogos_actividades_dto_1.updateCategoriaActividadSchema.parse(req.body);
            const categoria = await this.service.update(id, validatedData);
            const response = {
                success: true,
                message: 'Categoría de actividad actualizada exitosamente',
                data: categoria
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
            const categoria = await this.service.delete(id);
            const response = {
                success: true,
                message: 'Categoría de actividad desactivada exitosamente',
                data: categoria
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
exports.CategoriasActividadController = CategoriasActividadController;
//# sourceMappingURL=categoriasActividad.controller.js.map