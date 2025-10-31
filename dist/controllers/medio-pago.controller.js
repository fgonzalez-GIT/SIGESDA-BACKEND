"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedioPagoController = void 0;
const medio_pago_dto_1 = require("@/dto/medio-pago.dto");
const zod_1 = require("zod");
const logger_1 = require("@/utils/logger");
class MedioPagoController {
    constructor(medioPagoService) {
        this.medioPagoService = medioPagoService;
    }
    async create(req, res, next) {
        try {
            const validatedData = medio_pago_dto_1.CreateMedioPagoSchema.parse(req.body);
            const medioPago = await this.medioPagoService.create(validatedData);
            res.status(201).json({
                success: true,
                message: 'Medio de pago creado exitosamente',
                data: medioPago
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: error.errors
                });
                return;
            }
            logger_1.logger.error('Error creando medio de pago:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error creando medio de pago'
            });
        }
    }
    async getAll(req, res, next) {
        try {
            const filters = medio_pago_dto_1.MedioPagoFilterSchema.parse(req.query);
            const result = await this.medioPagoService.findAll(filters);
            res.json({
                success: true,
                data: result.mediosPago,
                pagination: {
                    page: filters.page,
                    limit: filters.limit,
                    total: result.total,
                    pages: result.pages
                }
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros de consulta inválidos',
                    errors: error.errors
                });
                return;
            }
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const medioPago = await this.medioPagoService.findById(id);
            if (!medioPago) {
                res.status(404).json({
                    success: false,
                    message: 'Medio de pago no encontrado'
                });
                return;
            }
            res.json({
                success: true,
                data: medioPago
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getByReciboId(req, res, next) {
        try {
            const { reciboId } = req.params;
            const mediosPago = await this.medioPagoService.findByReciboId(reciboId);
            res.json({
                success: true,
                data: mediosPago,
                count: mediosPago.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = medio_pago_dto_1.UpdateMedioPagoSchema.parse(req.body);
            const medioPago = await this.medioPagoService.update(id, validatedData);
            res.json({
                success: true,
                message: 'Medio de pago actualizado exitosamente',
                data: medioPago
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: error.errors
                });
                return;
            }
            logger_1.logger.error('Error actualizando medio de pago:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error actualizando medio de pago'
            });
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.medioPagoService.delete(id);
            res.json({
                success: true,
                message: 'Medio de pago eliminado exitosamente'
            });
        }
        catch (error) {
            logger_1.logger.error('Error eliminando medio de pago:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error eliminando medio de pago'
            });
        }
    }
    async search(req, res, next) {
        try {
            const searchData = medio_pago_dto_1.MedioPagoSearchSchema.parse(req.query);
            const mediosPago = await this.medioPagoService.search(searchData);
            res.json({
                success: true,
                data: mediosPago,
                count: mediosPago.length
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros de búsqueda inválidos',
                    errors: error.errors
                });
                return;
            }
            next(error);
        }
    }
    async getStatistics(req, res, next) {
        try {
            const statsData = medio_pago_dto_1.MedioPagoStatsSchema.parse(req.query);
            const statistics = await this.medioPagoService.getStatistics(statsData);
            res.json({
                success: true,
                data: statistics
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros de estadísticas inválidos',
                    errors: error.errors
                });
                return;
            }
            next(error);
        }
    }
    async deleteBulk(req, res, next) {
        try {
            const validatedData = medio_pago_dto_1.DeleteBulkMediosPagoSchema.parse(req.body);
            const result = await this.medioPagoService.deleteBulk(validatedData);
            const statusCode = result.errores.length > 0 ? 207 : 200;
            res.status(statusCode).json({
                success: true,
                message: `Se eliminaron ${result.eliminados} medios de pago${result.errores.length > 0 ? ` con ${result.errores.length} errores` : ''}`,
                data: result
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: error.errors
                });
                return;
            }
            logger_1.logger.error('Error en eliminación masiva:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error en eliminación masiva'
            });
        }
    }
    async validatePayment(req, res, next) {
        try {
            const validatedData = medio_pago_dto_1.ValidarPagoCompletoSchema.parse(req.body);
            const validation = await this.medioPagoService.validatePayment(validatedData);
            res.json({
                success: true,
                data: validation
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: error.errors
                });
                return;
            }
            next(error);
        }
    }
    async getConciliacionBancaria(req, res, next) {
        try {
            const validatedData = medio_pago_dto_1.ConciliacionBancariaSchema.parse(req.query);
            const conciliacion = await this.medioPagoService.getConciliacionBancaria(validatedData);
            res.json({
                success: true,
                data: conciliacion
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros de conciliación inválidos',
                    errors: error.errors
                });
                return;
            }
            next(error);
        }
    }
    async getByTipo(req, res, next) {
        try {
            const { tipo } = req.params;
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const tiposValidos = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE'];
            if (!tiposValidos.includes(tipo.toUpperCase())) {
                res.status(400).json({
                    success: false,
                    message: 'Tipo de medio de pago inválido'
                });
                return;
            }
            const mediosPago = await this.medioPagoService.findByTipo(tipo.toUpperCase(), limit);
            res.json({
                success: true,
                data: mediosPago,
                count: mediosPago.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const dashboard = await this.medioPagoService.getDashboard();
            res.json({
                success: true,
                data: dashboard
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getQuickStats(req, res, next) {
        try {
            const stats = await this.medioPagoService.getQuickStats();
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            next(error);
        }
    }
    async validateReciboPayment(req, res, next) {
        try {
            const { reciboId } = req.params;
            const tolerancia = req.query.tolerancia ? parseFloat(req.query.tolerancia) : 0.01;
            const validation = await this.medioPagoService.validatePayment({
                reciboId,
                tolerancia
            });
            res.json({
                success: true,
                data: validation
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getEfectivo(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const mediosPago = await this.medioPagoService.findByTipo('EFECTIVO', limit);
            res.json({
                success: true,
                data: mediosPago,
                count: mediosPago.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCheques(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const mediosPago = await this.medioPagoService.findByTipo('CHEQUE', limit);
            res.json({
                success: true,
                data: mediosPago,
                count: mediosPago.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTransferencias(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const mediosPago = await this.medioPagoService.findByTipo('TRANSFERENCIA', limit);
            res.json({
                success: true,
                data: mediosPago,
                count: mediosPago.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTarjetas(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const [tarjetasDebito, tarjetasCredito] = await Promise.all([
                this.medioPagoService.findByTipo('TARJETA_DEBITO', limit),
                this.medioPagoService.findByTipo('TARJETA_CREDITO', limit)
            ]);
            const allTarjetas = [...tarjetasDebito, ...tarjetasCredito]
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                .slice(0, limit);
            res.json({
                success: true,
                data: allTarjetas,
                count: allTarjetas.length,
                breakdown: {
                    debito: tarjetasDebito.length,
                    credito: tarjetasCredito.length
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getResumenPeriodo(req, res, next) {
        try {
            const { fechaDesde, fechaHasta } = req.query;
            if (!fechaDesde || !fechaHasta) {
                res.status(400).json({
                    success: false,
                    message: 'Se requieren las fechas desde y hasta'
                });
                return;
            }
            const statsData = medio_pago_dto_1.MedioPagoStatsSchema.parse({
                fechaDesde: fechaDesde,
                fechaHasta: fechaHasta,
                agruparPor: 'tipo'
            });
            const statistics = await this.medioPagoService.getStatistics(statsData);
            res.json({
                success: true,
                data: statistics,
                periodo: {
                    desde: fechaDesde,
                    hasta: fechaHasta
                }
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros de período inválidos',
                    errors: error.errors
                });
                return;
            }
            next(error);
        }
    }
}
exports.MedioPagoController = MedioPagoController;
//# sourceMappingURL=medio-pago.controller.js.map