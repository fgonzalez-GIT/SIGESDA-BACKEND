"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriasEquipamientoController = void 0;
const categorias_equipamiento_dto_1 = require("@/dto/categorias-equipamiento.dto");
const enums_1 = require("@/types/enums");
class CategoriasEquipamientoController {
    constructor(service) {
        this.service = service;
    }
    async create(req, res, next) {
        try {
            const validatedData = categorias_equipamiento_dto_1.createCategoriaEquipamientoSchema.parse(req.body);
            const categoria = await this.service.create(validatedData);
            const response = {
                success: true,
                message: 'Categoría de equipamiento creada exitosamente',
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
            const options = {
                includeInactive: req.query.includeInactive === 'true',
                search: req.query.search,
                orderBy: req.query.orderBy || 'orden',
                orderDir: req.query.orderDir || 'asc'
            };
            const categorias = await this.service.findAll(options);
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
            const validatedData = categorias_equipamiento_dto_1.updateCategoriaEquipamientoSchema.parse(req.body);
            const categoria = await this.service.update(id, validatedData);
            const response = {
                success: true,
                message: 'Categoría de equipamiento actualizada exitosamente',
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
                message: 'Categoría de equipamiento desactivada exitosamente',
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
            const validatedData = categorias_equipamiento_dto_1.reorderCategoriaEquipamientoSchema.parse(req.body);
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
exports.CategoriasEquipamientoController = CategoriasEquipamientoController;
//# sourceMappingURL=categorias-equipamiento.controller.js.map