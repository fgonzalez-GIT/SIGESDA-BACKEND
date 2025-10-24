import { ParticipacionRepository } from '@/repositories/participacion.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { AsistenciaRepository } from '@/repositories/asistencia.repository';
import {
  CreateParticipacionDto,
  UpdateParticipacionDto,
  ParticipacionQueryDto,
  InscripcionMasivaDto,
  InscripcionMultiplePersonasDto,
  DesincripcionDto,
  EstadisticasParticipacionDto,
  ReporteInasistenciasDto,
  VerificarCuposDto,
  TransferirParticipacionDto,
  validarSolapamientoParticipaciones,
  EstadoParticipacion,
  determinarEstado
} from '@/dto/participacion.dto';

export class ParticipacionService {
  constructor(
    private participacionRepository: ParticipacionRepository,
    private personaRepository: PersonaRepository,
    private actividadRepository: ActividadRepository,
    private asistenciaRepository?: AsistenciaRepository // Opcional para backward compatibility
  ) {}

  async create(data: CreateParticipacionDto) {
    // Validar que la persona existe
    const persona = await this.personaRepository.findById(data.personaId);
    if (!persona) {
      throw new Error(`Persona con ID ${data.personaId} no encontrada`);
    }

    // Validar que la actividad existe
    const actividad = await this.actividadRepository.findById(data.actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
    }

    // Verificar si ya existe una participación (activa o inactiva)
    const participacionExistente = await this.participacionRepository.findByPersonaAndActividad(
      data.personaId,
      data.actividadId
    );

    if (participacionExistente) {
      if (participacionExistente.activo) {
        throw new Error(
          `${persona.nombre} ${persona.apellido} ya está inscrito activamente en la actividad ${actividad.nombre}`
        );
      } else {
        throw new Error(
          `${persona.nombre} ${persona.apellido} ya estuvo inscrito en la actividad ${actividad.nombre}. ` +
          `Debe reactivar la participación existente (ID: ${participacionExistente.id}) en lugar de crear una nueva.`
        );
      }
    }

    // Validar capacidad de la actividad
    const participantesActuales = await this.participacionRepository.contarParticipantesPorActividad(data.actividadId);
    if (actividad.cupoMaximo && participantesActuales.activos >= actividad.cupoMaximo) {
      throw new Error(`La actividad "${actividad.nombre}" ha alcanzado su capacidad máxima de ${actividad.cupoMaximo} participantes`);
    }

    // Verificar conflictos de horarios para la misma persona
    const conflictos = await this.participacionRepository.verificarConflictosHorarios(
      data.personaId,
      data.fechaInicio,
      data.fechaFin || undefined
    );

    if (conflictos.length > 0) {
      const nombreConflictos = conflictos.map(c => c.actividad.nombre).join(', ');
      throw new Error(`La persona ya tiene participaciones activas que se solapan con estas fechas en: ${nombreConflictos}`);
    }

    // Calcular precio si no se especifica precio especial
    let precioFinal = data.precioEspecial;
    if (!precioFinal) {
      // Si es socio y la actividad es gratis para socios, precio = 0
      if (persona.tipo === 'SOCIO' && actividad.precio === 0) {
        precioFinal = 0;
      } else {
        // Usar el precio de la actividad
        precioFinal = Number(actividad.precio);
      }
    }

    const participacion = await this.participacionRepository.create({
      ...data,
      precioEspecial: precioFinal
    });

    return {
      ...participacion,
      estado: determinarEstado({ activa: participacion.activo, fechaFin: participacion.fecha_fin }),
      diasTranscurridos: Math.floor((new Date().getTime() - participacion.fecha_inicio.getTime()) / (1000 * 60 * 60 * 24))
    };
  }

  async findAll(query: ParticipacionQueryDto) {
    const result = await this.participacionRepository.findAll(query);
    const totalPages = Math.ceil(result.total / query.limit);

    const participacionesConEstado = result.data.map(p => ({
      ...p,
      estado: determinarEstado({ activa: p.activo, fechaFin: p.fecha_fin }),
      diasTranscurridos: Math.floor((new Date().getTime() - p.fecha_inicio.getTime()) / (1000 * 60 * 60 * 24))
    }));

    return {
      data: participacionesConEstado,
      total: result.total,
      page: query.page,
      totalPages
    };
  }

  async findById(id: number) {
    const participacion = await this.participacionRepository.findById(id);
    if (!participacion) {
      throw new Error(`Participación con ID ${id} no encontrada`);
    }

    return {
      ...participacion,
      estado: determinarEstado({ activa: participacion.activo, fechaFin: participacion.fecha_fin }),
      diasTranscurridos: Math.floor((new Date().getTime() - participacion.fecha_inicio.getTime()) / (1000 * 60 * 60 * 24))
    };
  }

  async findByPersonaId(personaId: number) {
    const persona = await this.personaRepository.findById(personaId);
    if (!persona) {
      throw new Error(`Persona con ID ${personaId} no encontrada`);
    }

    const participaciones = await this.participacionRepository.findByPersonaId(personaId);
    return participaciones.map(p => ({
      ...p,
      estado: determinarEstado({ activa: p.activo, fechaFin: p.fecha_fin }),
      diasTranscurridos: Math.floor((new Date().getTime() - p.fecha_inicio.getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  async findByActividadId(actividadId: number) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    const participaciones = await this.participacionRepository.findByActividadId(actividadId);
    return participaciones.map(p => ({
      ...p,
      estado: determinarEstado({ activa: p.activo, fechaFin: p.fecha_fin }),
      diasTranscurridos: Math.floor((new Date().getTime() - p.fecha_inicio.getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  async update(id: number, data: UpdateParticipacionDto) {
    const existing = await this.participacionRepository.findById(id);
    if (!existing) {
      throw new Error(`Participación con ID ${id} no encontrada`);
    }

    // Si se actualizan las fechas, verificar conflictos
    if (data.fechaInicio || data.fechaFin) {
      const fechaInicio = data.fechaInicio || existing.fecha_inicio;
      const fechaFin = data.fechaFin !== undefined ? data.fechaFin : existing.fecha_fin;

      const conflictos = await this.participacionRepository.verificarConflictosHorarios(
        existing.persona_id,
        fechaInicio,
        fechaFin || undefined,
        id // Excluir la participación actual
      );

      if (conflictos.length > 0) {
        const nombreConflictos = conflictos.map(c => c.actividades.nombre).join(', ');
        throw new Error(`Las nuevas fechas se solapan con participaciones existentes en: ${nombreConflictos}`);
      }
    }

    const participacion = await this.participacionRepository.update(id, data);
    return {
      ...participacion,
      estado: determinarEstado({ activa: participacion.activo, fechaFin: participacion.fecha_fin }),
      diasTranscurridos: Math.floor((new Date().getTime() - participacion.fecha_inicio.getTime()) / (1000 * 60 * 60 * 24))
    };
  }

  async delete(id: number) {
    const existing = await this.participacionRepository.findById(id);
    if (!existing) {
      throw new Error(`Participación con ID ${id} no encontrada`);
    }

    return this.participacionRepository.delete(id);
  }

  async inscripcionMasiva(data: InscripcionMasivaDto) {
    const persona = await this.personaRepository.findById(data.personaId);
    if (!persona) {
      throw new Error(`Persona con ID ${data.personaId} no encontrada`);
    }

    const participacionesCreadas = [];
    const errores = [];

    // Procesar cada actividad
    for (const inscripcion of data.actividades) {
      try {
        // Validar que la actividad existe
        const actividad = await this.actividadRepository.findById(inscripcion.actividadId);
        if (!actividad) {
          errores.push(`Actividad con ID ${inscripcion.actividadId} no encontrada`);
          continue;
        }

        // Validar capacidad
        const participantesActuales = await this.participacionRepository.contarParticipantesPorActividad(inscripcion.actividadId);
        if (actividad.cupoMaximo && participantesActuales.activos >= actividad.cupoMaximo) {
          errores.push(`La actividad "${actividad.nombre}" ha alcanzado su capacidad máxima`);
          continue;
        }

        // Verificar conflictos
        const conflictos = await this.participacionRepository.verificarConflictosHorarios(
          data.personaId,
          inscripcion.fechaInicio,
          inscripcion.fechaFin || undefined
        );

        if (conflictos.length > 0) {
          errores.push(`Conflicto de horarios con actividad "${actividad.nombre}"`);
          continue;
        }

        // Calcular precio con descuento familiar si aplica
        let precio = inscripcion.precioEspecial ?? Number(actividad.precio);
        if (data.aplicarDescuentoFamiliar && persona.tipo === 'SOCIO') {
          precio = precio * 0.8; // 20% de descuento familiar
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

      } catch (error) {
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

  /**
   * Inscribe múltiples personas en una actividad
   */
  async inscripcionMultiplePersonas(data: InscripcionMultiplePersonasDto) {
    // Validar que la actividad existe
    const actividad = await this.actividadRepository.findById(data.actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
    }

    const participacionesCreadas = [];
    const errores = [];

    // Verificar cupo disponible
    const participantesActuales = await this.participacionRepository.contarParticipantesPorActividad(data.actividadId);
    const cupoDisponible = actividad.cupoMaximo ? actividad.cupoMaximo - participantesActuales.activos : null;

    if (cupoDisponible !== null && data.personas.length > cupoDisponible) {
      throw new Error(`No hay suficientes cupos disponibles. Cupos disponibles: ${cupoDisponible}, Personas a inscribir: ${data.personas.length}`);
    }

    // Procesar cada persona
    for (const inscripcion of data.personas) {
      try {
        // Validar que la persona existe
        const persona = await this.personaRepository.findById(inscripcion.personaId);
        if (!persona) {
          errores.push({
            personaId: inscripcion.personaId,
            error: `Persona con ID ${inscripcion.personaId} no encontrada`
          });
          continue;
        }

        // Verificar si ya está inscrita (activa o inactiva)
        const participacionExistente = await this.participacionRepository.findByPersonaAndActividad(
          inscripcion.personaId,
          data.actividadId
        );

        if (participacionExistente) {
          if (participacionExistente.activo) {
            errores.push({
              personaId: inscripcion.personaId,
              error: `${persona.nombre} ${persona.apellido} ya está inscrito activamente en esta actividad`
            });
            continue;
          } else {
            errores.push({
              personaId: inscripcion.personaId,
              error: `${persona.nombre} ${persona.apellido} ya estuvo inscrito en esta actividad. Debe reactivar la participación existente (ID: ${participacionExistente.id}) en lugar de crear una nueva.`
            });
            continue;
          }
        }

        // Usar valores comunes si no se especifican individuales
        const fechaInicio = inscripcion.fechaInicio || data.fechaInicioComun || new Date();
        const precioEspecial = inscripcion.precioEspecial ?? data.precioEspecialComun;
        const observaciones = inscripcion.observaciones || data.observacionesComunes;

        // Crear participación
        const participacion = await this.participacionRepository.create({
          personaId: inscripcion.personaId,
          actividadId: data.actividadId,
          fechaInicio: fechaInicio,
          precioEspecial: precioEspecial,
          observaciones: observaciones
        });

        participacionesCreadas.push({
          ...participacion,
          personaNombre: `${persona.nombre} ${persona.apellido}`
        });

      } catch (error) {
        errores.push({
          personaId: inscripcion.personaId,
          error: `Error al inscribir persona ${inscripcion.personaId}: ${error}`
        });
      }
    }

    return {
      participacionesCreadas,
      errores,
      totalCreadas: participacionesCreadas.length,
      totalErrores: errores.length,
      actividadNombre: actividad.nombre
    };
  }

  async desinscribir(id: number, data: DesincripcionDto) {
    const participacion = await this.participacionRepository.findById(id);
    if (!participacion) {
      throw new Error(`Participación con ID ${id} no encontrada`);
    }

    if (!participacion.activo) {
      throw new Error('La participación ya está inactiva');
    }

    return this.participacionRepository.finalizarParticipacion(
      id,
      data.fechaFin,
      data.motivoDesincripcion
    );
  }

  async reactivar(id: number) {
    const participacion = await this.participacionRepository.findById(id);
    if (!participacion) {
      throw new Error(`Participación con ID ${id} no encontrada`);
    }

    if (participacion.activo) {
      throw new Error('La participación ya está activa');
    }

    // Verificar si la actividad aún tiene cupos disponibles
    const actividad = await this.actividadRepository.findById(participacion.actividad_id);
    if (actividad?.cupoMaximo) {
      const participantesActuales = await this.participacionRepository.contarParticipantesPorActividad(participacion.actividad_id);
      if (participantesActuales.activos >= actividad.cupoMaximo) {
        throw new Error(`La actividad "${actividad.nombre}" ya no tiene cupos disponibles`);
      }
    }

    return this.participacionRepository.reactivarParticipacion(id);
  }

  async transferir(id: number, data: TransferirParticipacionDto) {
    const participacion = await this.participacionRepository.findById(id);
    if (!participacion) {
      throw new Error(`Participación con ID ${id} no encontrada`);
    }

    // Validar que la nueva actividad existe
    const nuevaActividad = await this.actividadRepository.findById(data.nuevaActividadId);
    if (!nuevaActividad) {
      throw new Error(`Actividad destino con ID ${data.nuevaActividadId} no encontrada`);
    }

    // Verificar capacidad de la nueva actividad
    const participantesActuales = await this.participacionRepository.contarParticipantesPorActividad(data.nuevaActividadId);
    if (nuevaActividad.cupoMaximo && participantesActuales.activos >= nuevaActividad.cupoMaximo) {
      throw new Error(`La actividad destino "${nuevaActividad.nombre}" ha alcanzado su capacidad máxima`);
    }

    return this.participacionRepository.transferirParticipacion(
      id,
      data.nuevaActividadId,
      data.fechaTransferencia,
      data.conservarFechaInicio
    );
  }

  async verificarCupos(data: VerificarCuposDto) {
    const actividad = await this.actividadRepository.findById(data.actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
    }

    const participantes = await this.participacionRepository.contarParticipantesPorActividad(data.actividadId);

    const cuposDisponibles = actividad.cupoMaximo ?
      actividad.cupoMaximo - participantes.activos :
      null; // Sin límite

    return {
      actividad: {
        id: actividad.id,
        nombre: actividad.nombre,
        cupoMaximo: actividad.cupoMaximo
      },
      participantes,
      cuposDisponibles,
      disponible: cuposDisponibles === null || cuposDisponibles > 0
    };
  }

  async getEstadisticas(params: EstadisticasParticipacionDto) {
    return this.participacionRepository.getEstadisticasParticipacion(params);
  }

  async getParticipacionesActivas(personaId?: number) {
    const participaciones = await this.participacionRepository.findParticipacionesActivas(personaId);
    return participaciones.map(p => ({
      ...p,
      estado: EstadoParticipacion.ACTIVA,
      diasTranscurridos: Math.floor((new Date().getTime() - p.fecha_inicio.getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  async getParticipacionesPorVencer(dias: number = 30) {
    const participaciones = await this.participacionRepository.getParticipacionesPorVencer(dias);
    return participaciones.map(p => ({
      ...p,
      estado: EstadoParticipacion.ACTIVA,
      diasRestantes: p.fecha_fin ?
        Math.ceil((p.fecha_fin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
        null
    }));
  }

  async getReporteInasistencias(params: ReporteInasistenciasDto) {
    // Si no hay repository de asistencias, usar implementación básica (backward compatibility)
    if (!this.asistenciaRepository) {
      const participaciones = await this.participacionRepository.getReporteInasistencias(params);
      return participaciones.map(p => ({
        ...p,
        diasDesdeInicio: Math.floor((new Date().getTime() - p.fechaInicio.getTime()) / (1000 * 60 * 60 * 24)),
        estado: determinarEstado(p),
        inasistenciasEstimadas: Math.floor(Math.random() * params.umbralInasistencias)
      }));
    }

    // Usar el repository de asistencias para obtener alertas reales
    const alertas = await this.asistenciaRepository.getAlertasInasistencias({
      umbral: params.umbralInasistencias,
      actividadId: params.actividadId,
      soloActivas: true
    });

    // Enriquecer las alertas con información de la participación
    const resultado = await Promise.all(
      alertas.map(async (alerta: any) => {
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
          estado: participacion ? determinarEstado(participacion) : null
        };
      })
    );

    return resultado;
  }

  async getDashboardParticipacion() {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioAno = new Date(ahora.getFullYear(), 0, 1);

    const [
      totalActivas,
      nuevasEsteMes,
      nuevasEsteAno,
      porVencer,
      porActividad
    ] = await Promise.all([
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