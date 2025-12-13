"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaItemController = void 0;
const item_cuota_dto_1 = require("@/dto/item-cuota.dto");
const enums_1 = require("@/types/enums");
class CategoriaItemController {
    constructor(service) {
        this.service = service;
    }
    async getAll(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const categorias = await this.service.getAll(includeInactive);
            const response = {
                success: true,
                data: categorias,
                meta: {
                    total: categorias.length,
                    includeInactive
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const categoria = await this.service.getById(parseInt(id));
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
    async getByCodigo(req, res, next) {
        try {
            const { codigo } = req.params;
            const categoria = await this.service.getByCodigo(codigo);
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
    async getSummary(req, res, next) {
        try {
            const summary = await this.service.getSummary();
            const response = {
                success: true,
                data: summary
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getUsageStats(req, res, next) {
        try {
            const { id } = req.params;
            const stats = await this.service.getUsageStats(parseInt(id));
            const response = {
                success: true,
                data: stats
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const validatedData = item_cuota_dto_1.createCategoriaItemSchema.parse(req.body);
            const categoria = await this.service.create(validatedData);
            const response = {
                success: true,
                message: 'Categoría de ítem creada exitosamente',
                data: categoria
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = item_cuota_dto_1.updateCategoriaItemSchema.parse(req.body);
            const categoria = await this.service.update(parseInt(id), validatedData);
            const response = {
                success: true,
                message: 'Categoría de ítem actualizada exitosamente',
                data: categoria
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deactivate(req, res, next) {
        try {
            const { id } = req.params;
            const categoria = await this.service.deactivate(parseInt(id));
            const response = {
                success: true,
                message: 'Categoría de ítem desactivada exitosamente',
                data: categoria
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async activate(req, res, next) {
        try {
            const { id } = req.params;
            const categoria = await this.service.activate(parseInt(id));
            const response = {
                success: true,
                message: 'Categoría de ítem activada exitosamente',
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
            const { id } = req.params;
            await this.service.delete(parseInt(id));
            const response = {
                success: true,
                message: 'Categoría de ítem eliminada exitosamente'
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async reorder(req, res, next) {
        try {
            const validatedData = item_cuota_dto_1.reorderCategoriasSchema.parse(req.body);
            const result = await this.service.reorder(validatedData.ordenamiento);
            const response = {
                success: true,
                message: `${result.updated} categorías reordenadas exitosamente`,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CategoriaItemController = CategoriaItemController;
//# sourceMappingURL=categoria-item.controller.js.map