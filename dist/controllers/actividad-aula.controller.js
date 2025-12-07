"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadAulaController = void 0;
const actividad_aula_service_1 = require("@/services/actividad-aula.service");
const actividad_aula_repository_1 = require("@/repositories/actividad-aula.repository");
const actividad_repository_1 = require("@/repositories/actividad.repository");
const aula_repository_1 = require("@/repositories/aula.repository");
const database_1 = require("@/config/database");
const logger_1 = require("@/utils/logger");
const actividad_aula_dto_1 = require("@/dto/actividad-aula.dto");
class ActividadAulaController {
    constructor() {
        const actividadAulaRepository = new actividad_aula_repository_1.ActividadAulaRepository(database_1.prisma);
        const actividadRepository = new actividad_repository_1.ActividadRepository(database_1.prisma);
        const aulaRepository = new aula_repository_1.AulaRepository(database_1.prisma);
        this.actividadAulaService = new actividad_aula_service_1.ActividadAulaService(actividadAulaRepository, actividadRepository, aulaRepository, database_1.prisma);
    }
    async asignarAula(req, res) {
        try {
            const actividadId = parseInt(req.params.actividadId);
            const validation = actividad_aula_dto_1.createActividadAulaSchema.safeParse({
                ...req.body,
                actividadId
            });
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos de entrada inválidos',
                    details: validation.error.errors
                });
            }
            const asignacion = await this.actividadAulaService.asignarAula(validation.data);
            return res.status(201).json({
                success: true,
                message: `Aula "${asignacion.aulas.nombre}" asignada exitosamente a actividad "${asignacion.actividades.nombre}"`,
                data: asignacion
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al asignar aula: ${error.message}`);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async findAll(req, res) {
        try {
            const validation = actividad_aula_dto_1.queryActividadesAulasSchema.safeParse(req.query);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Parámetros de consulta inválidos',
                    details: validation.error.errors
                });
            }
            const result = await this.actividadAulaService.findAll(validation.data);
            return res.json({
                success: true,
                ...result
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al obtener asignaciones: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    async findById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID inválido'
                });
            }
            const asignacion = await this.actividadAulaService.findById(id);
            if (!asignacion) {
                return res.status(404).json({
                    success: false,
                    error: 'Asignación no encontrada'
                });
            }
            return res.json({
                success: true,
                data: asignacion
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al obtener asignación: ${error.message}`);
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }
    async getAulasByActividad(req, res) {
        try {
            const actividadId = parseInt(req.params.actividadId);
            const soloActivas = req.query.soloActivas === 'true';
            const aulas = await this.actividadAulaService.getAulasByActividad(actividadId, soloActivas);
            return res.json({
                success: true,
                data: aulas,
                total: aulas.length
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al obtener aulas de actividad: ${error.message}`);
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }
    async getActividadesByAula(req, res) {
        try {
            const aulaId = parseInt(req.params.aulaId);
            const soloActivas = req.query.soloActivas !== 'false';
            const actividades = await this.actividadAulaService.getActividadesByAula(aulaId, soloActivas);
            return res.json({
                success: true,
                data: actividades,
                total: actividades.length
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al obtener actividades de aula: ${error.message}`);
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const validation = actividad_aula_dto_1.updateActividadAulaSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos de entrada inválidos',
                    details: validation.error.errors
                });
            }
            const asignacion = await this.actividadAulaService.update(id, validation.data);
            return res.json({
                success: true,
                message: 'Asignación actualizada exitosamente',
                data: asignacion
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al actualizar asignación: ${error.message}`);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const asignacion = await this.actividadAulaService.delete(id);
            return res.json({
                success: true,
                message: 'Asignación eliminada exitosamente',
                data: asignacion
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al eliminar asignación: ${error.message}`);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async desasignarAula(req, res) {
        try {
            const id = parseInt(req.params.id);
            const validation = actividad_aula_dto_1.desasignarAulaSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos de entrada inválidos',
                    details: validation.error.errors
                });
            }
            const asignacion = await this.actividadAulaService.desasignarAula(id, validation.data);
            return res.json({
                success: true,
                message: 'Aula desasignada exitosamente',
                data: asignacion
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al desasignar aula: ${error.message}`);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async reactivarAsignacion(req, res) {
        try {
            const id = parseInt(req.params.id);
            const asignacion = await this.actividadAulaService.reactivarAsignacion(id);
            return res.json({
                success: true,
                message: 'Asignación reactivada exitosamente',
                data: asignacion
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al reactivar asignación: ${error.message}`);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async verificarDisponibilidad(req, res) {
        try {
            const actividadId = parseInt(req.params.actividadId);
            const validation = actividad_aula_dto_1.verificarDisponibilidadSchema.safeParse({
                ...req.body,
                actividadId
            });
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos de entrada inválidos',
                    details: validation.error.errors
                });
            }
            const disponibilidad = await this.actividadAulaService.verificarDisponibilidad(validation.data);
            return res.json({
                success: true,
                data: disponibilidad
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al verificar disponibilidad: ${error.message}`);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async sugerirAulas(req, res) {
        try {
            const actividadId = parseInt(req.params.actividadId);
            const criterios = {
                capacidadMinima: req.query.capacidadMinima ? parseInt(req.query.capacidadMinima) : undefined,
                tipoAulaId: req.query.tipoAulaId ? parseInt(req.query.tipoAulaId) : undefined
            };
            const sugerencias = await this.actividadAulaService.sugerirAulasParaActividad(actividadId, criterios);
            return res.json({
                success: true,
                data: sugerencias,
                total: sugerencias.length
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al sugerir aulas: ${error.message}`);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async asignarMultiplesAulas(req, res) {
        try {
            const actividadId = parseInt(req.params.actividadId);
            const validation = actividad_aula_dto_1.asignarMultiplesAulasSchema.safeParse({
                ...req.body,
                actividadId
            });
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos de entrada inválidos',
                    details: validation.error.errors
                });
            }
            const resultado = await this.actividadAulaService.asignarMultiplesAulas(validation.data);
            return res.status(201).json({
                success: true,
                message: `${resultado.totalCreadas} aula(s) asignada(s) exitosamente`,
                data: resultado
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al asignar múltiples aulas: ${error.message}`);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async cambiarAula(req, res) {
        try {
            const actividadId = parseInt(req.params.actividadId);
            const aulaIdActual = parseInt(req.params.aulaId);
            const validation = actividad_aula_dto_1.cambiarAulaSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos de entrada inválidos',
                    details: validation.error.errors
                });
            }
            const resultado = await this.actividadAulaService.cambiarAula(actividadId, aulaIdActual, validation.data);
            return res.json({
                success: true,
                message: 'Aula cambiada exitosamente',
                data: resultado
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al cambiar aula: ${error.message}`);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async getOcupacionAula(req, res) {
        try {
            const aulaId = parseInt(req.params.aulaId);
            const ocupacion = await this.actividadAulaService.getOcupacionAula(aulaId);
            return res.json({
                success: true,
                data: ocupacion
            });
        }
        catch (error) {
            logger_1.logger.error(`Error al obtener ocupación de aula: ${error.message}`);
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }
}
exports.ActividadAulaController = ActividadAulaController;
//# sourceMappingURL=actividad-aula.controller.js.map