// @ts-nocheck
import { AsistenciaRepository } from '@/repositories/asistencia.repository';
import { ParticipacionRepository } from '@/repositories/participacion.repository';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import {
  CreateAsistenciaDto,
  RegistroAsistenciaMasivaDto,
  UpdateAsistenciaDto,
  AsistenciaQueryDto,
  ReporteAsistenciasDto,
  TasaAsistenciaDto,
  AlertasInasistenciasDto
} from '@/dto/asistencia.dto';

/**
 * Service para la lógica de negocio de asistencias
 */
export class AsistenciaService {
  constructor(
    private asistenciaRepository: AsistenciaRepository,
    private participacionRepository: ParticipacionRepository
  ) {}

  /**
   * Crear un registro de asistencia individual
   */
  async create(data: CreateAsistenciaDto) {
    // Validar que la participación existe
    const participacion = await this.participacionRepository.findById(String(data.participacionId));
    if (!participacion) {
      throw new NotFoundError(`Participación con ID ${data.participacionId} no encontrada`);
    }

    // Validar que la participación está activa
    if (!participacion.activa) {
      throw new ValidationError('No se puede registrar asistencia en una participación inactiva');
    }

    // Validar que la fecha de sesión no es anterior a la fecha de inicio de participación
    const fechaSesion = new Date(data.fechaSesion);
    if (fechaSesion < participacion.fechaInicio) {
      throw new ValidationError('La fecha de sesión no puede ser anterior al inicio de la participación');
    }

    // Validar que la fecha de sesión no es posterior a la fecha de fin (si existe)
    if (participacion.fechaFin && fechaSesion > participacion.fechaFin) {
      throw new ValidationError('La fecha de sesión no puede ser posterior al fin de la participación');
    }

    // Verificar que no exista ya una asistencia para esta participación en esta fecha
    const existe = await this.asistenciaRepository.existeAsistencia(data.participacionId, fechaSesion);
    if (existe) {
      throw new ConflictError('Ya existe un registro de asistencia para esta participación en esta fecha');
    }

    return this.asistenciaRepository.create(data);
  }

  /**
   * Registrar asistencias masivas para una sesión completa de una actividad
   */
  async registroMasivo(data: RegistroAsistenciaMasivaDto) {
    // Validar que todas las participaciones existen y pertenecen a la actividad
    const participacionIds = data.asistencias.map(a => a.participacionId);
    const participaciones = await Promise.all(
      participacionIds.map(id => this.participacionRepository.findById(String(id)))
    );

    const errores: string[] = [];

    for (let i = 0; i < participaciones.length; i++) {
      const participacion = participaciones[i];
      const asistencia = data.asistencias[i];

      if (!participacion) {
        errores.push(`Participación ${asistencia.participacionId} no encontrada`);
        continue;
      }

      if (participacion.actividadId !== data.actividadId) {
        errores.push(
          `Participación ${asistencia.participacionId} no pertenece a la actividad ${data.actividadId}`
        );
        continue;
      }

      if (!participacion.activa) {
        errores.push(`Participación ${asistencia.participacionId} está inactiva`);
        continue;
      }
    }

    if (errores.length > 0) {
      throw new ValidationError(
        `Errores en el registro masivo de asistencias: ${errores.join(', ')}`
      );
    }

    const totalCreadas = await this.asistenciaRepository.bulkCreate(data);

    return {
      totalCreadas,
      actividadId: data.actividadId,
      fechaSesion: data.fechaSesion,
      mensaje: `Se registraron ${totalCreadas} asistencias exitosamente`
    };
  }

  /**
   * Obtener todas las asistencias con filtros y paginación
   */
  async findAll(query: AsistenciaQueryDto) {
    return this.asistenciaRepository.findAll(query);
  }

  /**
   * Obtener una asistencia por ID
   */
  async findById(id: number) {
    const asistencia = await this.asistenciaRepository.findById(id);
    if (!asistencia) {
      throw new NotFoundError(`Asistencia con ID ${id} no encontrada`);
    }
    return asistencia;
  }

  /**
   * Obtener asistencias de una participación específica
   */
  async findByParticipacion(participacionId: number) {
    const participacion = await this.participacionRepository.findById(String(participacionId));
    if (!participacion) {
      throw new NotFoundError(`Participación con ID ${participacionId} no encontrada`);
    }

    return this.asistenciaRepository.findByParticipacion(participacionId);
  }

  /**
   * Obtener asistencias de una actividad
   */
  async findByActividad(actividadId: number, fechaDesde?: Date, fechaHasta?: Date) {
    return this.asistenciaRepository.findByActividad(actividadId, fechaDesde, fechaHasta);
  }

  /**
   * Obtener asistencias de una persona
   */
  async findByPersona(personaId: string, fechaDesde?: Date, fechaHasta?: Date) {
    return this.asistenciaRepository.findByPersona(personaId, fechaDesde, fechaHasta);
  }

  /**
   * Actualizar un registro de asistencia
   */
  async update(id: number, data: UpdateAsistenciaDto) {
    const existing = await this.asistenciaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Asistencia con ID ${id} no encontrada`);
    }

    // Validar que si se marca como justificada, debe ser una inasistencia
    if (data.justificada && data.asistio === true) {
      throw new ValidationError('Solo se pueden justificar inasistencias, no asistencias');
    }

    return this.asistenciaRepository.update(id, data);
  }

  /**
   * Eliminar un registro de asistencia
   */
  async delete(id: number) {
    const existing = await this.asistenciaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Asistencia con ID ${id} no encontrada`);
    }

    return this.asistenciaRepository.delete(id);
  }

  /**
   * Calcular tasa de asistencia de una participación
   */
  async getTasaAsistencia(params: TasaAsistenciaDto) {
    const participacion = await this.participacionRepository.findById(String(params.participacionId));
    if (!participacion) {
      throw new NotFoundError(`Participación con ID ${params.participacionId} no encontrada`);
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

  /**
   * Obtener participaciones con inasistencias consecutivas (alertas)
   */
  async getAlertasInasistencias(params: AlertasInasistenciasDto) {
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

  /**
   * Generar reporte de asistencias agrupadas
   */
  async getReporteAsistencias(params: ReporteAsistenciasDto) {
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

  /**
   * Obtener estadísticas generales de asistencias
   */
  async getEstadisticasGenerales(actividadId?: number, fechaDesde?: Date, fechaHasta?: Date) {
    return this.asistenciaRepository.getEstadisticasGenerales(actividadId, fechaDesde, fechaHasta);
  }

  /**
   * Obtener dashboard con métricas de asistencias
   */
  async getDashboardAsistencias(actividadId?: number) {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    const inicioSemana = new Date(ahora);
    inicioSemana.setDate(ahora.getDate() - ahora.getDay()); // Inicio de semana (domingo)
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6); // Fin de semana (sábado)

    const [
      estadisticasGenerales,
      estadisticasMes,
      estadisticasSemana,
      alertasInasistencias
    ] = await Promise.all([
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
        criticas: alertasInasistencias.filter((a: any) => a.inasistencias_consecutivas >= 5).length,
        advertencias: alertasInasistencias.filter(
          (a: any) => a.inasistencias_consecutivas >= 3 && a.inasistencias_consecutivas < 5
        ).length
      },
      fecha: ahora
    };
  }

  /**
   * Obtener resumen de asistencias de una persona
   */
  async getResumenPersona(personaId: string, fechaDesde?: Date, fechaHasta?: Date) {
    const asistencias = await this.asistenciaRepository.findByPersona(
      personaId,
      fechaDesde,
      fechaHasta
    );

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

    // Agrupar por actividad
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
      } else {
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

  /**
   * Obtener resumen de asistencias de una actividad
   */
  async getResumenActividad(actividadId: number, fechaDesde?: Date, fechaHasta?: Date) {
    const asistencias = await this.asistenciaRepository.findByActividad(
      actividadId,
      fechaDesde,
      fechaHasta
    );

    if (asistencias.length === 0) {
      return {
        actividadId,
        totalSesiones: 0,
        totalParticipantes: 0,
        asistenciaPromedio: 0,
        sesiones: []
      };
    }

    // Agrupar por fecha de sesión
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
      } else {
        stats.inasistencias++;
      }
    }

    // Calcular tasa de asistencia por sesión
    porFecha.forEach(sesion => {
      sesion.tasaAsistencia = Math.round((sesion.asistencias / sesion.totalParticipantes) * 100 * 100) / 100;
    });

    const sesiones = Array.from(porFecha.values()).sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    const totalSesiones = sesiones.length;
    const asistenciaPromedio =
      sesiones.reduce((sum, s) => sum + s.tasaAsistencia, 0) / totalSesiones;

    // Obtener participantes únicos
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

  /**
   * Calcular severidad de las alertas de inasistencias
   */
  private calcularSeveridad(inasistencias: number, umbral: number): 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' {
    if (inasistencias >= umbral * 2.5) return 'CRITICA';
    if (inasistencias >= umbral * 2) return 'ALTA';
    if (inasistencias >= umbral * 1.5) return 'MEDIA';
    return 'BAJA';
  }

  /**
   * Validar y corregir asistencia (útil para correcciones administrativas)
   */
  async corregirAsistencia(
    participacionId: number,
    fechaSesion: Date,
    asistio: boolean,
    justificada: boolean = false,
    observaciones?: string
  ) {
    const fechaSesionDate = new Date(fechaSesion);

    // Verificar si ya existe el registro
    const existe = await this.asistenciaRepository.existeAsistencia(participacionId, fechaSesionDate);

    if (existe) {
      // Actualizar registro existente
      const asistencias = await this.asistenciaRepository.findByParticipacion(participacionId);
      const asistencia = asistencias.find(
        a => a.fecha_sesion.toISOString().split('T')[0] === fechaSesionDate.toISOString().split('T')[0]
      );

      if (!asistencia) {
        throw new NotFoundError('Asistencia no encontrada para actualizar');
      }

      return this.update(asistencia.id, { asistio, justificada, observaciones });
    } else {
      // Crear nuevo registro
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
