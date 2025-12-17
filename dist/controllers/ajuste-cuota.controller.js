"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjusteCuotaController = void 0;
const ajuste_cuota_dto_1 = require("@/dto/ajuste-cuota.dto");
const enums_1 = require("@/types/enums");
class AjusteCuotaController {
    constructor(service, historialRepository) {
        this.service = service;
        this.historialRepository = historialRepository;
    }
    async createAjuste(req, res, next) {
        try {
            const validatedData = ajuste_cuota_dto_1.createAjusteCuotaSchema.parse(req.body);
            const usuario = req.body.usuario || 'sistema';
            const ajuste = await this.service.createAjuste(validatedData, usuario);
            const response = {
                success: true,
                message: 'Ajuste manual creado exitosamente',
                data: ajuste,
                meta: {
                    ajusteId: ajuste.id,
                    personaId: ajuste.personaId,
                    tipoAjuste: ajuste.tipoAjuste
                }
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAjusteById(req, res, next) {
        try {
            const { id } = req.params;
            const ajuste = await this.service.getAjusteById(parseInt(id));
            if (!ajuste) {
                const response = {
                    success: false,
                    error: `Ajuste con ID ${id} no encontrado`
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: ajuste
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAjustes(req, res, next) {
        try {
            const filters = ajuste_cuota_dto_1.queryAjusteCuotaSchema.parse(req.query);
            const ajustes = await this.service.getAjustes(filters);
            const response = {
                success: true,
                data: ajustes,
                meta: {
                    total: ajustes.length,
                    filters: filters
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAjustesByPersona(req, res, next) {
        try {
            const { personaId } = req.params;
            const { soloActivos } = req.query;
            const ajustes = await this.service.getAjustesByPersonaId(parseInt(personaId), soloActivos === 'true');
            const response = {
                success: true,
                data: ajustes,
                meta: {
                    personaId: parseInt(personaId),
                    total: ajustes.length,
                    soloActivos: soloActivos === 'true'
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateAjuste(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = ajuste_cuota_dto_1.updateAjusteCuotaSchema.parse(req.body);
            const usuario = req.body.usuario || 'sistema';
            const ajuste = await this.service.updateAjuste(parseInt(id), validatedData, usuario);
            const response = {
                success: true,
                message: 'Ajuste manual actualizado exitosamente',
                data: ajuste
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deactivateAjuste(req, res, next) {
        try {
            const { id } = req.params;
            const { usuario, motivo } = req.body;
            const ajuste = await this.service.deactivateAjuste(parseInt(id), usuario, motivo);
            const response = {
                success: true,
                message: 'Ajuste manual desactivado exitosamente',
                data: ajuste
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async activateAjuste(req, res, next) {
        try {
            const { id } = req.params;
            const { usuario, motivo } = req.body;
            const ajuste = await this.service.activateAjuste(parseInt(id), usuario, motivo);
            const response = {
                success: true,
                message: 'Ajuste manual reactivado exitosamente',
                data: ajuste
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteAjuste(req, res, next) {
        try {
            const { id } = req.params;
            const { usuario, motivo } = req.body;
            await this.service.deleteAjuste(parseInt(id), usuario, motivo);
            const response = {
                success: true,
                message: 'Ajuste manual eliminado permanentemente'
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
    async calcularAjuste(req, res, next) {
        try {
            const { ajusteId, montoOriginal } = req.body;
            if (!ajusteId || !montoOriginal) {
                const response = {
                    success: false,
                    error: 'ajusteId y montoOriginal son requeridos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const ajuste = await this.service.getAjusteById(ajusteId);
            if (!ajuste) {
                const response = {
                    success: false,
                    error: `Ajuste con ID ${ajusteId} no encontrado`
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const resultado = this.service.calcularAjuste(ajuste, montoOriginal);
            const response = {
                success: true,
                data: resultado,
                meta: {
                    ajusteId,
                    montoOriginal
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getHistorial(req, res, next) {
        try {
            const { id } = req.params;
            const historial = await this.historialRepository.findByAjusteId(parseInt(id));
            const response = {
                success: true,
                data: historial,
                meta: {
                    ajusteId: parseInt(id),
                    total: historial.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllHistorial(req, res, next) {
        try {
            const filters = ajuste_cuota_dto_1.queryHistorialAjusteCuotaSchema.parse(req.query);
            const result = await this.historialRepository.findAll(filters);
            const response = {
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    limit: filters.limit,
                    offset: filters.offset,
                    filters: filters
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getHistorialStats(req, res, next) {
        try {
            const { personaId, fechaDesde, fechaHasta } = req.query;
            const stats = await this.historialRepository.getStats({
                personaId: personaId ? parseInt(personaId) : undefined,
                fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
                fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined
            });
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
exports.AjusteCuotaController = AjusteCuotaController;
//# sourceMappingURL=ajuste-cuota.controller.js.map