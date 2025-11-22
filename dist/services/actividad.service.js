"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadService = void 0;
const actividad_repository_1 = require("@/repositories/actividad.repository");
const logger_1 = require("@/utils/logger");
const errors_1 = require("@/utils/errors");
const client_1 = require("@prisma/client");
class ActividadService {
    constructor(actividadRepository, prisma) {
        this.actividadRepository = actividadRepository;
        this.prisma = prisma || new client_1.PrismaClient();
    }
    async generateCodigoActividad(tipoActividadId, nombre) {
        const tipoActividad = await this.prisma.tipos_actividades.findUnique({
            where: { id: tipoActividadId }
        });
        if (!tipoActividad) {
            throw new errors_1.ValidationError(`Tipo de actividad con ID ${tipoActividadId} no encontrado`);
        }
        const primeraPalabraTipo = tipoActividad.nombre.split(' ')[0].toUpperCase();
        const palabrasNombre = nombre.split(' ');
        let abreviatura = palabrasNombre
            .map(palabra => {
            if (/^\d+$/.test(palabra)) {
                return palabra.length === 4 ? palabra.slice(-2) : palabra;
            }
            return palabra.slice(0, 3).toUpperCase();
        })
            .join('');
        let codigoBase = `${primeraPalabraTipo}-${abreviatura}`;
        let codigo = codigoBase;
        let contador = 1;
        while (await this.actividadRepository.findByCodigoActividad(codigo)) {
            codigo = `${codigoBase}-${contador}`;
            contador++;
        }
        return codigo;
    }
    async createActividad(data) {
        let codigoActividad = data.codigoActividad;
        if (!codigoActividad) {
            codigoActividad = await this.generateCodigoActividad(data.tipoActividadId, data.nombre);
            data = { ...data, codigoActividad };
        }
        else {
            const existente = await this.actividadRepository.findByCodigoActividad(codigoActividad);
            if (existente) {
                throw new errors_1.ValidationError(`Ya existe una actividad con el código ${codigoActividad}`);
            }
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
        logger_1.logger.info(`Actividad creada: ${actividad.nombre} (ID: ${actividad.id})`);
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
        logger_1.logger.info(`Estado de actividad cambiado: ${updated.nombre} (ID: ${id})`);
        return updated;
    }
    async agregarHorario(actividadId, horarioData) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        const horariosExistentes = await this.actividadRepository.getHorariosByActividad(actividadId);
        const horariosParaValidar = horariosExistentes.map(h => ({
            diaSemanaId: h.diaSemana,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin
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
            const actividadId = horarioActual.actividadId;
            const todosLosHorarios = await this.actividadRepository.getHorariosByActividad(actividadId);
            const otrosHorarios = todosLosHorarios
                .filter(h => h.id !== horarioId)
                .map(h => ({
                diaSemanaId: h.diaSemana ? (typeof h.diaSemana === 'string' ? h.diaSemana : h.diaSemana) : 'LUNES',
                horaInicio: h.horaInicio,
                horaFin: h.horaFin
            }));
            const horarioActualizado = {
                diaSemanaId: horarioData.diaSemanaId || horarioActual.diaSemana,
                horaInicio: horarioData.horaInicio || horarioActual.horaInicio,
                horaFin: horarioData.horaFin || horarioActual.horaFin
            };
            const todosParaValidar = [...otrosHorarios, horarioActualizado];
            this.validateHorarios(todosParaValidar);
        }
        const updated = await this.actividadRepository.updateHorario(horarioId, horarioData);
        const actividadNombre = horarioActual.actividades?.nombre || 'Actividad';
        logger_1.logger.info(`Horario actualizado: ${horarioId} de actividad ${actividadNombre}`);
        return updated;
    }
    async eliminarHorario(horarioId) {
        const horario = await this.actividadRepository.findHorarioById(horarioId);
        if (!horario) {
            throw new errors_1.NotFoundError(`Horario con ID ${horarioId} no encontrado`);
        }
        await this.actividadRepository.deleteHorario(horarioId);
        const actividadNombre = horario.actividades?.nombre || 'Actividad';
        logger_1.logger.info(`Horario eliminado: ${horarioId} de actividad ${actividadNombre}`);
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
        const docente = await this.actividadRepository.validarDocente(docenteId);
        if (!docente) {
            throw new errors_1.NotFoundError(`Persona con ID ${docenteId} no encontrada`);
        }
        if (!docente.esDocenteActivo) {
            throw new errors_1.ValidationError(`La persona ${docente.nombre} ${docente.apellido} (ID: ${docenteId}) no tiene el tipo DOCENTE activo. ` +
                `Solo se pueden asignar personas con tipo DOCENTE activo a actividades.`);
        }
        const asignacionExistente = await this.actividadRepository.findAsignacionDocente(actividadId, docenteId, rolDocenteId);
        if (asignacionExistente) {
            const rolNombre = asignacionExistente.rolesDocentes?.nombre || `ID ${rolDocenteId}`;
            throw new errors_1.ConflictError(`El docente ${docente.nombre} ${docente.apellido} ya está asignado a la actividad "${actividad.nombre}" con el rol "${rolNombre}"`);
        }
        const asignacion = await this.actividadRepository.asignarDocente(actividadId, docenteId, rolDocenteId, observaciones);
        const docenteNombre = asignacion.personas?.nombre || 'Docente';
        const docenteApellido = asignacion.personas?.apellido || '';
        const rolNombre = asignacion.roles_docentes?.nombre || 'Rol';
        logger_1.logger.info(`Docente ${docenteNombre} ${docenteApellido} asignado a actividad ${actividad.nombre} con rol ${rolNombre}`);
        return asignacion;
    }
    async desasignarDocente(actividadId, docenteId, rolDocenteId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        const desasignacion = await this.actividadRepository.desasignarDocente(actividadId, docenteId, rolDocenteId);
        const docenteNombre = desasignacion.personas?.nombre || 'Docente';
        const docenteApellido = desasignacion.personas?.apellido || '';
        logger_1.logger.info(`Docente ${docenteNombre} ${docenteApellido} desasignado de actividad ${actividad.nombre}`);
        return desasignacion;
    }
    async desasignarDocenteById(asignacionId) {
        const desasignacion = await this.actividadRepository.desasignarDocenteById(asignacionId);
        const docenteNombre = desasignacion.personas?.nombre || 'Docente';
        const docenteApellido = desasignacion.personas?.apellido || '';
        logger_1.logger.info(`Docente ${docenteNombre} ${docenteApellido} desasignado (asignación ID: ${asignacionId})`);
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
        const existingParticipacion = await this.actividadRepository.findParticipacionByPersonaAndActividad(actividadId, personaId);
        if (existingParticipacion) {
            if (existingParticipacion.activo) {
                throw new errors_1.ConflictError(`La persona con ID ${personaId} ya está inscrita activamente en la actividad ${actividad.nombre}`);
            }
            else {
                throw new errors_1.ConflictError(`La persona con ID ${personaId} ya estuvo inscrita en la actividad ${actividad.nombre}. ` +
                    `Debe reactivar la participación existente (ID: ${existingParticipacion.id}) en lugar de crear una nueva.`);
            }
        }
        const participacion = await this.actividadRepository.addParticipante(actividadId, personaId, fechaInicio, observaciones);
        logger_1.logger.info(`Participante inscrito: ${personaId} en actividad ${actividad.nombre} (ID: ${actividadId})`);
        return participacion;
    }
    async deleteParticipante(actividadId, participanteId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new errors_1.NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
        }
        const participacion = await this.actividadRepository.deleteParticipante(actividadId, participanteId);
        logger_1.logger.info(`Participante eliminado: ID ${participanteId} de actividad ${actividad.nombre} (ID: ${actividadId})`);
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
            tipoActividadId: 1,
            categoriaId: 1,
            estadoId: 1,
            descripcion: original.descripcion,
            fechaDesde: nuevaFechaDesde,
            fechaHasta: nuevaFechaHasta,
            cupoMaximo: original.capacidadMaxima || undefined,
            costo: Number(original.precio) || 0,
            observaciones: `Duplicado de: ${original.nombre} (ID: ${original.id})`,
            reservasAulas: [],
            horarios: copiarHorarios ? original.horarios_actividades?.map((h) => ({
                diaSemanaId: h.dia_semana_id || h.diaSemana,
                horaInicio: typeof h.hora_inicio === 'string' ? h.hora_inicio : h.horaInicio,
                horaFin: typeof h.hora_fin === 'string' ? h.hora_fin : h.horaFin,
                activo: h.activo
            })) : [],
            docentes: copiarDocentes ? original.docentes_actividades?.map((d) => ({
                docenteId: d.docente_id || d.docenteId,
                rolDocenteId: d.rol_docente_id || d.rolDocenteId,
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
                limit: 1000,
                orderBy: 'nombre',
                orderDir: 'asc'
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
                    codigo: a.codigo_actividad || a.nombre,
                    nombre: a.nombre,
                    cupoMaximo: a.capacidadMaxima,
                    costo: Number(a.precio) || 0
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
                limit: 100,
                orderBy: 'nombre',
                orderDir: 'asc'
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
                    codigo: act.codigo_actividad || act.nombre,
                    nombre: act.nombre,
                    tipo: act.tipos_actividades?.nombre || act.tipo,
                    horarios: act.horarios_actividades?.map((h) => ({
                        horaInicio: typeof h.hora_inicio === 'string' ? h.hora_inicio : h.horaInicio,
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