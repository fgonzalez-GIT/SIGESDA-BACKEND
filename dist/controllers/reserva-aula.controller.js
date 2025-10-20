"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaAulaController = void 0;
const reserva_aula_dto_1 = require("@/dto/reserva-aula.dto");
const enums_1 = require("@/types/enums");
class ReservaAulaController {
    constructor(reservaAulaService) {
        this.reservaAulaService = reservaAulaService;
    }
    async createReserva(req, res, next) {
        try {
            const validatedData = reserva_aula_dto_1.createReservaAulaSchema.parse(req.body);
            const reserva = await this.reservaAulaService.createReserva(validatedData);
            const response = {
                success: true,
                message: 'Reserva de aula creada exitosamente',
                data: reserva
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getReservas(req, res, next) {
        try {
            const query = reserva_aula_dto_1.reservaAulaQuerySchema.parse(req.query);
            const result = await this.reservaAulaService.getReservas(query);
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
    async getReservaById(req, res, next) {
        try {
            const { id } = req.params;
            const reserva = await this.reservaAulaService.getReservaById(id);
            if (!reserva) {
                const response = {
                    success: false,
                    error: 'Reserva de aula no encontrada'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: reserva
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getReservasByAula(req, res, next) {
        try {
            const { aulaId } = req.params;
            const { incluirPasadas } = req.query;
            const incluirPasadasFlag = incluirPasadas === 'true';
            const reservas = await this.reservaAulaService.getReservasByAula(aulaId, incluirPasadasFlag);
            const response = {
                success: true,
                data: reservas,
                meta: {
                    aulaId,
                    incluirPasadas: incluirPasadasFlag,
                    total: reservas.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getReservasByDocente(req, res, next) {
        try {
            const { docenteId } = req.params;
            const { incluirPasadas } = req.query;
            const incluirPasadasFlag = incluirPasadas === 'true';
            const reservas = await this.reservaAulaService.getReservasByDocente(docenteId, incluirPasadasFlag);
            const response = {
                success: true,
                data: reservas,
                meta: {
                    docenteId,
                    incluirPasadas: incluirPasadasFlag,
                    total: reservas.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getReservasByActividad(req, res, next) {
        try {
            const { actividadId } = req.params;
            const { incluirPasadas } = req.query;
            const incluirPasadasFlag = incluirPasadas === 'true';
            const reservas = await this.reservaAulaService.getReservasByActividad(actividadId, incluirPasadasFlag);
            const response = {
                success: true,
                data: reservas,
                meta: {
                    actividadId,
                    incluirPasadas: incluirPasadasFlag,
                    total: reservas.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateReserva(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = reserva_aula_dto_1.updateReservaAulaSchema.parse(req.body);
            const reserva = await this.reservaAulaService.updateReserva(id, validatedData);
            const response = {
                success: true,
                message: 'Reserva de aula actualizada exitosamente',
                data: reserva
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteReserva(req, res, next) {
        try {
            const { id } = req.params;
            const reserva = await this.reservaAulaService.deleteReserva(id);
            const response = {
                success: true,
                message: 'Reserva de aula eliminada exitosamente',
                data: reserva
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async detectConflicts(req, res, next) {
        try {
            const validatedData = reserva_aula_dto_1.conflictDetectionSchema.parse(req.body);
            const conflicts = await this.reservaAulaService.detectConflicts(validatedData);
            const response = {
                success: true,
                data: {
                    hasConflicts: conflicts.length > 0,
                    conflicts,
                    conflictCount: conflicts.length
                },
                meta: {
                    aulaId: validatedData.aulaId,
                    period: `${validatedData.fechaInicio} - ${validatedData.fechaFin}`
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async createBulkReservas(req, res, next) {
        try {
            const validatedData = reserva_aula_dto_1.createBulkReservasSchema.parse(req.body);
            const result = await this.reservaAulaService.createBulkReservas(validatedData);
            const response = {
                success: true,
                message: `Creación masiva completada: ${result.count} reservas creadas`,
                data: {
                    created: result.count,
                    errors: result.errors
                },
                meta: {
                    totalAttempted: validatedData.reservas.length,
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
    async deleteBulkReservas(req, res, next) {
        try {
            const validatedData = reserva_aula_dto_1.deleteBulkReservasSchema.parse(req.body);
            const result = await this.reservaAulaService.deleteBulkReservas(validatedData);
            const response = {
                success: true,
                message: `${result.count} reservas eliminadas`,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async createRecurringReserva(req, res, next) {
        try {
            const validatedData = reserva_aula_dto_1.createRecurringReservaSchema.parse(req.body);
            const result = await this.reservaAulaService.createRecurringReserva(validatedData);
            const response = {
                success: true,
                message: `Reservas recurrentes creadas: ${result.count} reservas`,
                data: {
                    created: result.count,
                    errors: result.errors
                },
                meta: {
                    recurrenceType: validatedData.recurrencia.tipo,
                    interval: validatedData.recurrencia.intervalo,
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
    async searchReservas(req, res, next) {
        try {
            const searchData = reserva_aula_dto_1.reservaSearchSchema.parse(req.query);
            const reservas = await this.reservaAulaService.searchReservas(searchData);
            const response = {
                success: true,
                data: reservas,
                meta: {
                    searchTerm: searchData.search,
                    searchBy: searchData.searchBy,
                    total: reservas.length
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
            const statsData = reserva_aula_dto_1.reservaStatsSchema.parse(req.query);
            const stats = await this.reservaAulaService.getStatistics(statsData);
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
    async getUpcomingReservations(req, res, next) {
        try {
            const { limit } = req.query;
            const limitNumber = limit ? parseInt(limit) : 10;
            const reservas = await this.reservaAulaService.getUpcomingReservations(limitNumber);
            const response = {
                success: true,
                data: reservas,
                meta: {
                    limit: limitNumber,
                    total: reservas.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getCurrentReservations(req, res, next) {
        try {
            const reservas = await this.reservaAulaService.getCurrentReservations();
            const response = {
                success: true,
                data: reservas,
                meta: {
                    timestamp: new Date().toISOString(),
                    total: reservas.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const [upcoming, current, stats] = await Promise.all([
                this.reservaAulaService.getUpcomingReservations(5),
                this.reservaAulaService.getCurrentReservations(),
                this.reservaAulaService.getStatistics({
                    fechaDesde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    fechaHasta: new Date().toISOString(),
                    agruparPor: 'aula'
                })
            ]);
            const response = {
                success: true,
                data: {
                    upcoming,
                    current,
                    weeklyStats: stats
                },
                meta: {
                    upcomingCount: upcoming.length,
                    currentCount: current.length,
                    timestamp: new Date().toISOString()
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async checkAvailability(req, res, next) {
        try {
            const { aulaId, fechaInicio, fechaFin } = req.query;
            if (!aulaId || !fechaInicio || !fechaFin) {
                const response = {
                    success: false,
                    error: 'Parámetros aulaId, fechaInicio y fechaFin son requeridos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const conflicts = await this.reservaAulaService.detectConflicts({
                aulaId: aulaId,
                fechaInicio: fechaInicio,
                fechaFin: fechaFin
            });
            const isAvailable = conflicts.length === 0;
            const response = {
                success: true,
                data: {
                    available: isAvailable,
                    conflicts: isAvailable ? [] : conflicts
                },
                meta: {
                    aulaId,
                    period: `${fechaInicio} - ${fechaFin}`,
                    conflictCount: conflicts.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReservaAulaController = ReservaAulaController;
//# sourceMappingURL=reserva-aula.controller.js.map