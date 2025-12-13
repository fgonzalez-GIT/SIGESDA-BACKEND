"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoItemCuotaController = void 0;
const item_cuota_dto_1 = require("@/dto/item-cuota.dto");
const enums_1 = require("@/types/enums");
class TipoItemCuotaController {
    constructor(service) {
        this.service = service;
    }
    async getAll(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const categoriaItemId = req.query.categoriaItemId
                ? parseInt(req.query.categoriaItemId)
                : undefined;
            const tipos = await this.service.getAll({
                includeInactive,
                categoriaItemId
            });
            const response = {
                success: true,
                data: tipos,
                meta: {
                    total: tipos.length,
                    includeInactive,
                    categoriaItemId
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
            const tipo = await this.service.getById(parseInt(id));
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
    async getByCodigo(req, res, next) {
        try {
            const { codigo } = req.params;
            const tipo = await this.service.getByCodigo(codigo);
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
    async getByCategoriaCodigo(req, res, next) {
        try {
            const { categoriaCodigo } = req.params;
            const includeInactive = req.query.includeInactive === 'true';
            const tipos = await this.service.getByCategoriaCodigo(categoriaCodigo, includeInactive);
            const response = {
                success: true,
                data: tipos,
                meta: {
                    categoriaCodigo,
                    total: tipos.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getCalculados(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const tipos = await this.service.getCalculados(includeInactive);
            const response = {
                success: true,
                data: tipos,
                meta: {
                    total: tipos.length,
                    tipo: 'calculados'
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getManuales(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const tipos = await this.service.getManuales(includeInactive);
            const response = {
                success: true,
                data: tipos,
                meta: {
                    total: tipos.length,
                    tipo: 'manuales'
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getSummaryByCategoria(req, res, next) {
        try {
            const summary = await this.service.getSummaryByCategoria();
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
            const validatedData = item_cuota_dto_1.createTipoItemCuotaSchema.parse(req.body);
            const tipo = await this.service.create(validatedData);
            const response = {
                success: true,
                message: 'Tipo de ítem creado exitosamente',
                data: tipo
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
            const validatedData = item_cuota_dto_1.updateTipoItemCuotaSchema.parse(req.body);
            const tipo = await this.service.update(parseInt(id), validatedData);
            const response = {
                success: true,
                message: 'Tipo de ítem actualizado exitosamente',
                data: tipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateFormula(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = item_cuota_dto_1.updateFormulaSchema.parse(req.body);
            const tipo = await this.service.updateFormula(parseInt(id), validatedData.formula);
            const response = {
                success: true,
                message: 'Fórmula actualizada exitosamente',
                data: tipo
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
            const tipo = await this.service.deactivate(parseInt(id));
            const response = {
                success: true,
                message: 'Tipo de ítem desactivado exitosamente',
                data: tipo
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
            const tipo = await this.service.activate(parseInt(id));
            const response = {
                success: true,
                message: 'Tipo de ítem activado exitosamente',
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
            const { id } = req.params;
            await this.service.delete(parseInt(id));
            const response = {
                success: true,
                message: 'Tipo de ítem eliminado exitosamente'
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async clone(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = item_cuota_dto_1.cloneTipoItemSchema.parse(req.body);
            const tipo = await this.service.clone(parseInt(id), validatedData.nuevoCodigo, validatedData.nuevoNombre);
            const response = {
                success: true,
                message: 'Tipo de ítem clonado exitosamente',
                data: tipo
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async reorder(req, res, next) {
        try {
            const validatedData = item_cuota_dto_1.reorderTiposItemSchema.parse(req.body);
            const result = await this.service.reorder(validatedData.ordenamiento);
            const response = {
                success: true,
                message: `${result.updated} tipos de ítem reordenados exitosamente`,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TipoItemCuotaController = TipoItemCuotaController;
//# sourceMappingURL=tipo-item-cuota.controller.js.map