"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadController = void 0;
const actividad_v2_dto_1 = require("@/dto/actividad-v2.dto");
const enums_1 = require("@/types/enums");
class ActividadController {
    constructor(actividadService) {
        this.actividadService = actividadService;
    }
    async createActividad(req, res, next) {
        try {
            const validatedData = actividad_v2_dto_1.createActividadSchema.parse(req.body);
            const actividad = await this.actividadService.createActividad(validatedData);
            const response = {
                success: true,
                message: 'Actividad creada exitosamente',
                data: actividad
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getActividades(req, res, next) {
        try {
            const query = actividad_v2_dto_1.queryActividadesSchema.parse(req.query);
            const result = await this.actividadService.getActividades(query);
            const response = {
                success: true,
                data: {
                    data: result.data,
                    total: result.total,
                    page: query.page,
                    limit: query.limit,
                    pages: result.pages
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getActividadById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const actividad = await this.actividadService.getActividadById(id);
            const response = {
                success: true,
                data: actividad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getActividadByCodigo(req, res, next) {
        try {
            const { codigo } = req.params;
            const actividad = await this.actividadService.getActividadByCodigo(codigo);
            const response = {
                success: true,
                data: actividad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateActividad(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const validatedData = actividad_v2_dto_1.updateActividadSchema.parse(req.body);
            const actividad = await this.actividadService.updateActividad(id, validatedData);
            const response = {
                success: true,
                message: 'Actividad actualizada exitosamente',
                data: actividad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteActividad(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const result = await this.actividadService.deleteActividad(id);
            const response = {
                success: true,
                message: result.message
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async cambiarEstado(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const validatedData = actividad_v2_dto_1.cambiarEstadoActividadSchema.parse(req.body);
            const actividad = await this.actividadService.cambiarEstado(id, validatedData.nuevoEstadoId, validatedData.observaciones ?? undefined);
            const response = {
                success: true,
                message: 'Estado de actividad cambiado exitosamente',
                data: actividad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async agregarHorario(req, res, next) {
        try {
            const actividadId = parseInt(req.params.id);
            if (isNaN(actividadId)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const horario = await this.actividadService.agregarHorario(actividadId, req.body);
            const response = {
                success: true,
                message: 'Horario agregado exitosamente',
                data: horario
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getHorariosByActividad(req, res, next) {
        try {
            const actividadId = parseInt(req.params.id);
            if (isNaN(actividadId)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const horarios = await this.actividadService.getHorariosByActividad(actividadId);
            const response = {
                success: true,
                data: horarios
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async actualizarHorario(req, res, next) {
        try {
            const horarioId = parseInt(req.params.horarioId);
            if (isNaN(horarioId)) {
                const response = {
                    success: false,
                    error: 'ID de horario inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const horario = await this.actividadService.actualizarHorario(horarioId, req.body);
            const response = {
                success: true,
                message: 'Horario actualizado exitosamente',
                data: horario
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async eliminarHorario(req, res, next) {
        try {
            const horarioId = parseInt(req.params.horarioId);
            if (isNaN(horarioId)) {
                const response = {
                    success: false,
                    error: 'ID de horario inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const result = await this.actividadService.eliminarHorario(horarioId);
            const response = {
                success: true,
                message: result.message
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async asignarDocente(req, res, next) {
        try {
            const actividadId = parseInt(req.params.id);
            if (isNaN(actividadId)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const { docenteId, rolDocenteId, observaciones } = req.body;
            if (!docenteId || !rolDocenteId) {
                const response = {
                    success: false,
                    error: 'docenteId y rolDocenteId son requeridos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const docenteIdParsed = parseInt(docenteId);
            const rolDocenteIdParsed = parseInt(rolDocenteId);
            if (isNaN(docenteIdParsed) || isNaN(rolDocenteIdParsed)) {
                const response = {
                    success: false,
                    error: 'docenteId y rolDocenteId deben ser números válidos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const asignacion = await this.actividadService.asignarDocente(actividadId, docenteIdParsed, rolDocenteIdParsed, observaciones);
            const response = {
                success: true,
                message: 'Docente asignado exitosamente',
                data: asignacion
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async desasignarDocente(req, res, next) {
        try {
            const actividadId = parseInt(req.params.id);
            const docenteId = parseInt(req.params.docenteId);
            const rolDocenteId = parseInt(req.params.rolDocenteId);
            if (isNaN(actividadId) || isNaN(docenteId) || isNaN(rolDocenteId)) {
                const response = {
                    success: false,
                    error: 'IDs inválidos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const desasignacion = await this.actividadService.desasignarDocente(actividadId, docenteId, rolDocenteId);
            const response = {
                success: true,
                message: 'Docente desasignado exitosamente',
                data: desasignacion
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getDocentesByActividad(req, res, next) {
        try {
            const actividadId = parseInt(req.params.id);
            if (isNaN(actividadId)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const docentes = await this.actividadService.getDocentesByActividad(actividadId);
            const response = {
                success: true,
                data: docentes
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getDocentesDisponibles(req, res, next) {
        try {
            const docentes = await this.actividadService.getDocentesDisponibles();
            const response = {
                success: true,
                data: docentes
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getParticipantes(req, res, next) {
        try {
            const actividadId = parseInt(req.params.id);
            if (isNaN(actividadId)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const participantes = await this.actividadService.getParticipantes(actividadId);
            const response = {
                success: true,
                data: participantes
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async addParticipante(req, res, next) {
        try {
            const actividadId = parseInt(req.params.id);
            if (isNaN(actividadId)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const { persona_id, fecha_inicio, observaciones } = req.body;
            if (!persona_id || !fecha_inicio) {
                const response = {
                    success: false,
                    error: 'persona_id y fecha_inicio son requeridos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const personaIdParsed = parseInt(persona_id);
            if (isNaN(personaIdParsed)) {
                const response = {
                    success: false,
                    error: 'persona_id debe ser un número válido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const participacion = await this.actividadService.addParticipante(actividadId, personaIdParsed, fecha_inicio, observaciones);
            const response = {
                success: true,
                message: 'Participante inscrito exitosamente',
                data: participacion
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteParticipante(req, res, next) {
        try {
            const actividadId = parseInt(req.params.id);
            const participanteId = parseInt(req.params.participanteId);
            if (isNaN(actividadId) || isNaN(participanteId)) {
                const response = {
                    success: false,
                    error: 'IDs inválidos'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const participacion = await this.actividadService.deleteParticipante(actividadId, participanteId);
            const response = {
                success: true,
                message: 'Participante eliminado exitosamente',
                data: participacion
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEstadisticas(req, res, next) {
        try {
            const actividadId = parseInt(req.params.id);
            if (isNaN(actividadId)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const estadisticas = await this.actividadService.getEstadisticas(actividadId);
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
    async getCatalogos(req, res, next) {
        try {
            const catalogos = await this.actividadService.getCatalogos();
            const response = {
                success: true,
                data: catalogos
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getTiposActividades(req, res, next) {
        try {
            const tipos = await this.actividadService.getTiposActividades();
            const response = {
                success: true,
                data: tipos
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getCategoriasActividades(req, res, next) {
        try {
            const categorias = await this.actividadService.getCategoriasActividades();
            const response = {
                success: true,
                data: categorias
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getEstadosActividades(req, res, next) {
        try {
            const estados = await this.actividadService.getEstadosActividades();
            const response = {
                success: true,
                data: estados
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getDiasSemana(req, res, next) {
        try {
            const dias = await this.actividadService.getDiasSemana();
            const response = {
                success: true,
                data: dias
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getRolesDocentes(req, res, next) {
        try {
            const roles = await this.actividadService.getRolesDocentes();
            const response = {
                success: true,
                data: roles
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async duplicarActividad(req, res, next) {
        try {
            const idOriginal = parseInt(req.params.id);
            if (isNaN(idOriginal)) {
                const response = {
                    success: false,
                    error: 'ID de actividad inválido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            const validatedData = actividad_v2_dto_1.duplicarActividadSchema.parse(req.body);
            const nuevaActividad = await this.actividadService.duplicarActividad(idOriginal, validatedData.nuevoCodigoActividad, validatedData.nuevoNombre, validatedData.nuevaFechaDesde, validatedData.nuevaFechaHasta, validatedData.copiarHorarios, validatedData.copiarDocentes);
            const response = {
                success: true,
                message: 'Actividad duplicada exitosamente',
                data: nuevaActividad
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getResumenPorTipo(req, res, next) {
        try {
            const resumen = await this.actividadService.getResumenPorTipo();
            const response = {
                success: true,
                data: resumen
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getHorarioSemanal(req, res, next) {
        try {
            const horarioSemanal = await this.actividadService.getHorarioSemanal();
            const response = {
                success: true,
                data: horarioSemanal
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ActividadController = ActividadController;
//# sourceMappingURL=actividad.controller.js.map