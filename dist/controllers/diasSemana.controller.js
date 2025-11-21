"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiasSemanaController = void 0;
const enums_1 = require("@/types/enums");
class DiasSemanaController {
    constructor(service) {
        this.service = service;
    }
    async findAll(req, res, next) {
        try {
            const dias = await this.service.findAll();
            const response = {
                success: true,
                data: dias,
                meta: {
                    total: dias.length
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
            const dia = await this.service.findById(id);
            const response = {
                success: true,
                data: dia
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DiasSemanaController = DiasSemanaController;
//# sourceMappingURL=diasSemana.controller.js.map