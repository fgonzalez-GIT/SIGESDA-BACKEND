"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemCuotaController = void 0;
const item_cuota_dto_1 = require("@/dto/item-cuota.dto");
const enums_1 = require("@/types/enums");
class ItemCuotaController {
    constructor(service) {
        this.service = service;
    }
    async getItemsByCuotaId(req, res, next) {
        try {
            const { cuotaId } = req.params;
            const result = await this.service.getItemsByCuotaId(parseInt(cuotaId));
            const response = {
                success: true,
                data: result.items,
                meta: {
                    cuotaId: parseInt(cuotaId),
                    totalItems: result.items.length,
                    summary: result.summary
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getDesgloseByCuotaId(req, res, next) {
        try {
            const { cuotaId } = req.params;
            const desglose = await this.service.getDesgloseByCuotaId(parseInt(cuotaId));
            const response = {
                success: true,
                data: desglose
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getItemsSegmentados(req, res, next) {
        try {
            const { cuotaId } = req.params;
            const result = await this.service.getItemsSegmentadosByCuotaId(parseInt(cuotaId));
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
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const item = await this.service.getById(parseInt(id));
            const response = {
                success: true,
                data: item
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async addManualItem(req, res, next) {
        try {
            const { cuotaId } = req.params;
            const validatedData = item_cuota_dto_1.addManualItemSchema.parse({
                ...req.body,
                cuotaId: parseInt(cuotaId)
            });
            const item = await this.service.addManualItem(validatedData);
            const response = {
                success: true,
                message: 'Ítem agregado exitosamente',
                data: item
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateItem(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = item_cuota_dto_1.updateItemCuotaSchema.parse(req.body);
            const item = await this.service.updateItem(parseInt(id), validatedData);
            const response = {
                success: true,
                message: 'Ítem actualizado exitosamente',
                data: item
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteItem(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.service.deleteItem(parseInt(id));
            const response = {
                success: true,
                message: result.message
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async regenerarItems(req, res, next) {
        try {
            const { cuotaId } = req.params;
            const validatedData = item_cuota_dto_1.regenerarItemsSchema.parse(req.body);
            const result = await this.service.regenerarItems(parseInt(cuotaId), validatedData.items);
            const response = {
                success: true,
                message: `${result.itemsCreados} ítems regenerados exitosamente`,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async duplicarItem(req, res, next) {
        try {
            const { id } = req.params;
            const item = await this.service.duplicarItem(parseInt(id));
            const response = {
                success: true,
                message: 'Ítem duplicado exitosamente',
                data: item
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async aplicarDescuentoGlobal(req, res, next) {
        try {
            const { cuotaId } = req.params;
            const validatedData = item_cuota_dto_1.aplicarDescuentoGlobalSchema.parse(req.body);
            const item = await this.service.aplicarDescuentoGlobal(parseInt(cuotaId), validatedData.porcentaje, validatedData.concepto);
            const response = {
                success: true,
                message: `Descuento del ${validatedData.porcentaje}% aplicado exitosamente`,
                data: item
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getGlobalStats(req, res, next) {
        try {
            const stats = await this.service.getGlobalStats();
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
    async findByTipoItemCodigo(req, res, next) {
        try {
            const { codigo } = req.params;
            const query = item_cuota_dto_1.queryItemsSchema.parse(req.query);
            const items = await this.service.findByTipoItemCodigo(codigo, {
                limit: query.limit,
                offset: query.offset
            });
            const response = {
                success: true,
                data: items,
                meta: {
                    tipoItemCodigo: codigo,
                    total: items.length,
                    limit: query.limit,
                    offset: query.offset
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async findByCategoriaCodigo(req, res, next) {
        try {
            const { codigo } = req.params;
            const query = item_cuota_dto_1.queryItemsSchema.parse(req.query);
            const items = await this.service.findByCategoriaCodigo(codigo, {
                limit: query.limit,
                offset: query.offset
            });
            const response = {
                success: true,
                data: items,
                meta: {
                    categoriaCodigo: codigo,
                    total: items.length,
                    limit: query.limit,
                    offset: query.offset
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ItemCuotaController = ItemCuotaController;
//# sourceMappingURL=item-cuota.controller.js.map