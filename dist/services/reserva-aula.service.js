"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaAulaService = void 0;
const estado_reserva_service_1 = require("@/services/estado-reserva.service");
const logger_1 = require("@/utils/logger");
const persona_helper_1 = require("@/utils/persona.helper");
class ReservaAulaService {
    constructor(reservaAulaRepository, aulaRepository, personaRepository, actividadRepository, prisma) {
        this.reservaAulaRepository = reservaAulaRepository;
        this.aulaRepository = aulaRepository;
        this.personaRepository = personaRepository;
        this.actividadRepository = actividadRepository;
        this.prisma = prisma;
        this.estadoReservaService = new estado_reserva_service_1.EstadoReservaService(prisma);
    }
    async createReserva(data) {
        const aula = await this.aulaRepository.findById(data.aulaId);
        if (!aula) {
            throw new Error(`Aula con ID ${data.aulaId} no encontrada`);
        }
        if (!aula.activa) {
            throw new Error(`El aula ${aula.nombre} no está activa`);
        }
        const docente = await this.personaRepository.findById(data.docenteId);
        if (!docente) {
            throw new Error(`Docente con ID ${data.docenteId} no encontrado`);
        }
        if (!docente.activo) {
            throw new Error(`La persona ${docente.nombre} ${docente.apellido} está inactiva`);
        }
        const esDocente = await (0, persona_helper_1.hasActiveTipo)(docente.id, 'DOCENTE');
        if (!esDocente) {
            throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente activo`);
        }
        if (data.actividadId) {
            const actividad = await this.actividadRepository.findById(data.actividadId);
            if (!actividad) {
                throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
            }
            if (!actividad.activa) {
                throw new Error(`La actividad ${actividad.nombre} no está activa`);
            }
        }
        const conflicts = await this.detectConflicts({
            aulaId: data.aulaId,
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin
        });
        if (conflicts.length > 0) {
            const conflictDetails = conflicts.map(c => `${c.aulas.nombre} - ${new Date(c.fechaInicio).toLocaleString()} a ${new Date(c.fechaFin).toLocaleString()}`).join(', ');
            throw new Error(`Conflicto de horarios detectado con las siguientes reservas: ${conflictDetails}`);
        }
        await this.validateDocenteAvailability(data.docenteId, data.fechaInicio, data.fechaFin);
        if (!data.estadoReservaId) {
            const estadoInicial = await this.estadoReservaService.getEstadoInicial();
            data.estadoReservaId = estadoInicial.id;
        }
        const reserva = await this.reservaAulaRepository.create(data);
        logger_1.logger.info(`Reserva de aula creada: ${aula.nombre} - ${docente.nombre} ${docente.apellido} - ${new Date(data.fechaInicio).toLocaleString()} (ID: ${reserva.id})`);
        return reserva;
    }
    async getReservas(query) {
        const result = await this.reservaAulaRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            ...result,
            pages
        };
    }
    async getReservaById(id) {
        return this.reservaAulaRepository.findById(id);
    }
    async getReservasByAula(aulaId, incluirPasadas = false) {
        const aula = await this.aulaRepository.findById(aulaId);
        if (!aula) {
            throw new Error(`Aula con ID ${aulaId} no encontrada`);
        }
        return this.reservaAulaRepository.findByAulaId(aulaId, incluirPasadas);
    }
    async getReservasByDocente(docenteId, incluirPasadas = false) {
        const docente = await this.personaRepository.findById(docenteId);
        if (!docente) {
            throw new Error(`Docente con ID ${docenteId} no encontrado`);
        }
        return this.reservaAulaRepository.findByDocenteId(docenteId, incluirPasadas);
    }
    async getReservasByActividad(actividadId, incluirPasadas = false) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
        return this.reservaAulaRepository.findByActividadId(actividadId, incluirPasadas);
    }
    async updateReserva(id, data) {
        const existingReserva = await this.reservaAulaRepository.findById(id);
        if (!existingReserva) {
            throw new Error(`Reserva con ID ${id} no encontrada`);
        }
        if (data.aulaId && data.aulaId !== existingReserva.aulaId) {
            const aula = await this.aulaRepository.findById(data.aulaId);
            if (!aula || !aula.activa) {
                throw new Error(`Aula con ID ${data.aulaId} no encontrada o inactiva`);
            }
        }
        if (data.docenteId && data.docenteId !== existingReserva.docenteId) {
            const docente = await this.personaRepository.findById(data.docenteId);
            if (!docente) {
                throw new Error(`Docente con ID ${data.docenteId} no encontrado`);
            }
            if (!docente.activo) {
                throw new Error(`Docente con ID ${data.docenteId} está inactivo`);
            }
            const esDocente = await (0, persona_helper_1.hasActiveTipo)(docente.id, 'DOCENTE');
            if (!esDocente) {
                throw new Error(`La persona con ID ${data.docenteId} no es un docente activo`);
            }
        }
        if (data.actividadId !== undefined && data.actividadId !== existingReserva.actividadId) {
            if (data.actividadId) {
                const actividad = await this.actividadRepository.findById(data.actividadId);
                if (!actividad || !actividad.activa) {
                    throw new Error(`Actividad con ID ${data.actividadId} no encontrada o inactiva`);
                }
            }
        }
        if (data.fechaInicio || data.fechaFin || data.aulaId) {
            const conflictData = {
                aulaId: data.aulaId || existingReserva.aulaId,
                fechaInicio: data.fechaInicio || existingReserva.fechaInicio.toISOString(),
                fechaFin: data.fechaFin || existingReserva.fechaFin.toISOString(),
                excludeReservaId: id
            };
            const conflicts = await this.detectConflicts(conflictData);
            if (conflicts.length > 0) {
                throw new Error(`Actualización cancelada: conflicto de horarios detectado`);
            }
            const docenteId = data.docenteId || existingReserva.docenteId;
            const fechaInicio = data.fechaInicio || existingReserva.fechaInicio.toISOString();
            const fechaFin = data.fechaFin || existingReserva.fechaFin.toISOString();
            await this.validateDocenteAvailability(docenteId, fechaInicio, fechaFin, id);
        }
        const updatedReserva = await this.reservaAulaRepository.update(id, data);
        logger_1.logger.info(`Reserva de aula actualizada: ID ${id}`);
        return updatedReserva;
    }
    async deleteReserva(id) {
        const existingReserva = await this.reservaAulaRepository.findById(id);
        if (!existingReserva) {
            throw new Error(`Reserva con ID ${id} no encontrada`);
        }
        const now = new Date();
        if (existingReserva.fechaFin < now) {
            throw new Error(`No se puede eliminar una reserva que ya finalizó`);
        }
        const deletedReserva = await this.reservaAulaRepository.delete(id);
        logger_1.logger.info(`Reserva de aula eliminada: ${existingReserva.aula.nombre} - ${new Date(existingReserva.fechaInicio).toLocaleString()}`);
        return deletedReserva;
    }
    async detectConflicts(conflictData) {
        return this.reservaAulaRepository.detectConflicts(conflictData);
    }
    async createBulkReservas(data) {
        const errors = [];
        const validReservas = [];
        for (const reserva of data.reservas) {
            try {
                const [aula, docente, actividad] = await Promise.all([
                    this.aulaRepository.findById(reserva.aulaId),
                    this.personaRepository.findById(reserva.docenteId),
                    reserva.actividadId ? this.actividadRepository.findById(reserva.actividadId) : null
                ]);
                if (!aula || !aula.activa) {
                    errors.push(`Aula ${reserva.aulaId} no válida`);
                    continue;
                }
                if (!docente) {
                    errors.push(`Docente ${reserva.docenteId} no encontrado`);
                    continue;
                }
                if (!docente.activo) {
                    errors.push(`Docente ${reserva.docenteId} está inactivo`);
                    continue;
                }
                const esDocente = await (0, persona_helper_1.hasActiveTipo)(docente.id, 'DOCENTE');
                if (!esDocente) {
                    errors.push(`Persona ${reserva.docenteId} no es un docente activo`);
                    continue;
                }
                if (reserva.actividadId && (!actividad || !actividad.activa)) {
                    errors.push(`Actividad ${reserva.actividadId} no válida`);
                    continue;
                }
                const conflicts = await this.detectConflicts({
                    aulaId: reserva.aulaId,
                    fechaInicio: reserva.fechaInicio,
                    fechaFin: reserva.fechaFin
                });
                if (conflicts.length > 0) {
                    errors.push(`Conflicto de horarios para ${aula.nombre} en ${new Date(reserva.fechaInicio).toLocaleString()}`);
                    continue;
                }
                validReservas.push(reserva);
            }
            catch (error) {
                errors.push(`Error validando reserva: ${error}`);
            }
        }
        const result = validReservas.length > 0
            ? await this.reservaAulaRepository.createBulk(validReservas)
            : { count: 0 };
        logger_1.logger.info(`Creación masiva de reservas: ${result.count} creadas, ${errors.length} errores`);
        return {
            count: result.count,
            errors
        };
    }
    async deleteBulkReservas(data) {
        const reservas = await Promise.all(data.ids.map(id => this.reservaAulaRepository.findById(id)));
        const now = new Date();
        const invalidIds = reservas
            .filter((reserva, index) => !reserva || reserva.fechaFin < now)
            .map((_, index) => data.ids[index]);
        if (invalidIds.length > 0) {
            throw new Error(`No se pueden eliminar reservas pasadas o inexistentes: ${invalidIds.join(', ')}`);
        }
        const result = await this.reservaAulaRepository.deleteBulk(data.ids);
        logger_1.logger.info(`Eliminación masiva de reservas: ${result.count} eliminadas`);
        return result;
    }
    async createRecurringReserva(data) {
        const errors = [];
        const reservasToCreate = [];
        const inicio = new Date(data.fechaInicio);
        const fin = new Date(data.fechaFin);
        const hasta = new Date(data.recurrencia.fechaHasta);
        const duracion = fin.getTime() - inicio.getTime();
        let currentDate = new Date(inicio);
        let count = 0;
        while (currentDate <= hasta && count < (data.recurrencia.maxOcurrencias || 100)) {
            let shouldCreate = true;
            if (data.recurrencia.tipo === 'SEMANAL' && data.recurrencia.diasSemana) {
                const dayOfWeek = currentDate.getDay();
                shouldCreate = data.recurrencia.diasSemana.includes(dayOfWeek);
            }
            if (shouldCreate) {
                const reservaFin = new Date(currentDate.getTime() + duracion);
                reservasToCreate.push({
                    aulaId: data.aulaId,
                    actividadId: data.actividadId,
                    docenteId: data.docenteId,
                    fechaInicio: currentDate.toISOString(),
                    fechaFin: reservaFin.toISOString(),
                    observaciones: data.observaciones
                });
            }
            switch (data.recurrencia.tipo) {
                case 'DIARIO':
                    currentDate.setDate(currentDate.getDate() + data.recurrencia.intervalo);
                    break;
                case 'SEMANAL':
                    currentDate.setDate(currentDate.getDate() + (7 * data.recurrencia.intervalo));
                    break;
                case 'MENSUAL':
                    currentDate.setMonth(currentDate.getMonth() + data.recurrencia.intervalo);
                    break;
            }
            count++;
        }
        const result = await this.createBulkReservas({ reservas: reservasToCreate });
        logger_1.logger.info(`Reservas recurrentes creadas: ${result.count} de ${reservasToCreate.length} planificadas`);
        return result;
    }
    async searchReservas(searchData) {
        return this.reservaAulaRepository.search(searchData);
    }
    async getStatistics(statsData) {
        return this.reservaAulaRepository.getStatistics(statsData);
    }
    async getUpcomingReservations(limit = 10) {
        return this.reservaAulaRepository.getUpcomingReservations(limit);
    }
    async getCurrentReservations() {
        return this.reservaAulaRepository.getCurrentReservations();
    }
    async validateDocenteAvailability(docenteId, fechaInicio, fechaFin, excludeReservaId) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const docenteReservas = await this.reservaAulaRepository.findByDocenteId(docenteId, true);
        const conflicts = docenteReservas.filter(reserva => {
            if (excludeReservaId && reserva.id === excludeReservaId) {
                return false;
            }
            const reservaInicio = new Date(reserva.fechaInicio);
            const reservaFin = new Date(reserva.fechaFin);
            return (inicio < reservaFin && fin > reservaInicio);
        });
        if (conflicts.length > 0) {
            const conflictDetails = conflicts.map(c => `${c.aulas.nombre} - ${new Date(c.fechaInicio).toLocaleString()}`).join(', ');
            throw new Error(`El docente ya tiene reservas en horarios conflictivos: ${conflictDetails}`);
        }
    }
    async aprobarReserva(id, data) {
        const reserva = await this.reservaAulaRepository.findById(id);
        if (!reserva) {
            throw new Error(`Reserva con ID ${id} no encontrada`);
        }
        if (!reserva.estadoReserva) {
            throw new Error('La reserva no tiene un estado asignado');
        }
        const transicionValida = await this.estadoReservaService.validateTransicion(reserva.estadoReserva.codigo, 'CONFIRMADA');
        if (!transicionValida) {
            throw new Error(`No se puede aprobar una reserva en estado ${reserva.estadoReserva.nombre}. ` +
                `Solo se pueden aprobar reservas en estado PENDIENTE`);
        }
        const aprobador = await this.personaRepository.findById(data.aprobadoPorId);
        if (!aprobador || !aprobador.activo) {
            throw new Error('La persona que intenta aprobar no existe o está inactiva');
        }
        const estadoConfirmada = await this.estadoReservaService.findByCodigo('CONFIRMADA');
        const updatedReserva = await this.reservaAulaRepository.update(id, {
            estadoReservaId: estadoConfirmada.data.id,
            aprobadoPorId: data.aprobadoPorId,
            observaciones: data.observaciones || reserva.observaciones
        });
        logger_1.logger.info(`Reserva ${id} aprobada por persona ${data.aprobadoPorId}`);
        return updatedReserva;
    }
    async rechazarReserva(id, data) {
        const reserva = await this.reservaAulaRepository.findById(id);
        if (!reserva) {
            throw new Error(`Reserva con ID ${id} no encontrada`);
        }
        if (!reserva.estadoReserva) {
            throw new Error('La reserva no tiene un estado asignado');
        }
        const transicionValida = await this.estadoReservaService.validateTransicion(reserva.estadoReserva.codigo, 'RECHAZADA');
        if (!transicionValida) {
            throw new Error(`No se puede rechazar una reserva en estado ${reserva.estadoReserva.nombre}. ` +
                `Solo se pueden rechazar reservas en estado PENDIENTE`);
        }
        const rechazador = await this.personaRepository.findById(data.rechazadoPorId);
        if (!rechazador || !rechazador.activo) {
            throw new Error('La persona que intenta rechazar no existe o está inactiva');
        }
        const estadoRechazada = await this.estadoReservaService.findByCodigo('RECHAZADA');
        const updatedReserva = await this.reservaAulaRepository.update(id, {
            estadoReservaId: estadoRechazada.data.id,
            canceladoPorId: data.rechazadoPorId,
            motivoCancelacion: data.motivo,
            activa: false
        });
        logger_1.logger.info(`Reserva ${id} rechazada por persona ${data.rechazadoPorId}. Motivo: ${data.motivo}`);
        return updatedReserva;
    }
    async cancelarReserva(id, data) {
        const reserva = await this.reservaAulaRepository.findById(id);
        if (!reserva) {
            throw new Error(`Reserva con ID ${id} no encontrada`);
        }
        if (!reserva.estadoReserva) {
            throw new Error('La reserva no tiene un estado asignado');
        }
        const transicionValida = await this.estadoReservaService.validateTransicion(reserva.estadoReserva.codigo, 'CANCELADA');
        if (!transicionValida) {
            throw new Error(`No se puede cancelar una reserva en estado ${reserva.estadoReserva.nombre}. ` +
                `Solo se pueden cancelar reservas en estado PENDIENTE o CONFIRMADA`);
        }
        const cancelador = await this.personaRepository.findById(data.canceladoPorId);
        if (!cancelador || !cancelador.activo) {
            throw new Error('La persona que intenta cancelar no existe o está inactiva');
        }
        const estadoCancelada = await this.estadoReservaService.findByCodigo('CANCELADA');
        const updatedReserva = await this.reservaAulaRepository.update(id, {
            estadoReservaId: estadoCancelada.data.id,
            canceladoPorId: data.canceladoPorId,
            motivoCancelacion: data.motivoCancelacion,
            activa: false
        });
        logger_1.logger.info(`Reserva ${id} cancelada por persona ${data.canceladoPorId}. Motivo: ${data.motivoCancelacion}`);
        return updatedReserva;
    }
    async completarReserva(id) {
        const reserva = await this.reservaAulaRepository.findById(id);
        if (!reserva) {
            throw new Error(`Reserva con ID ${id} no encontrada`);
        }
        if (!reserva.estadoReserva) {
            throw new Error('La reserva no tiene un estado asignado');
        }
        const transicionValida = await this.estadoReservaService.validateTransicion(reserva.estadoReserva.codigo, 'COMPLETADA');
        if (!transicionValida) {
            throw new Error(`No se puede completar una reserva en estado ${reserva.estadoReserva.nombre}. ` +
                `Solo se pueden completar reservas en estado CONFIRMADA`);
        }
        const now = new Date();
        if (reserva.fechaFin > now) {
            throw new Error('No se puede completar una reserva que aún no ha finalizado');
        }
        const estadoCompletada = await this.estadoReservaService.findByCodigo('COMPLETADA');
        const updatedReserva = await this.reservaAulaRepository.update(id, {
            estadoReservaId: estadoCompletada.data.id
        });
        logger_1.logger.info(`Reserva ${id} marcada como completada`);
        return updatedReserva;
    }
    async detectAllConflicts(conflictData) {
        const [puntuales, recurrentes] = await Promise.all([
            this.reservaAulaRepository.detectConflicts(conflictData),
            this.reservaAulaRepository.detectRecurrentConflicts(conflictData)
        ]);
        return {
            puntuales,
            recurrentes,
            total: puntuales.length + recurrentes.length
        };
    }
    async validateCapacidadAula(aulaId, actividadId) {
        const aula = await this.aulaRepository.findById(aulaId);
        if (!aula) {
            throw new Error(`Aula con ID ${aulaId} no encontrada`);
        }
        if (actividadId) {
            const actividad = await this.actividadRepository.findById(actividadId);
            if (!actividad) {
                throw new Error(`Actividad con ID ${actividadId} no encontrada`);
            }
        }
        return true;
    }
    async validateEquipamientoRequerido(aulaId, actividadId) {
        const aula = await this.aulaRepository.findById(aulaId);
        if (!aula) {
            throw new Error(`Aula con ID ${aulaId} no encontrada`);
        }
        if (actividadId) {
            const actividad = await this.actividadRepository.findById(actividadId);
            if (!actividad) {
                throw new Error(`Actividad con ID ${actividadId} no encontrada`);
            }
        }
        return true;
    }
    async validateHorarioOperacion(aulaId, fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const horaInicio = inicio.getHours();
        const minutoInicio = inicio.getMinutes();
        const horaFin = fin.getHours();
        const minutoFin = fin.getMinutes();
        const HORA_APERTURA = 8;
        const HORA_CIERRE = 22;
        if (horaInicio < HORA_APERTURA || (horaFin > HORA_CIERRE || (horaFin === HORA_CIERRE && minutoFin > 0))) {
            throw new Error(`La reserva debe estar dentro del horario de operación (${HORA_APERTURA}:00 - ${HORA_CIERRE}:00)`);
        }
        return true;
    }
}
exports.ReservaAulaService = ReservaAulaService;
//# sourceMappingURL=reserva-aula.service.js.map