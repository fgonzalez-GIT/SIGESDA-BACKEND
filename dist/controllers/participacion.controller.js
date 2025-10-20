"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipacionController = void 0;
const participacion_dto_1 = require("@/dto/participacion.dto");
const zod_1 = require("zod");
class ParticipacionController {
    constructor(participacionService) {
        this.participacionService = participacionService;
    }
    async createParticipacion(req, res) {
        try {
            const validatedData = participacion_dto_1.createParticipacionSchema.parse(req.body);
            const participacion = await this.participacionService.create(validatedData);
            res.status(201).json({
                success: true,
                message: 'Participación creada exitosamente',
                data: participacion
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            const statusCode = error instanceof Error &&
                (error.message.includes('no encontrada') || error.message.includes('no encontrado')) ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getParticipaciones(req, res) {
        try {
            const query = participacion_dto_1.participacionQuerySchema.parse(req.query);
            const result = await this.participacionService.findAll(query);
            res.json({
                success: true,
                message: 'Participaciones obtenidas exitosamente',
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: query.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación en parámetros de consulta',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getParticipacionById(req, res) {
        try {
            const { id } = req.params;
            const participacion = await this.participacionService.findById(id);
            res.json({
                success: true,
                message: 'Participación obtenida exitosamente',
                data: participacion
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getParticipacionesByPersona(req, res) {
        try {
            const { personaId } = req.params;
            const participaciones = await this.participacionService.findByPersonaId(personaId);
            res.json({
                success: true,
                message: 'Participaciones de la persona obtenidas exitosamente',
                data: participaciones
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getParticipacionesByActividad(req, res) {
        try {
            const { actividadId } = req.params;
            const participaciones = await this.participacionService.findByActividadId(actividadId);
            res.json({
                success: true,
                message: 'Participaciones de la actividad obtenidas exitosamente',
                data: participaciones
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async updateParticipacion(req, res) {
        try {
            const { id } = req.params;
            const validatedData = participacion_dto_1.updateParticipacionSchema.parse(req.body);
            const participacion = await this.participacionService.update(id, validatedData);
            res.json({
                success: true,
                message: 'Participación actualizada exitosamente',
                data: participacion
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async deleteParticipacion(req, res) {
        try {
            const { id } = req.params;
            const participacion = await this.participacionService.delete(id);
            res.json({
                success: true,
                message: 'Participación eliminada exitosamente',
                data: participacion
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async inscripcionMasiva(req, res) {
        try {
            const validatedData = participacion_dto_1.inscripcionMasivaSchema.parse(req.body);
            const resultado = await this.participacionService.inscripcionMasiva(validatedData);
            const statusCode = resultado.totalErrores > 0 ? 207 : 201;
            res.status(statusCode).json({
                success: resultado.totalErrores === 0,
                message: `${resultado.totalCreadas} participaciones creadas exitosamente${resultado.totalErrores > 0 ? `, ${resultado.totalErrores} errores` : ''}`,
                data: {
                    participacionesCreadas: resultado.participacionesCreadas,
                    totalCreadas: resultado.totalCreadas,
                    totalErrores: resultado.totalErrores,
                    errores: resultado.errores
                }
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async desinscribir(req, res) {
        try {
            const { id } = req.params;
            const validatedData = participacion_dto_1.desincripcionSchema.parse(req.body);
            const participacion = await this.participacionService.desinscribir(id, validatedData);
            res.json({
                success: true,
                message: 'Participación finalizada exitosamente',
                data: participacion
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            const statusCode = error instanceof Error &&
                (error.message.includes('no encontrada') || error.message.includes('ya está inactiva')) ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async reactivarParticipacion(req, res) {
        try {
            const { id } = req.params;
            const participacion = await this.participacionService.reactivar(id);
            res.json({
                success: true,
                message: 'Participación reactivada exitosamente',
                data: participacion
            });
        }
        catch (error) {
            const statusCode = error instanceof Error &&
                (error.message.includes('no encontrada') || error.message.includes('ya está activa') ||
                    error.message.includes('no tiene cupos')) ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async transferirParticipacion(req, res) {
        try {
            const { id } = req.params;
            const validatedData = participacion_dto_1.transferirParticipacionSchema.parse(req.body);
            const participacion = await this.participacionService.transferir(id, validatedData);
            res.json({
                success: true,
                message: 'Participación transferida exitosamente',
                data: participacion
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            const statusCode = error instanceof Error &&
                (error.message.includes('no encontrada') || error.message.includes('capacidad máxima')) ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async verificarCupos(req, res) {
        try {
            const validatedData = participacion_dto_1.verificarCuposSchema.parse(req.body);
            const resultado = await this.participacionService.verificarCupos(validatedData);
            res.json({
                success: true,
                message: 'Verificación de cupos realizada exitosamente',
                data: resultado
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getParticipacionesActivas(req, res) {
        try {
            const { personaId } = req.query;
            const participaciones = await this.participacionService.getParticipacionesActivas(personaId);
            res.json({
                success: true,
                message: 'Participaciones activas obtenidas exitosamente',
                data: participaciones
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getParticipacionesPorVencer(req, res) {
        try {
            const { dias } = req.query;
            const diasNum = dias ? parseInt(dias) : 30;
            if (isNaN(diasNum) || diasNum < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro "dias" debe ser un número positivo'
                });
            }
            const participaciones = await this.participacionService.getParticipacionesPorVencer(diasNum);
            res.json({
                success: true,
                message: 'Participaciones próximas a vencer obtenidas exitosamente',
                data: participaciones
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getEstadisticas(req, res) {
        try {
            const params = participacion_dto_1.estadisticasParticipacionSchema.parse(req.query);
            const estadisticas = await this.participacionService.getEstadisticas(params);
            res.json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: estadisticas
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación en parámetros',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getReporteInasistencias(req, res) {
        try {
            const params = participacion_dto_1.reporteInasistenciasSchema.parse(req.query);
            const reporte = await this.participacionService.getReporteInasistencias(params);
            res.json({
                success: true,
                message: 'Reporte de inasistencias generado exitosamente',
                data: reporte
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación en parámetros',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getDashboard(req, res) {
        try {
            const dashboard = await this.participacionService.getDashboardParticipacion();
            res.json({
                success: true,
                message: 'Dashboard de participación obtenido exitosamente',
                data: dashboard
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
}
exports.ParticipacionController = ParticipacionController;
//# sourceMappingURL=participacion.controller.js.map