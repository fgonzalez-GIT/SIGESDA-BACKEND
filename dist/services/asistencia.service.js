"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsistenciaService = void 0;
const errors_1 = require("@/utils/errors");
class AsistenciaService {
    constructor(asistenciaRepository, participacionRepository) {
        this.asistenciaRepository = asistenciaRepository;
        this.participacionRepository = participacionRepository;
    }
    async create(data) {
        const participacion = await this.participacionRepository.findById(String(data.participacionId));
        if (!participacion) {
            throw new errors_1.NotFoundError(`Participación con ID ${data.participacionId} no encontrada`);
        }
        if (!participacion.activa) {
            throw new errors_1.ValidationError('No se puede registrar asistencia en una participación inactiva');
        }
        const fechaSesion = new Date(data.fechaSesion);
        if (fechaSesion < participacion.fechaInicio) {
            throw new errors_1.ValidationError('La fecha de sesión no puede ser anterior al inicio de la participación');
        }
        if (participacion.fechaFin && fechaSesion > participacion.fechaFin) {
            throw new errors_1.ValidationError('La fecha de sesión no puede ser posterior al fin de la participación');
        }
        const existe = await this.asistenciaRepository.existeAsistencia(data.participacionId, fechaSesion);
        if (existe) {
            throw new errors_1.ConflictError('Ya existe un registro de asistencia para esta participación en esta fecha');
        }
        return this.asistenciaRepository.create(data);
    }
    async registroMasivo(data) {
        const participacionIds = data.asistencias.map(a => a.participacionId);
        const participaciones = await Promise.all(participacionIds.map(id => this.participacionRepository.findById(String(id))));
        const errores = [];
        for (let i = 0; i < participaciones.length; i++) {
            const participacion = participaciones[i];
            const asistencia = data.asistencias[i];
            if (!participacion) {
                errores.push(`Participación ${asistencia.participacionId} no encontrada`);
                continue;
            }
            if (participacion.actividadId !== data.actividadId) {
                errores.push(`Participación ${asistencia.participacionId} no pertenece a la actividad ${data.actividadId}`);
                continue;
            }
            if (!participacion.activa) {
                errores.push(`Participación ${asistencia.participacionId} está inactiva`);
                continue;
            }
        }
        if (errores.length > 0) {
            throw new errors_1.ValidationError(`Errores en el registro masivo de asistencias: ${errores.join(', ')}`);
        }
        const totalCreadas = await this.asistenciaRepository.bulkCreate(data);
        return {
            totalCreadas,
            actividadId: data.actividadId,
            fechaSesion: data.fechaSesion,
            mensaje: `Se registraron ${totalCreadas} asistencias exitosamente`
        };
    }
    async findAll(query) {
        return this.asistenciaRepository.findAll(query);
    }
    async findById(id) {
        const asistencia = await this.asistenciaRepository.findById(id);
        if (!asistencia) {
            throw new errors_1.NotFoundError(`Asistencia con ID ${id} no encontrada`);
        }
        return asistencia;
    }
    async findByParticipacion(participacionId) {
        const participacion = await this.participacionRepository.findById(String(participacionId));
        if (!participacion) {
            throw new errors_1.NotFoundError(`Participación con ID ${participacionId} no encontrada`);
        }
        return this.asistenciaRepository.findByParticipacion(participacionId);
    }
    async findByActividad(actividadId, fechaDesde, fechaHasta) {
        return this.asistenciaRepository.findByActividad(actividadId, fechaDesde, fechaHasta);
    }
    async findByPersona(personaId, fechaDesde, fechaHasta) {
        return this.asistenciaRepository.findByPersona(personaId, fechaDesde, fechaHasta);
    }
    async update(id, data) {
        const existing = await this.asistenciaRepository.findById(id);
        if (!existing) {
            throw new errors_1.NotFoundError(`Asistencia con ID ${id} no encontrada`);
        }
        if (data.justificada && data.asistio === true) {
            throw new errors_1.ValidationError('Solo se pueden justificar inasistencias, no asistencias');
        }
        return this.asistenciaRepository.update(id, data);
    }
    async delete(id) {
        const existing = await this.asistenciaRepository.findById(id);
        if (!existing) {
            throw new errors_1.NotFoundError(`Asistencia con ID ${id} no encontrada`);
        }
        return this.asistenciaRepository.delete(id);
    }
    async getTasaAsistencia(params) {
        const participacion = await this.participacionRepository.findById(String(params.participacionId));
        if (!participacion) {
            throw new errors_1.NotFoundError(`Participación con ID ${params.participacionId} no encontrada`);
        }
        const tasa = await this.asistenciaRepository.getTasaAsistencia(params);
        return {
            ...tasa,
            participacion: {
                id: participacion.id,
                persona: `${participacion.persona.nombre} ${participacion.persona.apellido}`,
                actividad: participacion.actividad.nombre
            }
        };
    }
    async getAlertasInasistencias(params) {
        const alertas = await this.asistenciaRepository.getAlertasInasistencias(params);
        return {
            umbral: params.umbral,
            totalAlertas: alertas.length,
            alertas: alertas.map(alerta => ({
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
                severidad: this.calcularSeveridad(alerta.inasistencias_consecutivas, params.umbral)
            }))
        };
    }
    async getReporteAsistencias(params) {
        const reporte = await this.asistenciaRepository.getReporteAsistencias(params);
        return {
            parametros: {
                fechaDesde: params.fechaDesde,
                fechaHasta: params.fechaHasta,
                agruparPor: params.agruparPor,
                actividadId: params.actividadId,
                personaId: params.personaId
            },
            totalRegistros: reporte.length,
            datos: reporte
        };
    }
    async getEstadisticasGenerales(actividadId, fechaDesde, fechaHasta) {
        return this.asistenciaRepository.getEstadisticasGenerales(actividadId, fechaDesde, fechaHasta);
    }
    async getDashboardAsistencias(actividadId) {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - ahora.getDay());
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        const [estadisticasGenerales, estadisticasMes, estadisticasSemana, alertasInasistencias] = await Promise.all([
            this.asistenciaRepository.getEstadisticasGenerales(actividadId),
            this.asistenciaRepository.getEstadisticasGenerales(actividadId, inicioMes, finMes),
            this.asistenciaRepository.getEstadisticasGenerales(actividadId, inicioSemana, finSemana),
            this.asistenciaRepository.getAlertasInasistencias({
                umbral: 3,
                actividadId,
                soloActivas: true
            })
        ]);
        return {
            general: estadisticasGenerales,
            esteMes: estadisticasMes,
            estaSemana: estadisticasSemana,
            alertas: {
                total: alertasInasistencias.length,
                criticas: alertasInasistencias.filter((a) => a.inasistencias_consecutivas >= 5).length,
                advertencias: alertasInasistencias.filter((a) => a.inasistencias_consecutivas >= 3 && a.inasistencias_consecutivas < 5).length
            },
            fecha: ahora
        };
    }
    async getResumenPersona(personaId, fechaDesde, fechaHasta) {
        const asistencias = await this.asistenciaRepository.findByPersona(personaId, fechaDesde, fechaHasta);
        if (asistencias.length === 0) {
            return {
                personaId,
                totalSesiones: 0,
                asistencias: 0,
                inasistencias: 0,
                inasistenciasJustificadas: 0,
                tasaAsistencia: 0,
                actividades: []
            };
        }
        const totalSesiones = asistencias.length;
        const totalAsistencias = asistencias.filter(a => a.asistio).length;
        const totalInasistencias = asistencias.filter(a => !a.asistio).length;
        const totalJustificadas = asistencias.filter(a => !a.asistio && a.justificada).length;
        const tasaAsistencia = (totalAsistencias / totalSesiones) * 100;
        const porActividad = new Map();
        for (const asistencia of asistencias) {
            const actividadId = asistencia.participacion.actividadId;
            const actividadNombre = asistencia.participacion.actividad.nombre;
            if (!porActividad.has(actividadId)) {
                porActividad.set(actividadId, {
                    actividadId,
                    actividadNombre,
                    sesiones: 0,
                    asistencias: 0,
                    inasistencias: 0
                });
            }
            const stats = porActividad.get(actividadId);
            stats.sesiones++;
            if (asistencia.asistio) {
                stats.asistencias++;
            }
            else {
                stats.inasistencias++;
            }
        }
        return {
            personaId,
            nombreCompleto: `${asistencias[0].participacion.persona.nombre} ${asistencias[0].participacion.persona.apellido}`,
            totalSesiones,
            asistencias: totalAsistencias,
            inasistencias: totalInasistencias,
            inasistenciasJustificadas: totalJustificadas,
            tasaAsistencia: Math.round(tasaAsistencia * 100) / 100,
            actividades: Array.from(porActividad.values())
        };
    }
    async getResumenActividad(actividadId, fechaDesde, fechaHasta) {
        const asistencias = await this.asistenciaRepository.findByActividad(actividadId, fechaDesde, fechaHasta);
        if (asistencias.length === 0) {
            return {
                actividadId,
                totalSesiones: 0,
                totalParticipantes: 0,
                asistenciaPromedio: 0,
                sesiones: []
            };
        }
        const porFecha = new Map();
        for (const asistencia of asistencias) {
            const fecha = asistencia.fecha_sesion.toISOString().split('T')[0];
            if (!porFecha.has(fecha)) {
                porFecha.set(fecha, {
                    fecha,
                    totalParticipantes: 0,
                    asistencias: 0,
                    inasistencias: 0,
                    tasaAsistencia: 0
                });
            }
            const stats = porFecha.get(fecha);
            stats.totalParticipantes++;
            if (asistencia.asistio) {
                stats.asistencias++;
            }
            else {
                stats.inasistencias++;
            }
        }
        porFecha.forEach(sesion => {
            sesion.tasaAsistencia = Math.round((sesion.asistencias / sesion.totalParticipantes) * 100 * 100) / 100;
        });
        const sesiones = Array.from(porFecha.values()).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        const totalSesiones = sesiones.length;
        const asistenciaPromedio = sesiones.reduce((sum, s) => sum + s.tasaAsistencia, 0) / totalSesiones;
        const participantesUnicos = new Set(asistencias.map(a => a.participacion.personaId));
        return {
            actividadId,
            actividadNombre: asistencias[0].participacion.actividad.nombre,
            totalSesiones,
            totalParticipantes: participantesUnicos.size,
            asistenciaPromedio: Math.round(asistenciaPromedio * 100) / 100,
            sesiones
        };
    }
    calcularSeveridad(inasistencias, umbral) {
        if (inasistencias >= umbral * 2.5)
            return 'CRITICA';
        if (inasistencias >= umbral * 2)
            return 'ALTA';
        if (inasistencias >= umbral * 1.5)
            return 'MEDIA';
        return 'BAJA';
    }
    async corregirAsistencia(participacionId, fechaSesion, asistio, justificada = false, observaciones) {
        const fechaSesionDate = new Date(fechaSesion);
        const existe = await this.asistenciaRepository.existeAsistencia(participacionId, fechaSesionDate);
        if (existe) {
            const asistencias = await this.asistenciaRepository.findByParticipacion(participacionId);
            const asistencia = asistencias.find(a => a.fecha_sesion.toISOString().split('T')[0] === fechaSesionDate.toISOString().split('T')[0]);
            if (!asistencia) {
                throw new errors_1.NotFoundError('Asistencia no encontrada para actualizar');
            }
            return this.update(asistencia.id, { asistio, justificada, observaciones });
        }
        else {
            return this.create({
                participacionId,
                fechaSesion: fechaSesionDate.toISOString(),
                asistio,
                justificada,
                observaciones
            });
        }
    }
}
exports.AsistenciaService = AsistenciaService;
//# sourceMappingURL=asistencia.service.js.map