"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExencionCuotaController = void 0;
const exencion_cuota_dto_1 = require("@/dto/exencion-cuota.dto");
const enums_1 = require("@/types/enums");
class ExencionCuotaController {
    constructor(service) {
        this.service = service;
    }
    async createExencion(req, res, next) {
        try {
            const validatedData = exencion_cuota_dto_1.createExencionCuotaSchema.parse(req.body);
            const usuario = req.body.usuario || 'sistema';
            const exencion = await this.service.createExencion(validatedData, usuario);
            const response = {
                success: true,
                message: 'Exención creada exitosamente',
                data: exencion,
                meta: {
                    exencionId: exencion.id,
                    personaId: exencion.personaId,
                    estado: exencion.estado
                }
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getExencionById(req, res, next) {
        try {
            const { id } = req.params;
            const exencion = await this.service.getExencionById(parseInt(id));
            if (!exencion) {
                const response = {
                    success: false,
                    error: `Exención con ID ${id} no encontrada`
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: exencion
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getExenciones(req, res, next) {
        try {
            const filters = exencion_cuota_dto_1.queryExencionCuotaSchema.parse(req.query);
            const exenciones = await this.service.getExenciones(filters);
            const response = {
                success: true,
                data: exenciones,
                meta: {
                    total: exenciones.length,
                    filters
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getExencionesByPersona(req, res, next) {
        try {
            const { personaId } = req.params;
            const { soloActivas } = req.query;
            const exenciones = await this.service.getExencionesByPersonaId(parseInt(personaId), soloActivas === 'true');
            const response = {
                success: true,
                data: exenciones,
                meta: {
                    personaId: parseInt(personaId),
                    total: exenciones.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getPendientes(req, res, next) {
        try {
            const exenciones = await this.service.getPendientes();
            const response = {
                success: true,
                data: exenciones,
                meta: {
                    total: exenciones.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getVigentes(req, res, next) {
        try {
            const exenciones = await this.service.getVigentes();
            const response = {
                success: true,
                data: exenciones,
                meta: {
                    total: exenciones.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateExencion(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = exencion_cuota_dto_1.updateExencionCuotaSchema.parse(req.body);
            const usuario = req.body.usuario || 'sistema';
            const exencion = await this.service.updateExencion(parseInt(id), validatedData, usuario);
            const response = {
                success: true,
                message: 'Exención actualizada exitosamente',
                data: exencion
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async aprobarExencion(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = exencion_cuota_dto_1.aprobarExencionSchema.parse(req.body);
            const usuario = req.body.usuario || validatedData.aprobadoPor;
            const exencion = await this.service.aprobarExencion(parseInt(id), validatedData, usuario);
            const response = {
                success: true,
                message: 'Exención aprobada exitosamente',
                data: exencion
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async rechazarExencion(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = exencion_cuota_dto_1.rechazarExencionSchema.parse(req.body);
            const usuario = req.body.usuario || 'sistema';
            const exencion = await this.service.rechazarExencion(parseInt(id), validatedData, usuario);
            const response = {
                success: true,
                message: 'Exención rechazada',
                data: exencion
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async revocarExencion(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = exencion_cuota_dto_1.revocarExencionSchema.parse(req.body);
            const usuario = req.body.usuario || 'sistema';
            const exencion = await this.service.revocarExencion(parseInt(id), validatedData, usuario);
            const response = {
                success: true,
                message: 'Exención revocada',
                data: exencion
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteExencion(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = req.body.usuario || 'sistema';
            await this.service.deleteExencion(parseInt(id), usuario);
            const response = {
                success: true,
                message: 'Exención eliminada'
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getStats(req, res, next) {
        try {
            const { personaId } = req.query;
            const stats = await this.service.getStats(personaId ? parseInt(personaId) : undefined);
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
    async checkExencionParaPeriodo(req, res, next) {
        try {
            const { personaId, fecha } = req.body;
            if (!personaId || !fecha) {
                const response = {
                    success: false,
                    error: 'personaId y fecha son requeridos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const resultado = await this.service.checkExencionParaPeriodo(personaId, new Date(fecha));
            const response = {
                success: true,
                data: resultado
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ExencionCuotaController = ExencionCuotaController;
//# sourceMappingURL=exencion-cuota.controller.js.map