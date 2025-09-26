"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadController = void 0;
const actividad_dto_1 = require("@/dto/actividad.dto");
const enums_1 = require("@/types/enums");
const client_1 = require("@prisma/client");
class ActividadController {
    constructor(actividadService) {
        this.actividadService = actividadService;
    }
    async createActividad(req, res, next) {
        try {
            const validatedData = actividad_dto_1.createActividadSchema.parse(req.body);
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
            const query = actividad_dto_1.actividadQuerySchema.parse(req.query);
            const result = await this.actividadService.getActividades(query);
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
    async getActividadById(req, res, next) {
        try {
            const { id } = req.params;
            const actividad = await this.actividadService.getActividadById(id);
            if (!actividad) {
                const response = {
                    success: false,
                    error: 'Actividad no encontrada'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
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
            const { id } = req.params;
            const validatedData = actividad_dto_1.updateActividadSchema.parse(req.body);
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
            const { id } = req.params;
            const { hard } = req.query;
            const isHardDelete = hard === 'true';
            const actividad = await this.actividadService.deleteActividad(id, isHardDelete);
            const response = {
                success: true,
                message: `Actividad ${isHardDelete ? 'eliminada permanentemente' : 'dada de baja'}`,
                data: actividad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getCoros(req, res, next) {
        try {
            const coros = await this.actividadService.getCoros();
            const response = {
                success: true,
                data: coros
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getClasesInstrumento(req, res, next) {
        try {
            const clases = await this.actividadService.getClasesInstrumento();
            const response = {
                success: true,
                data: clases
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getClasesCanto(req, res, next) {
        try {
            const clases = await this.actividadService.getClasesCanto();
            const response = {
                success: true,
                data: clases
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async asignarDocente(req, res, next) {
        try {
            const { id: actividadId } = req.params;
            const { docenteId } = actividad_dto_1.asignarDocenteSchema.parse({
                actividadId,
                docenteId: req.body.docenteId
            });
            const actividad = await this.actividadService.asignarDocente(actividadId, docenteId);
            const response = {
                success: true,
                message: 'Docente asignado exitosamente',
                data: actividad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async desasignarDocente(req, res, next) {
        try {
            const { id: actividadId, docenteId } = req.params;
            const actividad = await this.actividadService.desasignarDocente(actividadId, docenteId);
            const response = {
                success: true,
                message: 'Docente desasignado exitosamente',
                data: actividad
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getParticipantes(req, res, next) {
        try {
            const { id } = req.params;
            const participantes = await this.actividadService.getParticipantes(id);
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
    async getEstadisticas(req, res, next) {
        try {
            const { id } = req.params;
            const estadisticas = await this.actividadService.getEstadisticas(id);
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
    async searchActividades(req, res, next) {
        try {
            const { q: searchTerm, tipo } = req.query;
            if (!searchTerm || typeof searchTerm !== 'string') {
                const response = {
                    success: false,
                    error: 'Parámetro de búsqueda "q" es requerido'
                };
                res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                return;
            }
            let tipoActividad;
            if (tipo) {
                if (Object.values(client_1.TipoActividad).includes(tipo)) {
                    tipoActividad = tipo;
                }
                else {
                    const response = {
                        success: false,
                        error: `Tipo de actividad inválido. Valores válidos: ${Object.values(client_1.TipoActividad).join(', ')}`
                    };
                    res.status(enums_1.HttpStatus.BAD_REQUEST).json(response);
                    return;
                }
            }
            const actividades = await this.actividadService.searchActividades(searchTerm, tipoActividad);
            const response = {
                success: true,
                data: actividades
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