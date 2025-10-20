"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadService = void 0;
const actividad_repository_1 = require("@/repositories/actividad.repository");
const logger_1 = require("@/utils/logger");
const errors_1 = require("@/utils/errors");
class ActividadService {
    constructor(actividadRepository) {
        this.actividadRepository = actividadRepository;
    }
    async createActividad(data) {
        const existente = await this.actividadRepository.findByCodigoActividad(data.codigoActividad);
        if (existente) {
            throw new errors_1.ValidationError(`Ya existe una actividad con el código ${data.codigoActividad}`);
        }
        if (data.horarios && data.horarios.length > 0) {
            this.validateHorarios(data.horarios);
        }
        if (data.fechaHasta) {
            const desde = new Date(data.fechaDesde);
            const hasta = new Date(data.fechaHasta);
            if (hasta < desde) {
                throw new errors_1.ValidationError('La fecha hasta debe ser posterior a la fecha desde');
            }
        }
        const actividad = await this.actividadRepository.create(data);
        logger_1.logger.info(`Actividad creada: ${actividad.nombre} (ID: ${actividad.id}) - Código: ${actividad.codigo_actividad}`);
        return actividad;
    }
    validateHorarios(horarios) {
        for (let i = 0; i < horarios.length; i++) {
            for (let j = i + 1; j < horarios.length; j++) {
                const h1 = horarios[i];
                const h2 = horarios[j];
                if (h1.diaSemanaId === h2.diaSemanaId) {
                    const inicio1 = actividad_repository_1.ActividadRepository.timeToMinutes(h1.horaInicio);
                    const fin1 = actividad_repository_1.ActividadRepository.timeToMinutes(h1.horaFin);
                    const inicio2 = actividad_repository_1.ActividadRepository.timeToMinutes(h2.horaInicio);
                    const fin2 = actividad_repository_1.ActividadRepository.timeToMinutes(h2.horaFin);
                    if (inicio1 < fin2 && fin1 > inicio2) {
                        throw new errors_1.ValidationError(`Conflicto de horarios en la misma actividad: ${h1.horaInicio}-${h1.horaFin} se superpone con ${h2.horaInicio}-${h2.horaFin}`);
                    }
                }
            }
        }
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
        const actividad = await this.actividadRepository.findById(id);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${id} no encontrada`);
        }
        return actividad;
    }
    async getActividadByCodigo(codigo) {
        const actividad = await this.actividadRepository.findByCodigoActividad(codigo);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con código ${codigo} no encontrada`);
        }
        return actividad;
    }
    async updateActividad(id, data) {
        const existente = await this.actividadRepository.findById(id);
        if (!existente) {
            throw new errors_1.NotFoundError(`Actividad con ID ${id} no encontrada`);
        }
        if (data.codigoActividad && data.codigoActividad !== existente.codigo_actividad) {
            const conMismoCodigo = await this.actividadRepository.findByCodigoActividad(data.codigoActividad);
            if (conMismoCodigo && conMismoCodigo.id !== id) {
                throw new errors_1.ValidationError(`Ya existe otra actividad con el código ${data.codigoActividad}`);
            }
        }
        if (data.fechaDesde && data.fechaHasta) {
            const desde = new Date(data.fechaDesde);
            const hasta = new Date(data.fechaHasta);
            if (hasta < desde) {
                throw new errors_1.ValidationError('La fecha hasta debe ser posterior a la fecha desde');
            }
        }
        const updated = await this.actividadRepository.update(id, data);
        logger_1.logger.info(`Actividad actualizada: ${updated.nombre} (ID: ${id})`);
        return updated;
    }
    async deleteActividad(id) {
        const existente = await this.actividadRepository.findById(id);
        if (!existente) {
            throw new errors_1.NotFoundError(`Actividad con ID ${id} no encontrada`);
        }
        const participantes = existente.participaciones_actividades || [];
        if (participantes.length > 0) {
            throw new errors_1.ValidationError(`No se puede eliminar la actividad ${existente.nombre} porque tiene ${participantes.length} participantes activos. Cambie su estado a INACTIVA o FINALIZADA.`);
        }
        await this.actividadRepository.delete(id);
        logger_1.logger.info(`Actividad eliminada: ${existente.nombre} (ID: ${id})`);
        return { message: 'Actividad eliminada exitosamente' };
    }
    async cambiarEstado(id, nuevoEstadoId, observaciones) {
        const existente = await this.actividadRepository.findById(id);
        if (!existente) {
            throw new errors_1.NotFoundError(`Actividad con ID ${id} no encontrada`);
        }
        const updated = await this.actividadRepository.cambiarEstado(id, nuevoEstadoId, observaciones);
        logger_1.logger.info(`Estado de actividad cambiado: ${updated.nombre} (ID: ${id}) -> Estado: ${updated.estados_actividades.nombre}`);
        return updated;
    }
    async agregarHorario(actividadId, horarioData) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        const horariosExistentes = await this.actividadRepository.getHorariosByActividad(actividadId);
        const horariosParaValidar = horariosExistentes.map(h => ({
            diaSemanaId: h.dia_semana_id,
            horaInicio: actividad_repository_1.ActividadRepository.formatTime(h.hora_inicio),
            horaFin: actividad_repository_1.ActividadRepository.formatTime(h.hora_fin)
        }));
        horariosParaValidar.push(horarioData);
        this.validateHorarios(horariosParaValidar);
        const horario = await this.actividadRepository.agregarHorario(actividadId, horarioData);
        logger_1.logger.info(`Horario agregado a actividad ${actividad.nombre}: ${horarioData.diaSemanaId} ${horarioData.horaInicio}-${horarioData.horaFin}`);
        return horario;
    }
    async actualizarHorario(horarioId, horarioData) {
        const horarioActual = await this.actividadRepository.findHorarioById(horarioId);
        if (!horarioActual) {
            throw new errors_1.NotFoundError(`Horario con ID ${horarioId} no encontrado`);
        }
        if (horarioData.diaSemanaId || horarioData.horaInicio || horarioData.horaFin) {
            const actividadId = horarioActual.actividad_id;
            const todosLosHorarios = await this.actividadRepository.getHorariosByActividad(actividadId);
            const otrosHorarios = todosLosHorarios
                .filter(h => h.id !== horarioId)
                .map(h => ({
                diaSemanaId: h.dia_semana_id,
                horaInicio: actividad_repository_1.ActividadRepository.formatTime(h.hora_inicio),
                horaFin: actividad_repository_1.ActividadRepository.formatTime(h.hora_fin)
            }));
            const horarioActualizado = {
                diaSemanaId: horarioData.diaSemanaId || horarioActual.dia_semana_id,
                horaInicio: horarioData.horaInicio || actividad_repository_1.ActividadRepository.formatTime(horarioActual.hora_inicio),
                horaFin: horarioData.horaFin || actividad_repository_1.ActividadRepository.formatTime(horarioActual.hora_fin)
            };
            const todosParaValidar = [...otrosHorarios, horarioActualizado];
            this.validateHorarios(todosParaValidar);
        }
        const updated = await this.actividadRepository.updateHorario(horarioId, horarioData);
        logger_1.logger.info(`Horario actualizado: ${horarioId} de actividad ${horarioActual.actividades.nombre}`);
        return updated;
    }
    async eliminarHorario(horarioId) {
        const horario = await this.actividadRepository.findHorarioById(horarioId);
        if (!horario) {
            throw new errors_1.NotFoundError(`Horario con ID ${horarioId} no encontrado`);
        }
        await this.actividadRepository.deleteHorario(horarioId);
        logger_1.logger.info(`Horario eliminado: ${horarioId} de actividad ${horario.actividades.nombre}`);
        return { message: 'Horario eliminado exitosamente' };
    }
    async getHorariosByActividad(actividadId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        return this.actividadRepository.getHorariosByActividad(actividadId);
    }
    async asignarDocente(actividadId, docenteId, rolDocenteId, observaciones) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        const asignacion = await this.actividadRepository.asignarDocente(actividadId, docenteId, rolDocenteId, observaciones);
        logger_1.logger.info(`Docente ${asignacion.personas.nombre} ${asignacion.personas.apellido} asignado a actividad ${actividad.nombre} con rol ${asignacion.roles_docentes.nombre}`);
        return asignacion;
    }
    async desasignarDocente(actividadId, docenteId, rolDocenteId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        const desasignacion = await this.actividadRepository.desasignarDocente(actividadId, docenteId, rolDocenteId);
        logger_1.logger.info(`Docente ${desasignacion.personas.nombre} ${desasignacion.personas.apellido} desasignado de actividad ${actividad.nombre}`);
        return desasignacion;
    }
    async getDocentesByActividad(actividadId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        return this.actividadRepository.getDocentesByActividad(actividadId);
    }
    async getDocentesDisponibles() {
        return this.actividadRepository.getDocentesDisponibles();
    }
    async getParticipantes(actividadId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        return this.actividadRepository.getParticipantes(actividadId);
    }
    async addParticipante(actividadId, personaId, fechaInicio, observaciones) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        const participacion = await this.actividadRepository.addParticipante(actividadId, personaId, fechaInicio, observaciones);
        logger_1.logger.info(`Participante inscrito: ${personaId} en actividad ${actividad.nombre} (ID: ${actividadId})`);
        return participacion;
    }
    async getEstadisticas(actividadId) {
        const estadisticas = await this.actividadRepository.getEstadisticas(actividadId);
        if (!estadisticas) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        return estadisticas;
    }
    async getCatalogos() {
        const [tipos, categorias, estados, diasSemana, roles] = await Promise.all([
            this.actividadRepository.getTiposActividades(),
            this.actividadRepository.getCategoriasActividades(),
            this.actividadRepository.getEstadosActividades(),
            this.actividadRepository.getDiasSemana(),
            this.actividadRepository.getRolesDocentes()
        ]);
        return {
            tipos: tipos,
            categorias: categorias,
            estados: estados,
            diasSemana: diasSemana,
            rolesDocentes: roles
        };
    }
    async getTiposActividades() {
        return this.actividadRepository.getTiposActividades();
    }
    async getCategoriasActividades() {
        return this.actividadRepository.getCategoriasActividades();
    }
    async getEstadosActividades() {
        return this.actividadRepository.getEstadosActividades();
    }
    async getDiasSemana() {
        return this.actividadRepository.getDiasSemana();
    }
    async getRolesDocentes() {
        return this.actividadRepository.getRolesDocentes();
    }
    async duplicarActividad(idOriginal, nuevoCodigoActividad, nuevoNombre, nuevaFechaDesde, nuevaFechaHasta, copiarHorarios = true, copiarDocentes = false) {
        const original = await this.actividadRepository.findById(idOriginal);
        if (!original) {
            throw new errors_1.NotFoundError(`Actividad con ID ${idOriginal} no encontrada`);
        }
        const existeNuevoCodigo = await this.actividadRepository.findByCodigoActividad(nuevoCodigoActividad);
        if (existeNuevoCodigo) {
            throw new errors_1.ValidationError(`Ya existe una actividad con el código ${nuevoCodigoActividad}`);
        }
        const datosNuevaActividad = {
            codigoActividad: nuevoCodigoActividad,
            nombre: nuevoNombre,
            tipoActividadId: original.tipo_actividad_id,
            categoriaId: original.categoria_id,
            estadoId: original.estado_id,
            descripcion: original.descripcion,
            fechaDesde: nuevaFechaDesde,
            fechaHasta: nuevaFechaHasta,
            cupoMaximo: original.cupo_maximo,
            costo: original.costo,
            observaciones: `Duplicado de: ${original.nombre} (ID: ${original.id})`,
            horarios: copiarHorarios ? original.horarios_actividades?.map((h) => ({
                diaSemanaId: h.dia_semana_id,
                horaInicio: actividad_repository_1.ActividadRepository.formatTime(h.hora_inicio),
                horaFin: actividad_repository_1.ActividadRepository.formatTime(h.hora_fin),
                activo: h.activo
            })) : [],
            docentes: copiarDocentes ? original.docentes_actividades?.map((d) => ({
                docenteId: d.docente_id,
                rolDocenteId: d.rol_docente_id,
                observaciones: d.observaciones
            })) : []
        };
        const nuevaActividad = await this.actividadRepository.create(datosNuevaActividad);
        logger_1.logger.info(`Actividad duplicada: ${original.nombre} (ID: ${idOriginal}) -> ${nuevaActividad.nombre} (ID: ${nuevaActividad.id})`);
        return nuevaActividad;
    }
    async getResumenPorTipo() {
        const tipos = await this.actividadRepository.getTiposActividades();
        const resumen = await Promise.all(tipos.map(async (tipo) => {
            const actividades = await this.actividadRepository.findAll({
                tipoActividadId: tipo.id,
                incluirRelaciones: false,
                page: 1,
                limit: 1000
            });
            return {
                tipo: {
                    id: tipo.id,
                    codigo: tipo.codigo,
                    nombre: tipo.nombre
                },
                totalActividades: actividades.total,
                actividades: actividades.data.map(a => ({
                    id: a.id,
                    codigo: a.codigo_actividad,
                    nombre: a.nombre,
                    cupoMaximo: a.cupo_maximo,
                    costo: a.costo
                }))
            };
        }));
        return resumen;
    }
    async getHorarioSemanal() {
        const diasSemana = await this.actividadRepository.getDiasSemana();
        const horarioSemanal = await Promise.all(diasSemana.map(async (dia) => {
            const actividades = await this.actividadRepository.findAll({
                diaSemanaId: dia.id,
                incluirRelaciones: true,
                page: 1,
                limit: 100
            });
            return {
                dia: {
                    id: dia.id,
                    codigo: dia.codigo,
                    nombre: dia.nombre,
                    orden: dia.orden
                },
                actividades: actividades.data.map(act => ({
                    id: act.id,
                    codigo: act.codigo_actividad,
                    nombre: act.nombre,
                    tipo: act.tipos_actividades?.nombre,
                    horarios: act.horarios_actividades?.map((h) => ({
                        horaInicio: actividad_repository_1.ActividadRepository.formatTime(h.hora_inicio),
                        horaFin: actividad_repository_1.ActividadRepository.formatTime(h.hora_fin),
                        aula: h.reservas_aulas_actividades?.[0]?.aulas?.nombre
                    })),
                    docentes: act.docentes_actividades?.map((d) => ({
                        nombre: `${d.personas.nombre} ${d.personas.apellido}`,
                        rol: d.roles_docentes.nombre
                    }))
                }))
            };
        }));
        return {
            horarioSemanal,
            generadoEn: new Date()
        };
    }
}
exports.ActividadService = ActividadService;
//# sourceMappingURL=actividad.service.js.map