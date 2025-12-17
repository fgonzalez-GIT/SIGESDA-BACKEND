"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CuotaController = void 0;
const cuota_dto_1 = require("@/dto/cuota.dto");
const enums_1 = require("@/types/enums");
const logger_1 = require("@/utils/logger");
class CuotaController {
    constructor(cuotaService) {
        this.cuotaService = cuotaService;
    }
    async createCuota(req, res, next) {
        try {
            const validatedData = cuota_dto_1.createCuotaSchema.parse(req.body);
            const cuota = await this.cuotaService.createCuota(validatedData);
            const response = {
                success: true,
                message: 'Cuota creada exitosamente',
                data: cuota
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getCuotas(req, res, next) {
        try {
            const query = cuota_dto_1.cuotaQuerySchema.parse(req.query);
            const result = await this.cuotaService.getCuotas(query);
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
    async getCuotaById(req, res, next) {
        try {
            const { id } = req.params;
            const cuota = await this.cuotaService.getCuotaById(parseInt(id));
            if (!cuota) {
                const response = {
                    success: false,
                    error: 'Cuota no encontrada'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: cuota
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getCuotaByReciboId(req, res, next) {
        try {
            const { reciboId } = req.params;
            const cuota = await this.cuotaService.getCuotaByReciboId(reciboId);
            if (!cuota) {
                const response = {
                    success: false,
                    error: 'Cuota no encontrada para el recibo especificado'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: cuota
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getCuotasPorPeriodo(req, res, next) {
        try {
            const { mes, anio } = req.params;
            const { categoria } = req.query;
            const cuotas = await this.cuotaService.getCuotasPorPeriodo(parseInt(mes), parseInt(anio), categoria);
            const response = {
                success: true,
                data: cuotas,
                meta: {
                    periodo: `${mes}/${anio}`,
                    categoria: categoria || 'todas',
                    total: cuotas.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getCuotasBySocio(req, res, next) {
        try {
            const { socioId } = req.params;
            const { limit } = req.query;
            const cuotas = await this.cuotaService.getCuotasBySocio(socioId, limit ? parseInt(limit) : undefined);
            const response = {
                success: true,
                data: cuotas,
                meta: {
                    socioId,
                    total: cuotas.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateCuota(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = cuota_dto_1.updateCuotaSchema.parse(req.body);
            const cuota = await this.cuotaService.updateCuota(parseInt(id), validatedData);
            const response = {
                success: true,
                message: 'Cuota actualizada exitosamente',
                data: cuota
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCuota(req, res, next) {
        try {
            const { id } = req.params;
            const cuota = await this.cuotaService.deleteCuota(parseInt(id));
            const response = {
                success: true,
                message: 'Cuota eliminada exitosamente',
                data: cuota
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async generarCuotas(req, res, next) {
        try {
            const validatedData = cuota_dto_1.generarCuotasSchema.parse(req.body);
            const result = await this.cuotaService.generarCuotas(validatedData);
            const response = {
                success: true,
                message: `Generación de cuotas completada: ${result.generated} cuotas creadas`,
                data: {
                    generated: result.generated,
                    errors: result.errors,
                    cuotas: result.cuotas
                },
                meta: {
                    periodo: `${validatedData.mes}/${validatedData.anio}`,
                    totalGeneradas: result.generated,
                    errores: result.errors.length
                }
            };
            const statusCode = result.errors.length > 0 ? 207 : enums_1.HttpStatus.CREATED;
            res.status(statusCode).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async generarCuotasConItems(req, res, next) {
        try {
            const validatedData = cuota_dto_1.generarCuotasSchema.parse(req.body);
            logger_1.logger.info(`[CONTROLLER] Iniciando generación de cuotas V2 - ${validatedData.mes}/${validatedData.anio}`);
            const result = await this.cuotaService.generarCuotasConItems(validatedData);
            const response = {
                success: true,
                message: `Generación de cuotas V2 completada: ${result.generated} cuotas creadas con sistema de ítems`,
                data: {
                    generated: result.generated,
                    errors: result.errors,
                    cuotas: result.cuotas,
                    descuentos: result.resumenDescuentos
                },
                meta: {
                    periodo: `${validatedData.mes}/${validatedData.anio}`,
                    totalGeneradas: result.generated,
                    errores: result.errors.length,
                    aplicarDescuentos: validatedData.aplicarDescuentos || true,
                    ...(result.resumenDescuentos && {
                        sociosConDescuento: result.resumenDescuentos.totalSociosConDescuento,
                        montoTotalDescuentos: result.resumenDescuentos.montoTotalDescuentos,
                        reglasUtilizadas: Object.keys(result.resumenDescuentos.reglasAplicadas).length
                    })
                }
            };
            const statusCode = result.errors.length > 0 ? 207 : enums_1.HttpStatus.CREATED;
            logger_1.logger.info(`[CONTROLLER] Generación completada - ${result.generated} cuotas creadas, ` +
                `${result.errors.length} errores${result.resumenDescuentos ? `, ${result.resumenDescuentos.totalSociosConDescuento} con descuentos` : ''}`);
            res.status(statusCode).json(response);
        }
        catch (error) {
            logger_1.logger.error('[CONTROLLER] Error en generación de cuotas V2:', error);
            next(error);
        }
    }
    async calcularMontoCuota(req, res, next) {
        try {
            const validatedData = cuota_dto_1.calcularCuotaSchema.parse(req.body);
            const calculo = await this.cuotaService.calcularMontoCuota(validatedData);
            const response = {
                success: true,
                data: calculo,
                meta: {
                    categoria: validatedData.categoria,
                    periodo: `${validatedData.mes}/${validatedData.anio}`
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async searchCuotas(req, res, next) {
        try {
            const searchData = cuota_dto_1.cuotaSearchSchema.parse(req.query);
            const cuotas = await this.cuotaService.searchCuotas(searchData);
            const response = {
                success: true,
                data: cuotas,
                meta: {
                    searchTerm: searchData.search,
                    searchBy: searchData.searchBy,
                    total: cuotas.length
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
            const statsData = cuota_dto_1.cuotaStatsSchema.parse(req.query);
            if (!statsData.fechaDesde) {
                const now = new Date();
                const startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                statsData.fechaDesde = startDate.toISOString();
            }
            if (!statsData.fechaHasta) {
                statsData.fechaHasta = new Date().toISOString();
            }
            const stats = await this.cuotaService.getStatistics(statsData);
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
    async getVencidas(req, res, next) {
        try {
            const cuotas = await this.cuotaService.getVencidas();
            const response = {
                success: true,
                data: cuotas,
                meta: {
                    total: cuotas.length,
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
            const cuotas = await this.cuotaService.getPendientes();
            const response = {
                success: true,
                data: cuotas,
                meta: {
                    total: cuotas.length,
                    timestamp: new Date().toISOString()
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteBulkCuotas(req, res, next) {
        try {
            const validatedData = cuota_dto_1.deleteBulkCuotasSchema.parse(req.body);
            const result = await this.cuotaService.deleteBulkCuotas(validatedData);
            const response = {
                success: true,
                message: `${result.count} cuotas eliminadas exitosamente`,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async recalcularCuotas(req, res, next) {
        try {
            const validatedData = cuota_dto_1.recalcularCuotasSchema.parse(req.body);
            const result = await this.cuotaService.recalcularCuotas(validatedData);
            const response = {
                success: true,
                message: `Recálculo completado: ${result.updated} cuotas actualizadas`,
                data: {
                    updated: result.updated,
                    errors: result.errors
                },
                meta: {
                    periodo: `${validatedData.mes}/${validatedData.anio}`,
                    categoria: validatedData.categoria,
                    errores: result.errors.length
                }
            };
            const statusCode = result.errors.length > 0 ? 207 : enums_1.HttpStatus.OK;
            res.status(statusCode).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getResumenMensual(req, res, next) {
        try {
            const { mes, anio } = req.params;
            const resumen = await this.cuotaService.getResumenMensual(parseInt(mes), parseInt(anio));
            const response = {
                success: true,
                data: resumen,
                meta: {
                    periodo: `${mes}/${anio}`,
                    timestamp: new Date().toISOString()
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async generarReporte(req, res, next) {
        try {
            const validatedData = cuota_dto_1.reporteCuotasSchema.parse({ ...req.params, ...req.query });
            const reporte = await this.cuotaService.generarReporte(validatedData);
            const response = {
                success: true,
                data: reporte,
                meta: {
                    formato: validatedData.formato,
                    periodo: `${validatedData.mes}/${validatedData.anio}`,
                    generadoEn: reporte.generadoEn
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
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            const [pendientes, vencidas, resumenActual] = await Promise.all([
                this.cuotaService.getPendientes(),
                this.cuotaService.getVencidas(),
                this.cuotaService.getResumenMensual(currentMonth, currentYear)
            ]);
            const response = {
                success: true,
                data: {
                    pendientes: pendientes.slice(0, 10),
                    vencidas: vencidas.slice(0, 10),
                    resumenMesActual: resumenActual
                },
                meta: {
                    pendientesCount: pendientes.length,
                    vencidasCount: vencidas.length,
                    mesActual: `${currentMonth}/${currentYear}`,
                    timestamp: new Date().toISOString()
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getPeriodosDisponibles(req, res, next) {
        try {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            const periodos = [];
            for (let year = currentYear - 1; year <= currentYear + 1; year++) {
                for (let month = 1; month <= 12; month++) {
                    const periodDate = new Date(year, month - 1, 1);
                    const maxDate = new Date(currentYear, currentMonth + 1, 1);
                    if (periodDate <= maxDate) {
                        periodos.push({
                            mes: month,
                            anio: year,
                            display: `${this.getNombreMes(month)} ${year}`,
                            value: `${month}/${year}`
                        });
                    }
                }
            }
            const response = {
                success: true,
                data: periodos.reverse(),
                meta: {
                    total: periodos.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async validarGeneracionCuotas(req, res, next) {
        try {
            const { mes, anio } = req.params;
            const { categoria } = req.query;
            const cuotasExistentes = await this.cuotaService.getCuotasPorPeriodo(parseInt(mes), parseInt(anio), categoria);
            const sociosPendientes = await this.cuotaService['cuotaRepository'].getCuotasPorGenerar(parseInt(mes), parseInt(anio), categoria ? [categoria] : undefined);
            const response = {
                success: true,
                data: {
                    puedeGenerar: sociosPendientes.length > 0,
                    cuotasExistentes: cuotasExistentes.length,
                    sociosPendientes: sociosPendientes.length,
                    detallesSocios: sociosPendientes.map(s => ({
                        id: s.id,
                        nombre: `${s.nombre} ${s.apellido}`,
                        numeroSocio: s.numeroSocio,
                        categoria: s.categoria
                    }))
                },
                meta: {
                    periodo: `${mes}/${anio}`,
                    categoria: categoria || 'todas'
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async recalcularCuotaById(req, res, next) {
        try {
            const cuotaId = parseInt(req.params.id);
            const body = req.body || {};
            const validatedData = cuota_dto_1.recalcularCuotaSchema.parse({
                cuotaId,
                aplicarAjustes: body.aplicarAjustes ?? true,
                aplicarExenciones: body.aplicarExenciones ?? true,
                aplicarDescuentos: body.aplicarDescuentos ?? true,
                usuario: body.usuario
            });
            logger_1.logger.info(`[CONTROLLER] Recalculando cuota ID ${cuotaId}`);
            const result = await this.cuotaService.recalcularCuota(validatedData);
            const response = {
                success: true,
                message: result.cambios.montoTotal.diferencia !== 0
                    ? `Cuota recalculada con éxito. Cambio: $${result.cambios.montoTotal.diferencia.toFixed(2)}`
                    : 'Cuota recalculada sin cambios en el monto',
                data: result,
                meta: {
                    cuotaId,
                    cambioMontoTotal: result.cambios.montoTotal.diferencia,
                    ajustesAplicados: result.cambios.ajustesAplicados.length,
                    exencionesAplicadas: result.cambios.exencionesAplicadas.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            logger_1.logger.error('[CONTROLLER] Error recalculando cuota:', error);
            next(error);
        }
    }
    async regenerarCuotasDelPeriodo(req, res, next) {
        try {
            const validatedData = cuota_dto_1.regenerarCuotasSchema.parse(req.body);
            logger_1.logger.info(`[CONTROLLER] Regenerando cuotas - ${validatedData.mes}/${validatedData.anio}`);
            const result = await this.cuotaService.regenerarCuotas(validatedData);
            const response = {
                success: true,
                message: `${result.generadas} cuotas regeneradas exitosamente (${result.eliminadas} eliminadas)`,
                data: result,
                meta: {
                    periodo: `${validatedData.mes}/${validatedData.anio}`,
                    categoriaId: validatedData.categoriaId,
                    personaId: validatedData.personaId,
                    eliminadas: result.eliminadas,
                    generadas: result.generadas
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            logger_1.logger.error('[CONTROLLER] Error regenerando cuotas:', error);
            next(error);
        }
    }
    async previewRecalculoCuotas(req, res, next) {
        try {
            const validatedData = cuota_dto_1.previewRecalculoSchema.parse(req.body);
            logger_1.logger.info(`[CONTROLLER] Preview de recálculo - cuotaId: ${validatedData.cuotaId}, periodo: ${validatedData.mes}/${validatedData.anio}`);
            const result = await this.cuotaService.previewRecalculo(validatedData);
            const response = {
                success: true,
                message: `Preview completado: ${result.resumen.conCambios} cuotas con cambios de ${result.resumen.totalCuotas} analizadas`,
                data: result,
                meta: {
                    cuotaId: validatedData.cuotaId,
                    periodo: validatedData.mes && validatedData.anio ? `${validatedData.mes}/${validatedData.anio}` : null,
                    categoriaId: validatedData.categoriaId,
                    personaId: validatedData.personaId,
                    ...result.resumen
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            logger_1.logger.error('[CONTROLLER] Error en preview de recálculo:', error);
            next(error);
        }
    }
    async compararCuotaConRecalculo(req, res, next) {
        try {
            const cuotaId = parseInt(req.params.id);
            const validatedData = cuota_dto_1.compararCuotaSchema.parse({ cuotaId });
            logger_1.logger.info(`[CONTROLLER] Comparando cuota ID ${cuotaId}`);
            const result = await this.cuotaService.compararCuota(cuotaId);
            const response = {
                success: true,
                message: result.diferencias.esSignificativo
                    ? `Diferencia significativa encontrada: $${result.diferencias.montoTotal.toFixed(2)} (${result.diferencias.porcentajeDiferencia.toFixed(2)}%)`
                    : 'Sin diferencias significativas',
                data: result,
                meta: {
                    cuotaId,
                    esSignificativo: result.diferencias.esSignificativo,
                    diferenciaMonto: result.diferencias.montoTotal,
                    diferenciaPorcentaje: result.diferencias.porcentajeDiferencia,
                    ajustesDisponibles: result.recalculada.ajustesAplicados.length,
                    exencionesDisponibles: result.recalculada.exencionesAplicadas.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            logger_1.logger.error('[CONTROLLER] Error comparando cuota:', error);
            next(error);
        }
    }
    getNombreMes(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1] || 'Mes inválido';
    }
}
exports.CuotaController = CuotaController;
//# sourceMappingURL=cuota.controller.js.map