"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipamientoController = void 0;
const equipamiento_dto_1 = require("@/dto/equipamiento.dto");
const enums_1 = require("@/types/enums");
class EquipamientoController {
    constructor(equipamientoService) {
        this.equipamientoService = equipamientoService;
    }
    async createEquipamiento(req, res, next) {
        try {
            const validatedData = equipamiento_dto_1.createEquipamientoSchema.parse(req.body);
            const equipamiento = await this.equipamientoService.createEquipamiento(validatedData);
            const response = {
                success: true,
                message: 'Equipamiento creado exitosamente',
                data: equipamiento
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEquipamientos(req, res, next) {
        try {
            const query = equipamiento_dto_1.equipamientoQuerySchema.parse(req.query);
            const result = await this.equipamientoService.getEquipamientos(query);
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
    async getEquipamientoById(req, res, next) {
        try {
            const { id } = req.params;
            const equipamiento = await this.equipamientoService.getEquipamientoById(parseInt(id));
            if (!equipamiento) {
                const response = {
                    success: false,
                    error: 'Equipamiento no encontrado'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: equipamiento
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateEquipamiento(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = equipamiento_dto_1.updateEquipamientoSchema.parse(req.body);
            const equipamiento = await this.equipamientoService.updateEquipamiento(parseInt(id), validatedData);
            const response = {
                success: true,
                message: 'Equipamiento actualizado exitosamente',
                data: equipamiento
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteEquipamiento(req, res, next) {
        try {
            const { id } = req.params;
            const { hard } = req.query;
            const equipamiento = await this.equipamientoService.deleteEquipamiento(parseInt(id), hard === 'true');
            const response = {
                success: true,
                message: hard === 'true'
                    ? 'Equipamiento eliminado permanentemente'
                    : 'Equipamiento desactivado exitosamente',
                data: equipamiento
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async reactivateEquipamiento(req, res, next) {
        try {
            const { id } = req.params;
            const equipamiento = await this.equipamientoService.reactivateEquipamiento(parseInt(id));
            const response = {
                success: true,
                message: 'Equipamiento reactivado exitosamente',
                data: equipamiento
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEquipamientoStats(req, res, next) {
        try {
            const { id } = req.params;
            const stats = await this.equipamientoService.getEquipamientoStats(parseInt(id));
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
}
exports.EquipamientoController = EquipamientoController;
//# sourceMappingURL=equipamiento.controller.js.map