"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AulaController = void 0;
const aula_dto_1 = require("@/dto/aula.dto");
const enums_1 = require("@/types/enums");
class AulaController {
    constructor(aulaService) {
        this.aulaService = aulaService;
    }
    async createAula(req, res, next) {
        try {
            console.log('🔍 [DEBUG] POST /api/aulas - Request body:', JSON.stringify(req.body, null, 2));
            const validatedData = aula_dto_1.createAulaSchema.parse(req.body);
            console.log('✅ [DEBUG] Validation passed:', JSON.stringify(validatedData, null, 2));
            const aula = await this.aulaService.createAula(validatedData);
            const response = {
                success: true,
                message: 'Aula creada exitosamente',
                data: aula
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAulas(req, res, next) {
        try {
            const query = aula_dto_1.aulaQuerySchema.parse(req.query);
            const result = await this.aulaService.getAulas(query);
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
    async getAulaById(req, res, next) {
        try {
            const { id } = req.params;
            const aula = await this.aulaService.getAulaById(id);
            if (!aula) {
                const response = {
                    success: false,
                    error: 'Aula no encontrada'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: aula
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateAula(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = aula_dto_1.updateAulaSchema.parse(req.body);
            const aula = await this.aulaService.updateAula(id, validatedData);
            const response = {
                success: true,
                message: 'Aula actualizada exitosamente',
                data: aula
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteAula(req, res, next) {
        try {
            const { id } = req.params;
            const { hard } = req.query;
            const isHardDelete = hard === 'true';
            const aula = await this.aulaService.deleteAula(id, isHardDelete);
            const response = {
                success: true,
                message: `Aula ${isHardDelete ? 'eliminada permanentemente' : 'dada de baja'}`,
                data: aula
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAulasDisponibles(req, res, next) {
        try {
            const aulas = await this.aulaService.getAulasDisponibles();
            const response = {
                success: true,
                data: aulas
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async verificarDisponibilidad(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = aula_dto_1.disponibilidadAulaSchema.parse(req.body);
            const resultado = await this.aulaService.verificarDisponibilidad(id, validatedData);
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
    async getEstadisticas(req, res, next) {
        try {
            const { id } = req.params;
            const estadisticas = await this.aulaService.getEstadisticas(id);
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
    async getAulasConMenorUso(req, res, next) {
        try {
            const aulas = await this.aulaService.getAulasConMenorUso();
            const response = {
                success: true,
                data: aulas
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async searchAulas(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            if (!searchTerm || typeof searchTerm !== 'string') {
                const response = {
                    success: false,
                    error: 'Parámetro de búsqueda "q" es requerido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const aulas = await this.aulaService.searchAulas(searchTerm);
            const response = {
                success: true,
                data: aulas
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAulasPorCapacidad(req, res, next) {
        try {
            const { capacidad } = req.query;
            if (!capacidad || isNaN(Number(capacidad))) {
                const response = {
                    success: false,
                    error: 'Parámetro de capacidad es requerido y debe ser un número'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const aulas = await this.aulaService.getAulasPorCapacidad(Number(capacidad));
            const response = {
                success: true,
                data: aulas
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAulasConEquipamiento(req, res, next) {
        try {
            const aulas = await this.aulaService.getAulasConEquipamiento();
            const response = {
                success: true,
                data: aulas
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getReservasDelAula(req, res, next) {
        try {
            const { id } = req.params;
            const { fechaDesde, fechaHasta } = req.query;
            let fechaDesdeStr;
            let fechaHastaStr;
            if (fechaDesde && typeof fechaDesde === 'string') {
                try {
                    new Date(fechaDesde);
                    fechaDesdeStr = fechaDesde;
                }
                catch {
                    const response = {
                        success: false,
                        error: 'Formato de fechaDesde inválido. Use formato ISO: YYYY-MM-DDTHH:mm:ss.sssZ'
                    };
                    res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                    return;
                }
            }
            if (fechaHasta && typeof fechaHasta === 'string') {
                try {
                    new Date(fechaHasta);
                    fechaHastaStr = fechaHasta;
                }
                catch {
                    const response = {
                        success: false,
                        error: 'Formato de fechaHasta inválido. Use formato ISO: YYYY-MM-DDTHH:mm:ss.sssZ'
                    };
                    res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                    return;
                }
            }
            const reservas = await this.aulaService.getReservasDelAula(id, fechaDesdeStr, fechaHastaStr);
            const response = {
                success: true,
                data: reservas
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AulaController = AulaController;
//# sourceMappingURL=aula.controller.js.map