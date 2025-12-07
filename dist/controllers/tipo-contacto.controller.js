"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoContactoController = void 0;
const contacto_dto_1 = require("@/dto/contacto.dto");
const enums_1 = require("@/types/enums");
class TipoContactoController {
    constructor(tipoContactoService) {
        this.tipoContactoService = tipoContactoService;
    }
    async create(req, res, next) {
        try {
            const validatedData = contacto_dto_1.createTipoContactoSchema.parse(req.body);
            const tipo = await this.tipoContactoService.create(validatedData);
            const response = {
                success: true,
                message: `Tipo de contacto '${tipo.nombre}' creado exitosamente`,
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
            const params = contacto_dto_1.getTiposContactoSchema.parse(req.query);
            const tipos = await this.tipoContactoService.findAll(params);
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
            const { id } = req.params;
            const tipo = await this.tipoContactoService.findById(parseInt(id));
            if (!tipo) {
                const response = {
                    success: false,
                    error: 'Tipo de contacto no encontrado'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
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
            const { id } = req.params;
            const validatedData = contacto_dto_1.updateTipoContactoSchema.parse(req.body);
            const tipo = await this.tipoContactoService.update(parseInt(id), validatedData);
            const response = {
                success: true,
                message: `Tipo de contacto '${tipo.nombre}' actualizado exitosamente`,
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
            const tipo = await this.tipoContactoService.delete(parseInt(id));
            const response = {
                success: true,
                message: `Tipo de contacto '${tipo.nombre}' eliminado permanentemente`
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
            const tipo = await this.tipoContactoService.deactivate(parseInt(id));
            const response = {
                success: true,
                message: `Tipo de contacto '${tipo.nombre}' desactivado exitosamente`,
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
            const tipo = await this.tipoContactoService.activate(parseInt(id));
            const response = {
                success: true,
                message: `Tipo de contacto '${tipo.nombre}' activado exitosamente`,
                data: tipo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEstadisticasUso(req, res, next) {
        try {
            const estadisticas = await this.tipoContactoService.getEstadisticasUso();
            const response = {
                success: true,
                data: estadisticas
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TipoContactoController = TipoContactoController;
//# sourceMappingURL=tipo-contacto.controller.js.map