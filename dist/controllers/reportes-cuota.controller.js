"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesCuotaController = void 0;
const reportes_cuota_dto_1 = require("@/dto/reportes-cuota.dto");
const enums_1 = require("@/types/enums");
class ReportesCuotaController {
    constructor(reportesService) {
        this.reportesService = reportesService;
    }
    async getDashboard(req, res, next) {
        try {
            const validatedQuery = reportes_cuota_dto_1.dashboardCuotasSchema.parse(req.query);
            const dashboard = await this.reportesService.getDashboard(validatedQuery);
            const response = {
                success: true,
                message: 'Dashboard de cuotas generado exitosamente',
                data: dashboard
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getReportePorCategoria(req, res, next) {
        try {
            const validatedQuery = reportes_cuota_dto_1.reportePorCategoriaSchema.parse(req.query);
            const reporte = await this.reportesService.getReportePorCategoria(validatedQuery);
            const response = {
                success: true,
                message: 'Reporte por categoría generado exitosamente',
                data: reporte
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAnalisisDescuentos(req, res, next) {
        try {
            const validatedQuery = reportes_cuota_dto_1.analisisDescuentosSchema.parse(req.query);
            const analisis = await this.reportesService.getAnalisisDescuentos(validatedQuery);
            const response = {
                success: true,
                message: 'Análisis de descuentos generado exitosamente',
                data: analisis
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getReporteExenciones(req, res, next) {
        try {
            const validatedQuery = reportes_cuota_dto_1.reporteExencionesSchema.parse(req.query);
            const reporte = await this.reportesService.getReporteExenciones(validatedQuery);
            const response = {
                success: true,
                message: 'Reporte de exenciones generado exitosamente',
                data: reporte
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getReporteComparativo(req, res, next) {
        try {
            const validatedQuery = reportes_cuota_dto_1.reporteComparativoSchema.parse(req.query);
            const reporte = await this.reportesService.getReporteComparativo(validatedQuery);
            const response = {
                success: true,
                message: 'Reporte comparativo generado exitosamente',
                data: reporte
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEstadisticasRecaudacion(req, res, next) {
        try {
            const validatedQuery = reportes_cuota_dto_1.estadisticasRecaudacionSchema.parse(req.query);
            const estadisticas = await this.reportesService.getEstadisticasRecaudacion(validatedQuery);
            const response = {
                success: true,
                message: 'Estadísticas de recaudación generadas exitosamente',
                data: estadisticas
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async exportarReporte(req, res, next) {
        try {
            const validatedData = reportes_cuota_dto_1.exportarReporteSchema.parse(req.body);
            if (validatedData.formato !== 'json') {
                const response = {
                    success: false,
                    error: `Formato '${validatedData.formato}' no implementado aún. Use 'json' por ahora.`
                };
                res.status(enums_1.HttpStatus.NOT_IMPLEMENTED).json(response);
                return;
            }
            let data;
            switch (validatedData.tipoReporte) {
                case 'dashboard':
                    data = await this.reportesService.getDashboard(validatedData.parametros);
                    break;
                case 'categoria':
                    data = await this.reportesService.getReportePorCategoria(validatedData.parametros);
                    break;
                case 'descuentos':
                    data = await this.reportesService.getAnalisisDescuentos(validatedData.parametros);
                    break;
                case 'exenciones':
                    data = await this.reportesService.getReporteExenciones(validatedData.parametros);
                    break;
                case 'comparativo':
                    data = await this.reportesService.getReporteComparativo(validatedData.parametros);
                    break;
                case 'recaudacion':
                    data = await this.reportesService.getEstadisticasRecaudacion(validatedData.parametros);
                    break;
                default:
                    const response = {
                        success: false,
                        error: `Tipo de reporte '${validatedData.tipoReporte}' no reconocido`
                    };
                    res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                    return;
            }
            const response = {
                success: true,
                message: `Reporte '${validatedData.tipoReporte}' exportado exitosamente`,
                data: {
                    formato: validatedData.formato,
                    tipoReporte: validatedData.tipoReporte,
                    fechaGeneracion: new Date(),
                    contenido: data
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportesCuotaController = ReportesCuotaController;
//# sourceMappingURL=reportes-cuota.controller.js.map