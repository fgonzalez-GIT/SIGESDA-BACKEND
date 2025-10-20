"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipacionService = void 0;
const participacion_dto_1 = require("@/dto/participacion.dto");
class ParticipacionService {
    constructor(participacionRepository, personaRepository, actividadRepository, asistenciaRepository) {
        this.participacionRepository = participacionRepository;
        this.personaRepository = personaRepository;
        this.actividadRepository = actividadRepository;
        this.asistenciaRepository = asistenciaRepository;
    }
    async create(data) {
        const persona = await this.personaRepository.findById(data.personaId);
        if (!persona) {
            throw new Error(`Persona con ID ${data.personaId} no encontrada`);
        }
        const actividad = await this.actividadRepository.findById(data.actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
        }
        const participantesActuales = await this.participacionRepository.contarParticipantesPorActividad(data.actividadId);
        if (actividad.capacidadMaxima && participantesActuales.activos >= actividad.capacidadMaxima) {
            throw new Error(`La actividad "${actividad.nombre}" ha alcanzado su capacidad máxima de ${actividad.capacidadMaxima} participantes`);
        }
        const conflictos = await this.participacionRepository.verificarConflictosHorarios(data.personaId, data.fechaInicio, data.fechaFin || undefined);
        if (conflictos.length > 0) {
            const nombreConflictos = conflictos.map(c => c.actividad.nombre).join(', ');
            throw new Error(`La persona ya tiene participaciones activas que se solapan con estas fechas en: ${nombreConflictos}`);
        }
        let precioFinal = data.precioEspecial;
        if (!precioFinal) {
            if (persona.tipo === 'SOCIO' && actividad.precio === 0) {
                precioFinal = 0;
            }
            else {
                precioFinal = Number(actividad.precio);
            }
        }
        const participacion = await this.participacionRepository.create({
            ...data,
            precioEspecial: precioFinal
        });
        return {
            ...participacion,
            estado: (0, participacion_dto_1.determinarEstado)(participacion),
            diasTranscurridos: Math.floor((new Date().getTime() - participacion.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
        };
    }
    async findAll(query) {
        const result = await this.participacionRepository.findAll(query);
        const totalPages = Math.ceil(result.total / query.limit);
        const participacionesConEstado = result.data.map(p => ({
            ...p,
            estado: (0, participacion_dto_1.determinarEstado)(p),
            diasTranscurridos: Math.floor((new Date().getTime() - p.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
        }));
        return {
            data: participacionesConEstado,
            total: result.total,
            page: query.page,
            totalPages
        };
    }
    async findById(id) {
        const participacion = await this.participacionRepository.findById(id);
        if (!participacion) {
            throw new Error(`Participación con ID ${id} no encontrada`);
        }
        return {
            ...participacion,
            estado: (0, participacion_dto_1.determinarEstado)(participacion),
            diasTranscurridos: Math.floor((new Date().getTime() - participacion.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
        };
    }
    async findByPersonaId(personaId) {
        const persona = await this.personaRepository.findById(personaId);
        if (!persona) {
            throw new Error(`Persona con ID ${personaId} no encontrada`);
        }
        const participaciones = await this.participacionRepository.findByPersonaId(personaId);
        return participaciones.map(p => ({
            ...p,
            estado: (0, participacion_dto_1.determinarEstado)(p),
            diasTranscurridos: Math.floor((new Date().getTime() - p.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
        }));
    }
    async findByActividadId(actividadId) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
        const participaciones = await this.participacionRepository.findByActividadId(actividadId);
        return participaciones.map(p => ({
            ...p,
            estado: (0, participacion_dto_1.determinarEstado)(p),
            diasTranscurridos: Math.floor((new Date().getTime() - p.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
        }));
    }
    async update(id, data) {
        const existing = await this.participacionRepository.findById(id);
        if (!existing) {
            throw new Error(`Participación con ID ${id} no encontrada`);
        }
        if (data.fechaInicio || data.fechaFin) {
            const fechaInicio = data.fechaInicio || existing.fechaInicio;
            const fechaFin = data.fechaFin !== undefined ? data.fechaFin : existing.fechaFin;
            const conflictos = await this.participacionRepository.verificarConflictosHorarios(existing.personaId, fechaInicio, fechaFin || undefined, id);
            if (conflictos.length > 0) {
                const nombreConflictos = conflictos.map(c => c.actividad.nombre).join(', ');
                throw new Error(`Las nuevas fechas se solapan con participaciones existentes en: ${nombreConflictos}`);
            }
        }
        const participacion = await this.participacionRepository.update(id, data);
        return {
            ...participacion,
            estado: (0, participacion_dto_1.determinarEstado)(participacion),
            diasTranscurridos: Math.floor((new Date().getTime() - participacion.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
        };
    }
    async delete(id) {
        const existing = await this.participacionRepository.findById(id);
        if (!existing) {
            throw new Error(`Participación con ID ${id} no encontrada`);
        }
        return this.participacionRepository.delete(id);
    }
    async inscripcionMasiva(data) {
        const persona = await this.personaRepository.findById(data.personaId);
        if (!persona) {
            throw new Error(`Persona con ID ${data.personaId} no encontrada`);
        }
        const participacionesCreadas = [];
        const errores = [];
        for (const inscripcion of data.actividades) {
            try {
                const actividad = await this.actividadRepository.findById(inscripcion.actividadId);
                if (!actividad) {
                    errores.push(`Actividad con ID ${inscripcion.actividadId} no encontrada`);
                    continue;
                }
                const participantesActuales = await this.participacionRepository.contarParticipantesPorActividad(inscripcion.actividadId);
                if (actividad.capacidadMaxima && participantesActuales.activos >= actividad.capacidadMaxima) {
                    errores.push(`La actividad "${actividad.nombre}" ha alcanzado su capacidad máxima`);
                    continue;
                }
                const conflictos = await this.participacionRepository.verificarConflictosHorarios(data.personaId, inscripcion.fechaInicio, inscripcion.fechaFin || undefined);
                if (conflictos.length > 0) {
                    errores.push(`Conflicto de horarios con actividad "${actividad.nombre}"`);
                    continue;
                }
                let precio = inscripcion.precioEspecial ?? Number(actividad.precio);
                if (data.aplicarDescuentoFamiliar && persona.tipo === 'SOCIO') {
                    precio = precio * 0.8;
                }
                const participacion = await this.participacionRepository.create({
                    personaId: data.personaId,
                    actividadId: inscripcion.actividadId,
                    fechaInicio: inscripcion.fechaInicio,
                    fechaFin: inscripcion.fechaFin,
                    precioEspecial: precio,
                    observaciones: inscripcion.observaciones
                });
                participacionesCreadas.push(participacion);
            }
            catch (error) {
                errores.push(`Error en actividad ${inscripcion.actividadId}: ${error}`);
            }
        }
        return {
            participacionesCreadas,
            errores,
            totalCreadas: participacionesCreadas.length,
            totalErrores: errores.length
        };
    }
    async desinscribir(id, data) {
        const participacion = await this.participacionRepository.findById(id);
        if (!participacion) {
            throw new Error(`Participación con ID ${id} no encontrada`);
        }
        if (!participacion.activa) {
            throw new Error('La participación ya está inactiva');
        }
        return this.participacionRepository.finalizarParticipacion(id, data.fechaFin, data.motivoDesincripcion);
    }
    async reactivar(id) {
        const participacion = await this.participacionRepository.findById(id);
        if (!participacion) {
            throw new Error(`Participación con ID ${id} no encontrada`);
        }
        if (participacion.activa) {
            throw new Error('La participación ya está activa');
        }
        const actividad = await this.actividadRepository.findById(participacion.actividadId);
        if (actividad?.capacidadMaxima) {
            const participantesActuales = await this.participacionRepository.contarParticipantesPorActividad(participacion.actividadId);
            if (participantesActuales.activos >= actividad.capacidadMaxima) {
                throw new Error(`La actividad "${actividad.nombre}" ya no tiene cupos disponibles`);
            }
        }
        return this.participacionRepository.reactivarParticipacion(id);
    }
    async transferir(id, data) {
        const participacion = await this.participacionRepository.findById(id);
        if (!participacion) {
            throw new Error(`Participación con ID ${id} no encontrada`);
        }
        const nuevaActividad = await this.actividadRepository.findById(data.nuevaActividadId);
        if (!nuevaActividad) {
            throw new Error(`Actividad destino con ID ${data.nuevaActividadId} no encontrada`);
        }
        const participantesActuales = await this.participacionRepository.contarParticipantesPorActividad(data.nuevaActividadId);
        if (nuevaActividad.capacidadMaxima && participantesActuales.activos >= nuevaActividad.capacidadMaxima) {
            throw new Error(`La actividad destino "${nuevaActividad.nombre}" ha alcanzado su capacidad máxima`);
        }
        return this.participacionRepository.transferirParticipacion(id, data.nuevaActividadId, data.fechaTransferencia, data.conservarFechaInicio);
    }
    async verificarCupos(data) {
        const actividad = await this.actividadRepository.findById(data.actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
        }
        const participantes = await this.participacionRepository.contarParticipantesPorActividad(data.actividadId);
        const cuposDisponibles = actividad.capacidadMaxima ?
            actividad.capacidadMaxima - participantes.activos :
            null;
        return {
            actividad: {
                id: actividad.id,
                nombre: actividad.nombre,
                capacidadMaxima: actividad.capacidadMaxima
            },
            participantes,
            cuposDisponibles,
            disponible: cuposDisponibles === null || cuposDisponibles > 0
        };
    }
    async getEstadisticas(params) {
        return this.participacionRepository.getEstadisticasParticipacion(params);
    }
    async getParticipacionesActivas(personaId) {
        const participaciones = await this.participacionRepository.findParticipacionesActivas(personaId);
        return participaciones.map(p => ({
            ...p,
            estado: participacion_dto_1.EstadoParticipacion.ACTIVA,
            diasTranscurridos: Math.floor((new Date().getTime() - p.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
        }));
    }
    async getParticipacionesPorVencer(dias = 30) {
        const participaciones = await this.participacionRepository.getParticipacionesPorVencer(dias);
        return participaciones.map(p => ({
            ...p,
            estado: participacion_dto_1.EstadoParticipacion.ACTIVA,
            diasRestantes: p.fechaFin ?
                Math.ceil((p.fechaFin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
                null
        }));
    }
    async getReporteInasistencias(params) {
        if (!this.asistenciaRepository) {
            const participaciones = await this.participacionRepository.getReporteInasistencias(params);
            return participaciones.map(p => ({
                ...p,
                diasDesdeInicio: Math.floor((new Date().getTime() - p.fechaInicio.getTime()) / (1000 * 60 * 60 * 24)),
                estado: (0, participacion_dto_1.determinarEstado)(p),
                inasistenciasEstimadas: Math.floor(Math.random() * params.umbralInasistencias)
            }));
        }
        const alertas = await this.asistenciaRepository.getAlertasInasistencias({
            umbral: params.umbralInasistencias,
            actividadId: params.actividadId,
            soloActivas: true
        });
        const resultado = await Promise.all(alertas.map(async (alerta) => {
            const participacion = await this.participacionRepository.findById(String(alerta.participacion_id));
            return {
                participacionId: alerta.participacion_id,
                personaId: alerta.persona_id,
                nombreCompleto: `${alerta.nombre} ${alerta.apellido}`,
                actividadId: alerta.actividad_id,
                actividadNombre: alerta.actividad_nombre,
                inasistenciasConsecutivas: alerta.inasistencias_consecutivas,
                periodoInasistencias: {
                    desde: alerta.fecha_inicio,
                    hasta: alerta.fecha_ultima
                },
                diasDesdeInicio: participacion
                    ? Math.floor((new Date().getTime() - participacion.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
                    : null,
                estado: participacion ? (0, participacion_dto_1.determinarEstado)(participacion) : null
            };
        }));
        return resultado;
    }
    async getDashboardParticipacion() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const inicioAno = new Date(ahora.getFullYear(), 0, 1);
        const [totalActivas, nuevasEsteMes, nuevasEsteAno, porVencer, porActividad] = await Promise.all([
            this.participacionRepository.findParticipacionesActivas().then(p => p.length),
            this.participacionRepository.findAll({
                fechaDesde: inicioMes,
                page: 1,
                limit: 1,
                sortBy: 'fechaInicio',
                sortOrder: 'desc'
            }).then(r => r.total),
            this.participacionRepository.findAll({
                fechaDesde: inicioAno,
                page: 1,
                limit: 1,
                sortBy: 'fechaInicio',
                sortOrder: 'desc'
            }).then(r => r.total),
            this.participacionRepository.getParticipacionesPorVencer().then(p => p.length),
            this.participacionRepository.getEstadisticasParticipacion({
                agruparPor: 'actividad',
                soloActivas: true
            })
        ]);
        return {
            resumen: {
                totalActivas,
                nuevasEsteMes,
                nuevasEsteAno,
                porVencer
            },
            topActividades: porActividad.slice(0, 5),
            fecha: ahora
        };
    }
}
exports.ParticipacionService = ParticipacionService;
//# sourceMappingURL=participacion.service.js.map