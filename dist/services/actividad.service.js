"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
class ActividadService {
    constructor(actividadRepository, personaRepository) {
        this.actividadRepository = actividadRepository;
        this.personaRepository = personaRepository;
    }
    async createActividad(data) {
        if (data.docenteIds && data.docenteIds.length > 0) {
            for (const docenteId of data.docenteIds) {
                const docente = await this.personaRepository.findById(docenteId);
                if (!docente) {
                    throw new Error(`Docente con ID ${docenteId} no encontrado`);
                }
                if (docente.tipo !== client_1.TipoPersona.DOCENTE) {
                    throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente`);
                }
                if (docente.fechaBaja) {
                    throw new Error(`El docente ${docente.nombre} ${docente.apellido} está dado de baja`);
                }
            }
        }
        if (data.tipo === client_1.TipoActividad.CORO && data.precio > 0) {
            logger_1.logger.warn(`Creando coro con precio ${data.precio}. Los coros suelen ser gratuitos.`);
        }
        const actividad = await this.actividadRepository.create(data);
        logger_1.logger.info(`Actividad creada: ${actividad.nombre} (${actividad.tipo}) - ID: ${actividad.id}`);
        return actividad;
    }
    async getActividades(query) {
        const result = await this.actividadRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            ...result,
            pages
        };
    }
    async getActividadById(id) {
        return this.actividadRepository.findById(id);
    }
    async getActividadesByTipo(tipo) {
        return this.actividadRepository.findByTipo(tipo);
    }
    async updateActividad(id, data) {
        const existingActividad = await this.actividadRepository.findById(id);
        if (!existingActividad) {
            throw new Error(`Actividad con ID ${id} no encontrada`);
        }
        if (data.docenteIds !== undefined) {
            for (const docenteId of data.docenteIds) {
                const docente = await this.personaRepository.findById(docenteId);
                if (!docente) {
                    throw new Error(`Docente con ID ${docenteId} no encontrado`);
                }
                if (docente.tipo !== client_1.TipoPersona.DOCENTE) {
                    throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente`);
                }
                if (docente.fechaBaja) {
                    throw new Error(`El docente ${docente.nombre} ${docente.apellido} está dado de baja`);
                }
            }
        }
        const updatedActividad = await this.actividadRepository.update(id, data);
        logger_1.logger.info(`Actividad actualizada: ${updatedActividad.nombre} (ID: ${id})`);
        return updatedActividad;
    }
    async deleteActividad(id, hard = false) {
        const existingActividad = await this.actividadRepository.findById(id);
        if (!existingActividad) {
            throw new Error(`Actividad con ID ${id} no encontrada`);
        }
        const participaciones = existingActividad.participaciones || [];
        if (participaciones.length > 0) {
            if (hard) {
                throw new Error('No se puede eliminar permanentemente una actividad con participaciones. Use eliminación lógica.');
            }
            const deletedActividad = await this.actividadRepository.softDelete(id);
            logger_1.logger.info(`Actividad dada de baja: ${deletedActividad.nombre} (ID: ${id})`);
            return deletedActividad;
        }
        let deletedActividad;
        if (hard) {
            deletedActividad = await this.actividadRepository.delete(id);
            logger_1.logger.info(`Actividad eliminada permanentemente: ${deletedActividad.nombre} (ID: ${id})`);
        }
        else {
            deletedActividad = await this.actividadRepository.softDelete(id);
            logger_1.logger.info(`Actividad dada de baja: ${deletedActividad.nombre} (ID: ${id})`);
        }
        return deletedActividad;
    }
    async asignarDocente(actividadId, docenteId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
        const docente = await this.personaRepository.findById(docenteId);
        if (!docente) {
            throw new Error(`Docente con ID ${docenteId} no encontrado`);
        }
        if (docente.tipo !== client_1.TipoPersona.DOCENTE) {
            throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente`);
        }
        if (docente.fechaBaja) {
            throw new Error(`El docente ${docente.nombre} ${docente.apellido} está dado de baja`);
        }
        const docentes = actividad.docentes || [];
        const yaAsignado = docentes.some((d) => d.id === docenteId);
        if (yaAsignado) {
            throw new Error(`El docente ${docente.nombre} ${docente.apellido} ya está asignado a esta actividad`);
        }
        const updatedActividad = await this.actividadRepository.asignarDocente(actividadId, docenteId);
        logger_1.logger.info(`Docente ${docente.nombre} ${docente.apellido} asignado a actividad ${actividad.nombre}`);
        return updatedActividad;
    }
    async desasignarDocente(actividadId, docenteId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
        const docentes = actividad.docentes || [];
        const docente = docentes.find((d) => d.id === docenteId);
        if (!docente) {
            throw new Error('El docente no está asignado a esta actividad');
        }
        const updatedActividad = await this.actividadRepository.desasignarDocente(actividadId, docenteId);
        logger_1.logger.info(`Docente ${docente.nombre} ${docente.apellido} desasignado de actividad ${actividad.nombre}`);
        return updatedActividad;
    }
    async getParticipantes(actividadId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
        return this.actividadRepository.getParticipantes(actividadId);
    }
    async getEstadisticas(actividadId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
        return this.actividadRepository.getEstadisticas(actividadId);
    }
    async getDocentesDisponibles() {
        return this.actividadRepository.getDocentesDisponibles();
    }
    async getCoros() {
        return this.getActividadesByTipo(client_1.TipoActividad.CORO);
    }
    async getClasesInstrumento() {
        return this.getActividadesByTipo(client_1.TipoActividad.CLASE_INSTRUMENTO);
    }
    async getClasesCanto() {
        return this.getActividadesByTipo(client_1.TipoActividad.CLASE_CANTO);
    }
    async searchActividades(searchTerm, tipo) {
        const result = await this.actividadRepository.findAll({
            search: searchTerm,
            tipo,
            page: 1,
            limit: 20
        });
        return result.data;
    }
}
exports.ActividadService = ActividadService;
//# sourceMappingURL=actividad.service.js.map