"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaAulaService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
class ReservaAulaService {
    constructor(reservaAulaRepository, aulaRepository, personaRepository, actividadRepository) {
        this.reservaAulaRepository = reservaAulaRepository;
        this.aulaRepository = aulaRepository;
        this.personaRepository = personaRepository;
        this.actividadRepository = actividadRepository;
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
        if (docente.tipo !== client_1.TipoPersona.DOCENTE) {
            throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente`);
        }
        if (docente.fechaBaja) {
            throw new Error(`El docente ${docente.nombre} ${docente.apellido} está dado de baja`);
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
            const conflictDetails = conflicts.map(c => `${c.aula.nombre} - ${new Date(c.fechaInicio).toLocaleString()} a ${new Date(c.fechaFin).toLocaleString()}`).join(', ');
            throw new Error(`Conflicto de horarios detectado con las siguientes reservas: ${conflictDetails}`);
        }
        await this.validateDocenteAvailability(data.docenteId, data.fechaInicio, data.fechaFin);
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
            if (!docente || docente.tipo !== client_1.TipoPersona.DOCENTE || docente.fechaBaja) {
                throw new Error(`Docente con ID ${data.docenteId} no válido`);
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
                if (!docente || docente.tipo !== client_1.TipoPersona.DOCENTE || docente.fechaBaja) {
                    errors.push(`Docente ${reserva.docenteId} no válido`);
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
            const conflictDetails = conflicts.map(c => `${c.aula.nombre} - ${new Date(c.fechaInicio).toLocaleString()}`).join(', ');
            throw new Error(`El docente ya tiene reservas en horarios conflictivos: ${conflictDetails}`);
        }
    }
}
exports.ReservaAulaService = ReservaAulaService;
//# sourceMappingURL=reserva-aula.service.js.map