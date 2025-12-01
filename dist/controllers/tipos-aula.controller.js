"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposAulaController = void 0;
const tipos_aula_dto_1 = require("@/dto/tipos-aula.dto");
const enums_1 = require("@/types/enums");
class TiposAulaController {
    constructor(service) {
        this.service = service;
    }
    async create(req, res, next) {
        try {
            const validatedData = tipos_aula_dto_1.createTipoAulaSchema.parse(req.body);
            const tipo = await this.service.create(validatedData);
            const response = {
                success: true,
                message: 'Tipo de aula creado exitosamente',
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
            const options = {
                includeInactive: req.query.includeInactive === 'true',
                search: req.query.search,
                orderBy: req.query.orderBy || 'orden',
                orderDir: req.query.orderDir || 'asc'
            };
            const tipos = await this.service.findAll(options);
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
            const validatedData = tipos_aula_dto_1.updateTipoAulaSchema.parse(req.body);
            const tipo = await this.service.update(id, validatedData);
            const response = {
                success: true,
                message: 'Tipo de aula actualizado exitosamente',
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
                message: 'Tipo de aula desactivado exitosamente',
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
            const validatedData = tipos_aula_dto_1.reorderTipoAulaSchema.parse(req.body);
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
exports.TiposAulaController = TiposAulaController;
//# sourceMappingURL=tipos-aula.controller.js.map