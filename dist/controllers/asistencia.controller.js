"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsistenciaController = void 0;
const asistencia_dto_1 = require("@/dto/asistencia.dto");
class AsistenciaController {
    constructor(asistenciaService) {
        this.asistenciaService = asistenciaService;
    }
    async createAsistencia(req, res, next) {
        try {
            const validatedData = asistencia_dto_1.createAsistenciaSchema.parse(req.body);
            const asistencia = await this.asistenciaService.create(validatedData);
            res.status(201).json({
                success: true,
                message: 'Asistencia registrada exitosamente',
                data: asistencia
            });
        }
        catch (error) {
            next(error);
        }
    }
    async registroMasivo(req, res, next) {
        try {
            const validatedData = asistencia_dto_1.registroAsistenciaMasivaSchema.parse(req.body);
            const resultado = await this.asistenciaService.registroMasivo(validatedData);
            res.status(201).json({
                success: true,
                message: resultado.mensaje,
                data: resultado
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAsistencias(req, res, next) {
        try {
            const query = asistencia_dto_1.asistenciaQuerySchema.parse(req.query);
            const result = await this.asistenciaService.findAll(query);
            res.json({
                success: true,
                message: 'Asistencias obtenidas exitosamente',
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAsistenciaById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de asistencia inválido'
                });
            }
            const asistencia = await this.asistenciaService.findById(id);
            res.json({
                success: true,
                message: 'Asistencia obtenida exitosamente',
                data: asistencia
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAsistenciasByParticipacion(req, res, next) {
        try {
            const participacionId = parseInt(req.params.participacionId);
            if (isNaN(participacionId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de participación inválido'
                });
            }
            const asistencias = await this.asistenciaService.findByParticipacion(participacionId);
            res.json({
                success: true,
                message: 'Asistencias de la participación obtenidas exitosamente',
                data: asistencias
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAsistenciasByActividad(req, res, next) {
        try {
            const actividadId = parseInt(req.params.actividadId);
            if (isNaN(actividadId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de actividad inválido'
                });
            }
            const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde) : undefined;
            const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta) : undefined;
            const asistencias = await this.asistenciaService.findByActividad(actividadId, fechaDesde, fechaHasta);
            res.json({
                success: true,
                message: 'Asistencias de la actividad obtenidas exitosamente',
                data: asistencias
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAsistenciasByPersona(req, res, next) {
        try {
            const { personaId } = req.params;
            const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde) : undefined;
            const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta) : undefined;
            const asistencias = await this.asistenciaService.findByPersona(personaId, fechaDesde, fechaHasta);
            res.json({
                success: true,
                message: 'Asistencias de la persona obtenidas exitosamente',
                data: asistencias
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateAsistencia(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de asistencia inválido'
                });
            }
            const validatedData = asistencia_dto_1.updateAsistenciaSchema.parse(req.body);
            const asistencia = await this.asistenciaService.update(id, validatedData);
            res.json({
                success: true,
                message: 'Asistencia actualizada exitosamente',
                data: asistencia
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteAsistencia(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de asistencia inválido'
                });
            }
            const asistencia = await this.asistenciaService.delete(id);
            res.json({
                success: true,
                message: 'Asistencia eliminada exitosamente',
                data: asistencia
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTasaAsistencia(req, res, next) {
        try {
            const participacionId = parseInt(req.params.participacionId);
            if (isNaN(participacionId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de participación inválido'
                });
            }
            const fechaDesde = req.query.fechaDesde;
            const fechaHasta = req.query.fechaHasta;
            const params = asistencia_dto_1.tasaAsistenciaSchema.parse({
                participacionId,
                fechaDesde,
                fechaHasta
            });
            const tasa = await this.asistenciaService.getTasaAsistencia(params);
            res.json({
                success: true,
                message: 'Tasa de asistencia calculada exitosamente',
                data: tasa
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAlertasInasistencias(req, res, next) {
        try {
            const params = asistencia_dto_1.alertasInasistenciasSchema.parse(req.query);
            const alertas = await this.asistenciaService.getAlertasInasistencias(params);
            res.json({
                success: true,
                message: 'Alertas de inasistencias obtenidas exitosamente',
                data: alertas
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getReporteAsistencias(req, res, next) {
        try {
            const params = asistencia_dto_1.reporteAsistenciasSchema.parse(req.query);
            const reporte = await this.asistenciaService.getReporteAsistencias(params);
            res.json({
                success: true,
                message: 'Reporte de asistencias generado exitosamente',
                data: reporte
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getEstadisticasGenerales(req, res, next) {
        try {
            const actividadId = req.query.actividadId ? parseInt(req.query.actividadId) : undefined;
            const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde) : undefined;
            const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta) : undefined;
            const estadisticas = await this.asistenciaService.getEstadisticasGenerales(actividadId, fechaDesde, fechaHasta);
            res.json({
                success: true,
                message: 'Estadísticas generales obtenidas exitosamente',
                data: estadisticas
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const actividadId = req.query.actividadId ? parseInt(req.query.actividadId) : undefined;
            const dashboard = await this.asistenciaService.getDashboardAsistencias(actividadId);
            res.json({
                success: true,
                message: 'Dashboard de asistencias obtenido exitosamente',
                data: dashboard
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getResumenPersona(req, res, next) {
        try {
            const { personaId } = req.params;
            const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde) : undefined;
            const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta) : undefined;
            const resumen = await this.asistenciaService.getResumenPersona(personaId, fechaDesde, fechaHasta);
            res.json({
                success: true,
                message: 'Resumen de asistencias de la persona obtenido exitosamente',
                data: resumen
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getResumenActividad(req, res, next) {
        try {
            const actividadId = parseInt(req.params.actividadId);
            if (isNaN(actividadId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de actividad inválido'
                });
            }
            const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde) : undefined;
            const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta) : undefined;
            const resumen = await this.asistenciaService.getResumenActividad(actividadId, fechaDesde, fechaHasta);
            res.json({
                success: true,
                message: 'Resumen de asistencias de la actividad obtenido exitosamente',
                data: resumen
            });
        }
        catch (error) {
            next(error);
        }
    }
    async corregirAsistencia(req, res, next) {
        try {
            const { participacionId, fechaSesion, asistio, justificada, observaciones } = req.body;
            if (!participacionId || !fechaSesion || asistio === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'participacionId, fechaSesion y asistio son campos requeridos'
                });
            }
            const asistencia = await this.asistenciaService.corregirAsistencia(parseInt(participacionId), new Date(fechaSesion), asistio, justificada, observaciones);
            res.json({
                success: true,
                message: 'Asistencia corregida exitosamente',
                data: asistencia
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AsistenciaController = AsistenciaController;
//# sourceMappingURL=asistencia.controller.js.map