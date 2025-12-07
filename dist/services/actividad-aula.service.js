"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadAulaService = void 0;
const actividad_aula_helper_1 = require("@/utils/actividad-aula.helper");
const logger_1 = require("@/utils/logger");
class ActividadAulaService {
    constructor(actividadAulaRepository, actividadRepository, aulaRepository, prisma) {
        this.actividadAulaRepository = actividadAulaRepository;
        this.actividadRepository = actividadRepository;
        this.aulaRepository = aulaRepository;
        this.prisma = prisma;
    }
    async asignarAula(data) {
        const actividad = await this.actividadRepository.findById(data.actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
        }
        if (!actividad.activa) {
            throw new Error(`No se puede asignar aula a la actividad "${actividad.nombre}" porque está inactiva`);
        }
        const tieneHorarios = await (0, actividad_aula_helper_1.actividadTieneHorarios)(this.prisma, data.actividadId);
        if (!tieneHorarios) {
            throw new Error(`La actividad "${actividad.nombre}" no tiene horarios definidos. ` +
                `Debe asignar horarios antes de asignar un aula.`);
        }
        const aula = await this.aulaRepository.findById(data.aulaId.toString());
        if (!aula) {
            throw new Error(`Aula con ID ${data.aulaId} no encontrada`);
        }
        if (!aula.activa) {
            throw new Error(`No se puede asignar el aula "${aula.nombre}" porque está inactiva`);
        }
        const asignacionExistente = await this.actividadAulaRepository.findByActividadAndAula(data.actividadId, data.aulaId);
        if (asignacionExistente && asignacionExistente.activa) {
            throw new Error(`El aula "${aula.nombre}" ya está asignada a la actividad "${actividad.nombre}". ` +
                `Si desea reasignar, primero desasigne el aula existente.`);
        }
        const participantesActivos = await this.prisma.participacion_actividades.count({
            where: {
                actividadId: data.actividadId,
                activa: true
            }
        });
        if (participantesActivos > aula.capacidad) {
            throw new Error(`Capacidad insuficiente: El aula "${aula.nombre}" tiene capacidad para ${aula.capacidad} personas, ` +
                `pero la actividad "${actividad.nombre}" tiene ${participantesActivos} participantes activos. ` +
                `Necesita un aula con capacidad mínima de ${participantesActivos} personas.`);
        }
        const horariosActividad = await this.prisma.horarios_actividades.findMany({
            where: {
                actividadId: data.actividadId,
                activo: true
            }
        });
        const conflictos = await (0, actividad_aula_helper_1.detectarConflictosHorarios)(this.prisma, data.aulaId, horariosActividad.map(h => ({
            diaSemanaId: h.diaSemanaId,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin
        })));
        if (conflictos.length > 0) {
            const detallesConflictos = conflictos.map(c => `- ${c.tipo}: "${c.nombre}" (${c.diaSemana} ${c.horaInicio}-${c.horaFin})`).join('\n');
            throw new Error(`No se puede asignar el aula "${aula.nombre}" a la actividad "${actividad.nombre}" ` +
                `debido a conflictos horarios:\n${detallesConflictos}\n\n` +
                `Sugerencia: Use el endpoint /verificar-disponibilidad para obtener aulas alternativas.`);
        }
        const asignacion = await this.actividadAulaRepository.create(data);
        logger_1.logger.info(`✅ Aula "${aula.nombre}" asignada a actividad "${actividad.nombre}" ` +
            `(${participantesActivos}/${aula.capacidad} participantes)`);
        return asignacion;
    }
    async findAll(query) {
        const result = await this.actividadAulaRepository.findAll(query);
        const totalPages = Math.ceil(result.total / query.limit);
        return {
            data: result.data,
            total: result.total,
            page: query.page,
            totalPages
        };
    }
    async findById(id) {
        const asignacion = await this.actividadAulaRepository.findById(id);
        if (!asignacion) {
            throw new Error(`Asignación con ID ${id} no encontrada`);
        }
        return asignacion;
    }
    async getAulasByActividad(actividadId, soloActivas = true) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
        return this.actividadAulaRepository.findByActividadId(actividadId, soloActivas);
    }
    async getActividadesByAula(aulaId, soloActivas = true) {
        const aula = await this.aulaRepository.findById(aulaId.toString());
        if (!aula) {
            throw new Error(`Aula con ID ${aulaId} no encontrada`);
        }
        return this.actividadAulaRepository.findByAulaId(aulaId, soloActivas);
    }
    async update(id, data) {
        const asignacionExistente = await this.actividadAulaRepository.findById(id);
        if (!asignacionExistente) {
            throw new Error(`Asignación con ID ${id} no encontrada`);
        }
        return this.actividadAulaRepository.update(id, data);
    }
    async delete(id) {
        const asignacionExistente = await this.actividadAulaRepository.findById(id);
        if (!asignacionExistente) {
            throw new Error(`Asignación con ID ${id} no encontrada`);
        }
        const deleted = await this.actividadAulaRepository.delete(id);
        logger_1.logger.info(`❌ Asignación eliminada: Aula "${asignacionExistente.aulas.nombre}" ` +
            `de actividad "${asignacionExistente.actividades.nombre}"`);
        return deleted;
    }
    async desasignarAula(id, data) {
        const asignacionExistente = await this.actividadAulaRepository.findById(id);
        if (!asignacionExistente) {
            throw new Error(`Asignación con ID ${id} no encontrada`);
        }
        if (!asignacionExistente.activa) {
            throw new Error('La asignación ya está desactivada');
        }
        const desasignada = await this.actividadAulaRepository.desasignar(id, data.fechaDesasignacion ? new Date(data.fechaDesasignacion) : undefined, data.observaciones || undefined);
        logger_1.logger.info(`⚠️  Aula "${asignacionExistente.aulas.nombre}" desasignada de actividad ` +
            `"${asignacionExistente.actividades.nombre}"`);
        return desasignada;
    }
    async reactivarAsignacion(id) {
        const asignacionExistente = await this.actividadAulaRepository.findById(id);
        if (!asignacionExistente) {
            throw new Error(`Asignación con ID ${id} no encontrada`);
        }
        if (asignacionExistente.activa) {
            throw new Error('La asignación ya está activa');
        }
        const horariosActividad = await this.prisma.horarios_actividades.findMany({
            where: {
                actividadId: asignacionExistente.actividadId,
                activo: true
            }
        });
        const conflictos = await (0, actividad_aula_helper_1.detectarConflictosHorarios)(this.prisma, asignacionExistente.aulaId, horariosActividad.map(h => ({
            diaSemanaId: h.diaSemanaId,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin
        })), asignacionExistente.actividadId);
        if (conflictos.length > 0) {
            throw new Error(`No se puede reactivar la asignación debido a conflictos horarios actuales. ` +
                `El aula ahora está ocupada en los horarios de la actividad.`);
        }
        return this.actividadAulaRepository.reactivar(id);
    }
    async verificarDisponibilidad(data) {
        const [actividad, aula] = await Promise.all([
            this.actividadRepository.findById(data.actividadId),
            this.aulaRepository.findById(data.aulaId.toString())
        ]);
        if (!actividad) {
            throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
        }
        if (!aula) {
            throw new Error(`Aula con ID ${data.aulaId} no encontrada`);
        }
        const horariosActividad = await this.prisma.horarios_actividades.findMany({
            where: {
                actividadId: data.actividadId,
                activo: true
            }
        });
        if (horariosActividad.length === 0) {
            return {
                disponible: false,
                observaciones: [
                    'La actividad no tiene horarios definidos. Debe asignar horarios antes de verificar disponibilidad.'
                ]
            };
        }
        const conflictos = await (0, actividad_aula_helper_1.detectarConflictosHorarios)(this.prisma, data.aulaId, horariosActividad.map(h => ({
            diaSemanaId: h.diaSemanaId,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin
        })), data.excluirAsignacionId);
        const participantesActivos = await this.prisma.participacion_actividades.count({
            where: {
                actividadId: data.actividadId,
                activa: true
            }
        });
        const capacidadSuficiente = participantesActivos <= aula.capacidad;
        const observaciones = [];
        if (!capacidadSuficiente) {
            observaciones.push(`⚠️  Capacidad insuficiente: ${participantesActivos} participantes > ${aula.capacidad} capacidad`);
        }
        if (!aula.activa) {
            observaciones.push('⚠️  El aula está inactiva');
        }
        if (!actividad.activa) {
            observaciones.push('⚠️  La actividad está inactiva');
        }
        return {
            disponible: conflictos.length === 0 && capacidadSuficiente && aula.activa && actividad.activa,
            conflictos: conflictos.length > 0 ? conflictos : undefined,
            capacidadSuficiente,
            participantesActuales: participantesActivos,
            capacidadAula: aula.capacidad,
            observaciones: observaciones.length > 0 ? observaciones : undefined
        };
    }
    async sugerirAulasParaActividad(actividadId, criterios) {
        const actividad = await this.actividadRepository.findById(actividadId);
        if (!actividad) {
            throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
        return (0, actividad_aula_helper_1.sugerirAulasDisponibles)(this.prisma, actividadId, criterios);
    }
    async asignarMultiplesAulas(data) {
        const asignacionesCreadas = [];
        const errores = [];
        for (const aulaData of data.aulas) {
            try {
                const asignacion = await this.asignarAula({
                    actividadId: data.actividadId,
                    aulaId: aulaData.aulaId,
                    prioridad: aulaData.prioridad || 1,
                    observaciones: aulaData.observaciones
                });
                asignacionesCreadas.push(asignacion);
            }
            catch (error) {
                errores.push({
                    aulaId: aulaData.aulaId,
                    error: error.message
                });
            }
        }
        return {
            asignacionesCreadas,
            errores,
            totalCreadas: asignacionesCreadas.length,
            totalErrores: errores.length
        };
    }
    async cambiarAula(actividadId, aulaIdActual, data) {
        const asignacionActual = await this.actividadAulaRepository.findByActividadAndAula(actividadId, aulaIdActual);
        if (!asignacionActual || !asignacionActual.activa) {
            throw new Error('No se encontró una asignación activa del aula especificada a la actividad');
        }
        await this.actividadAulaRepository.desasignar(asignacionActual.id, new Date(), data.observaciones || 'Cambio de aula');
        const nuevaAsignacion = await this.asignarAula({
            actividadId,
            aulaId: data.nuevaAulaId,
            observaciones: data.observaciones || 'Cambio de aula'
        });
        logger_1.logger.info(`🔄 Aula cambiada para actividad ${actividadId}: ` +
            `"${asignacionActual.aulas.nombre}" → "${nuevaAsignacion.aulas.nombre}"`);
        return {
            asignacionAnterior: asignacionActual,
            nuevaAsignacion
        };
    }
    async getOcupacionAula(aulaId) {
        const aula = await this.aulaRepository.findById(aulaId.toString());
        if (!aula) {
            throw new Error(`Aula con ID ${aulaId} no encontrada`);
        }
        const resumen = await (0, actividad_aula_helper_1.getResumenOcupacionAula)(this.prisma, aulaId);
        return {
            aula: {
                id: aula.id,
                nombre: aula.nombre,
                capacidad: aula.capacidad,
                ubicacion: aula.ubicacion
            },
            ocupacion: resumen
        };
    }
}
exports.ActividadAulaService = ActividadAulaService;
//# sourceMappingURL=actividad-aula.service.js.map