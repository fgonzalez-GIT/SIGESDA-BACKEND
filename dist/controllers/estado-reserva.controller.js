"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoReservaController = void 0;
const estados_reserva_dto_1 = require("@/dto/estados-reserva.dto");
const enums_1 = require("@/types/enums");
const logger_1 = require("@/utils/logger");
class EstadoReservaController {
    constructor(estadoReservaService) {
        this.estadoReservaService = estadoReservaService;
    }
    async create(req, res, next) {
        try {
            const validatedData = estados_reserva_dto_1.createEstadoReservaSchema.parse(req.body);
            const result = await this.estadoReservaService.create(validatedData);
            logger_1.logger.info(`Estado de reserva creado: ${validatedData.codigo} - ${validatedData.nombre}`);
            const response = {
                success: true,
                message: result.message,
                data: result.data
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const validatedQuery = estados_reserva_dto_1.queryEstadosReservasSchema.parse(req.query);
            const result = await this.estadoReservaService.findAll(validatedQuery);
            logger_1.logger.info(`Listando estados de reserva con filtros: ${JSON.stringify(validatedQuery)}`);
            const response = {
                success: true,
                data: result.data,
                message: result.message
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
            const result = await this.estadoReservaService.findById(parseInt(id));
            const response = {
                success: true,
                data: result.data
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
            const result = await this.estadoReservaService.findByCodigo(codigo);
            const response = {
                success: true,
                data: result.data
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = estados_reserva_dto_1.updateEstadoReservaSchema.parse(req.body);
            const result = await this.estadoReservaService.update(parseInt(id), validatedData);
            logger_1.logger.info(`Estado de reserva ${id} actualizado`);
            const response = {
                success: true,
                message: result.message,
                data: result.data
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
            const result = await this.estadoReservaService.delete(parseInt(id));
            logger_1.logger.info(`Estado de reserva ${id} desactivado`);
            const response = {
                success: true,
                message: result.message,
                data: result.data
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async reorder(req, res, next) {
        try {
            const validatedData = estados_reserva_dto_1.reorderEstadosReservasSchema.parse(req.body);
            const result = await this.estadoReservaService.reorder(validatedData);
            logger_1.logger.info(`Estados de reserva reordenados: ${validatedData.ids.length} elementos`);
            const response = {
                success: true,
                message: result.message,
                data: result.data
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEstadisticas(req, res, next) {
        try {
            const result = await this.estadoReservaService.getEstadisticasUso();
            const response = {
                success: true,
                data: result.data,
                message: result.message
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EstadoReservaController = EstadoReservaController;
//# sourceMappingURL=estado-reserva.controller.js.map