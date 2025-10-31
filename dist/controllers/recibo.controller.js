"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReciboController = void 0;
const recibo_dto_1 = require("@/dto/recibo.dto");
const enums_1 = require("@/types/enums");
class ReciboController {
    constructor(reciboService) {
        this.reciboService = reciboService;
    }
    async createRecibo(req, res, next) {
        try {
            const validatedData = recibo_dto_1.createReciboSchema.parse(req.body);
            const recibo = await this.reciboService.createRecibo(validatedData);
            const response = {
                success: true,
                message: 'Recibo creado exitosamente',
                data: recibo
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getRecibos(req, res, next) {
        try {
            const query = recibo_dto_1.reciboQuerySchema.parse(req.query);
            const result = await this.reciboService.getRecibos(query);
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
    async getReciboById(req, res, next) {
        try {
            const { id } = req.params;
            const recibo = await this.reciboService.getReciboById(id);
            if (!recibo) {
                const response = {
                    success: false,
                    error: 'Recibo no encontrado'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: recibo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getReciboByNumero(req, res, next) {
        try {
            const { numero } = req.params;
            const recibo = await this.reciboService.getReciboByNumero(numero);
            if (!recibo) {
                const response = {
                    success: false,
                    error: 'Recibo no encontrado'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: recibo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getRecibosByPersona(req, res, next) {
        try {
            const { personaId } = req.params;
            const { tipo } = req.query;
            const tipoFilter = tipo;
            const recibos = await this.reciboService.getRecibosByPersona(personaId, tipoFilter);
            const response = {
                success: true,
                data: recibos,
                meta: {
                    personaId,
                    tipo: tipoFilter || 'todos',
                    total: recibos.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateRecibo(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = recibo_dto_1.updateReciboSchema.parse(req.body);
            const recibo = await this.reciboService.updateRecibo(id, validatedData);
            const response = {
                success: true,
                message: 'Recibo actualizado exitosamente',
                data: recibo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async changeEstado(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = recibo_dto_1.changeEstadoReciboSchema.parse(req.body);
            const recibo = await this.reciboService.changeEstado(id, validatedData);
            const response = {
                success: true,
                message: `Estado del recibo cambiado a ${validatedData.nuevoEstado}`,
                data: recibo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteRecibo(req, res, next) {
        try {
            const { id } = req.params;
            const recibo = await this.reciboService.deleteRecibo(id);
            const response = {
                success: true,
                message: 'Recibo eliminado exitosamente',
                data: recibo
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async createBulkRecibos(req, res, next) {
        try {
            const validatedData = recibo_dto_1.createBulkRecibosSchema.parse(req.body);
            const result = await this.reciboService.createBulkRecibos(validatedData);
            const response = {
                success: true,
                message: `Creación masiva completada: ${result.count} recibos creados`,
                data: {
                    created: result.count,
                    errors: result.errors
                },
                meta: {
                    totalAttempted: validatedData.recibos.length,
                    successful: result.count,
                    failed: result.errors.length
                }
            };
            const statusCode = result.errors.length > 0 ? 207 : enums_1.HttpStatus.CREATED;
            res.status(statusCode).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteBulkRecibos(req, res, next) {
        try {
            const validatedData = recibo_dto_1.deleteBulkRecibosSchema.parse(req.body);
            const result = await this.reciboService.deleteBulkRecibos(validatedData);
            const response = {
                success: true,
                message: `${result.count} recibos eliminados`,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateBulkEstados(req, res, next) {
        try {
            const validatedData = recibo_dto_1.updateBulkEstadosSchema.parse(req.body);
            const result = await this.reciboService.updateBulkEstados(validatedData);
            const response = {
                success: true,
                message: `${result.count} recibos actualizados a estado ${validatedData.nuevoEstado}`,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async searchRecibos(req, res, next) {
        try {
            const searchData = recibo_dto_1.reciboSearchSchema.parse(req.query);
            const recibos = await this.reciboService.searchRecibos(searchData);
            const response = {
                success: true,
                data: recibos,
                meta: {
                    searchTerm: searchData.search,
                    searchBy: searchData.searchBy,
                    total: recibos.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getStatistics(req, res, next) {
        try {
            const statsData = recibo_dto_1.reciboStatsSchema.parse(req.query);
            const stats = await this.reciboService.getStatistics(statsData);
            const response = {
                success: true,
                data: stats,
                meta: {
                    period: `${statsData.fechaDesde} - ${statsData.fechaHasta}`,
                    groupBy: statsData.agruparPor
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getVencidos(req, res, next) {
        try {
            const recibos = await this.reciboService.getVencidos();
            const response = {
                success: true,
                data: recibos,
                meta: {
                    total: recibos.length,
                    timestamp: new Date().toISOString()
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
            const recibos = await this.reciboService.getPendientes();
            const response = {
                success: true,
                data: recibos,
                meta: {
                    total: recibos.length,
                    timestamp: new Date().toISOString()
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async processVencidos(req, res, next) {
        try {
            const result = await this.reciboService.processVencidos();
            const response = {
                success: true,
                message: `Procesamiento de vencidos completado: ${result.count} recibos actualizados`,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const [pendientes, vencidos, stats] = await Promise.all([
                this.reciboService.getPendientes(),
                this.reciboService.getVencidos(),
                this.reciboService.getStatistics({
                    fechaDesde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    fechaHasta: new Date().toISOString(),
                    agruparPor: 'tipo'
                })
            ]);
            const response = {
                success: true,
                data: {
                    pendientes: pendientes.slice(0, 10),
                    vencidos: vencidos.slice(0, 10),
                    monthlyStats: stats
                },
                meta: {
                    pendientesCount: pendientes.length,
                    vencidosCount: vencidos.length,
                    timestamp: new Date().toISOString()
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getRecibosPorTipo(req, res, next) {
        try {
            const { tipo } = req.params;
            const query = recibo_dto_1.reciboQuerySchema.parse({ ...req.query, tipo });
            const result = await this.reciboService.getRecibos(query);
            const response = {
                success: true,
                data: result.data,
                meta: {
                    tipo,
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
    async getRecibosPorEstado(req, res, next) {
        try {
            const { estado } = req.params;
            const query = recibo_dto_1.reciboQuerySchema.parse({ ...req.query, estado });
            const result = await this.reciboService.getRecibos(query);
            const response = {
                success: true,
                data: result.data,
                meta: {
                    estado,
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
    async getValidStateTransitions(req, res, next) {
        try {
            const transitions = {
                PENDIENTE: ['PAGADO', 'VENCIDO', 'CANCELADO'],
                VENCIDO: ['PAGADO', 'CANCELADO'],
                PAGADO: [],
                CANCELADO: []
            };
            const response = {
                success: true,
                data: transitions
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getFinancialSummary(req, res, next) {
        try {
            const { fechaDesde, fechaHasta } = req.query;
            if (!fechaDesde || !fechaHasta) {
                const response = {
                    success: false,
                    error: 'Parámetros fechaDesde y fechaHasta son requeridos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const [tipoStats, estadoStats] = await Promise.all([
                this.reciboService.getStatistics({
                    fechaDesde: fechaDesde,
                    fechaHasta: fechaHasta,
                    agruparPor: 'tipo'
                }),
                this.reciboService.getStatistics({
                    fechaDesde: fechaDesde,
                    fechaHasta: fechaHasta,
                    agruparPor: 'estado'
                })
            ]);
            const response = {
                success: true,
                data: {
                    porTipo: tipoStats,
                    porEstado: estadoStats
                },
                meta: {
                    period: `${fechaDesde} - ${fechaHasta}`
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReciboController = ReciboController;
//# sourceMappingURL=recibo.controller.js.map