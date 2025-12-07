"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadosEquipamientoController = void 0;
const estados_equipamiento_dto_1 = require("@/dto/estados-equipamiento.dto");
const enums_1 = require("@/types/enums");
class EstadosEquipamientoController {
    constructor(service) {
        this.service = service;
    }
    async create(req, res, next) {
        try {
            const validatedData = estados_equipamiento_dto_1.createEstadoEquipamientoSchema.parse(req.body);
            const estado = await this.service.create(validatedData);
            const response = {
                success: true,
                message: 'Estado de equipamiento creado exitosamente',
                data: estado
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
            const estados = await this.service.findAll(options);
            const response = {
                success: true,
                data: estados,
                meta: {
                    total: estados.length
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
            const estado = await this.service.findById(id);
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
            const validatedData = estados_equipamiento_dto_1.updateEstadoEquipamientoSchema.parse(req.body);
            const estado = await this.service.update(id, validatedData);
            const response = {
                success: true,
                message: 'Estado de equipamiento actualizado exitosamente',
                data: estado
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
            const estado = await this.service.delete(id);
            const response = {
                success: true,
                message: 'Estado de equipamiento desactivado exitosamente',
                data: estado
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async reorder(req, res, next) {
        try {
            const validatedData = estados_equipamiento_dto_1.reorderEstadoEquipamientoSchema.parse(req.body);
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
exports.EstadosEquipamientoController = EstadosEquipamientoController;
//# sourceMappingURL=estados-equipamiento.controller.js.map