// @ts-nocheck
import { PrismaClient, actividades_aulas } from '@prisma/client';
import { ActividadAulaRepository } from '@/repositories/actividad-aula.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { AulaRepository } from '@/repositories/aula.repository';
import {
  CreateActividadAulaDto,
  UpdateActividadAulaDto,
  QueryActividadesAulasDto,
  DesasignarAulaDto,
  VerificarDisponibilidadDto,
  DisponibilidadResponse,
  AsignarMultiplesAulasDto,
  CambiarAulaDto
} from '@/dto/actividad-aula.dto';
import {
  detectarConflictosHorarios,
  sugerirAulasDisponibles,
  actividadTieneHorarios,
  getResumenOcupacionAula
} from '@/utils/actividad-aula.helper';
import { logger } from '@/utils/logger';

export class ActividadAulaService {
  constructor(
    private actividadAulaRepository: ActividadAulaRepository,
    private actividadRepository: ActividadRepository,
    private aulaRepository: AulaRepository,
    private prisma: PrismaClient
  ) {}

  /**
   * Asigna un aula a una actividad con VALIDACIONES COMPLETAS
   */
  async asignarAula(data: CreateActividadAulaDto): Promise<actividades_aulas> {
    // ============================================================================
    // VALIDACIÓN 1: Actividad existe y está activa
    // ============================================================================
    const actividad = await this.actividadRepository.findById(data.actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
    }
    if (!actividad.activa) {
      throw new Error(`No se puede asignar aula a la actividad "${actividad.nombre}" porque está inactiva`);
    }

    // ============================================================================
    // VALIDACIÓN 2: Actividad tiene horarios definidos
    // ============================================================================
    const tieneHorarios = await actividadTieneHorarios(this.prisma, data.actividadId);
    if (!tieneHorarios) {
      throw new Error(
        `La actividad "${actividad.nombre}" no tiene horarios definidos. ` +
        `Debe asignar horarios antes de asignar un aula.`
      );
    }

    // ============================================================================
    // VALIDACIÓN 3: Aula existe y está activa
    // ============================================================================
    const aula = await this.aulaRepository.findById(data.aulaId.toString());
    if (!aula) {
      throw new Error(`Aula con ID ${data.aulaId} no encontrada`);
    }
    if (!aula.activa) {
      throw new Error(`No se puede asignar el aula "${aula.nombre}" porque está inactiva`);
    }

    // ============================================================================
    // VALIDACIÓN 4: NO duplicar asignación activa
    // ============================================================================
    const asignacionExistente = await this.actividadAulaRepository.findByActividadAndAula(
      data.actividadId,
      data.aulaId
    );

    if (asignacionExistente && asignacionExistente.activa) {
      throw new Error(
        `El aula "${aula.nombre}" ya está asignada a la actividad "${actividad.nombre}". ` +
        `Si desea reasignar, primero desasigne el aula existente.`
      );
    }

    // ============================================================================
    // VALIDACIÓN 5: Capacidad del aula suficiente para participantes
    // ============================================================================
    const participantesActivos = await this.prisma.participacion_actividades.count({
      where: {
        actividadId: data.actividadId,
        activa: true
      }
    });

    if (participantesActivos > aula.capacidad) {
      throw new Error(
        `Capacidad insuficiente: El aula "${aula.nombre}" tiene capacidad para ${aula.capacidad} personas, ` +
        `pero la actividad "${actividad.nombre}" tiene ${participantesActivos} participantes activos. ` +
        `Necesita un aula con capacidad mínima de ${participantesActivos} personas.`
      );
    }

    // ============================================================================
    // VALIDACIÓN 6: Disponibilidad horaria COMPLETA (LA MÁS CRÍTICA)
    // ============================================================================
    const horariosActividad = await this.prisma.horarios_actividades.findMany({
      where: {
        actividadId: data.actividadId,
        activo: true
      }
    });

    const conflictos = await detectarConflictosHorarios(
      this.prisma,
      data.aulaId,
      horariosActividad.map(h => ({
        diaSemanaId: h.diaSemanaId,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      }))
    );

    if (conflictos.length > 0) {
      const detallesConflictos = conflictos.map(c =>
        `- ${c.tipo}: "${c.nombre}" (${c.diaSemana} ${c.horaInicio}-${c.horaFin})`
      ).join('\n');

      throw new Error(
        `No se puede asignar el aula "${aula.nombre}" a la actividad "${actividad.nombre}" ` +
        `debido a conflictos horarios:\n${detallesConflictos}\n\n` +
        `Sugerencia: Use el endpoint /verificar-disponibilidad para obtener aulas alternativas.`
      );
    }

    // ============================================================================
    // ASIGNACIÓN EXITOSA
    // ============================================================================
    const asignacion = await this.actividadAulaRepository.create(data);

    logger.info(
      `✅ Aula "${aula.nombre}" asignada a actividad "${actividad.nombre}" ` +
      `(${participantesActivos}/${aula.capacidad} participantes)`
    );

    return asignacion;
  }

  /**
   * Obtiene todas las asignaciones con filtros
   */
  async findAll(query: QueryActividadesAulasDto) {
    const result = await this.actividadAulaRepository.findAll(query);
    const totalPages = Math.ceil(result.total / query.limit);

    return {
      data: result.data,
      total: result.total,
      page: query.page,
      totalPages
    };
  }

  /**
   * Obtiene una asignación por ID
   */
  async findById(id: number) {
    const asignacion = await this.actividadAulaRepository.findById(id);
    if (!asignacion) {
      throw new Error(`Asignación con ID ${id} no encontrada`);
    }
    return asignacion;
  }

  /**
   * Obtiene todas las aulas de una actividad
   */
  async getAulasByActividad(actividadId: number, soloActivas: boolean = true) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    return this.actividadAulaRepository.findByActividadId(actividadId, soloActivas);
  }

  /**
   * Obtiene todas las actividades de un aula
   */
  async getActividadesByAula(aulaId: number, soloActivas: boolean = true) {
    const aula = await this.aulaRepository.findById(aulaId.toString());
    if (!aula) {
      throw new Error(`Aula con ID ${aulaId} no encontrada`);
    }

    return this.actividadAulaRepository.findByAulaId(aulaId, soloActivas);
  }

  /**
   * Actualiza una asignación existente
   */
  async update(id: number, data: UpdateActividadAulaDto) {
    const asignacionExistente = await this.actividadAulaRepository.findById(id);
    if (!asignacionExistente) {
      throw new Error(`Asignación con ID ${id} no encontrada`);
    }

    return this.actividadAulaRepository.update(id, data);
  }

  /**
   * Elimina permanentemente una asignación
   */
  async delete(id: number) {
    const asignacionExistente = await this.actividadAulaRepository.findById(id);
    if (!asignacionExistente) {
      throw new Error(`Asignación con ID ${id} no encontrada`);
    }

    const deleted = await this.actividadAulaRepository.delete(id);

    logger.info(
      `❌ Asignación eliminada: Aula "${asignacionExistente.aulas.nombre}" ` +
      `de actividad "${asignacionExistente.actividades.nombre}"`
    );

    return deleted;
  }

  /**
   * Desasigna un aula de una actividad (soft delete)
   */
  async desasignarAula(id: number, data: DesasignarAulaDto) {
    const asignacionExistente = await this.actividadAulaRepository.findById(id);
    if (!asignacionExistente) {
      throw new Error(`Asignación con ID ${id} no encontrada`);
    }

    if (!asignacionExistente.activa) {
      throw new Error('La asignación ya está desactivada');
    }

    const desasignada = await this.actividadAulaRepository.desasignar(
      id,
      data.fechaDesasignacion ? new Date(data.fechaDesasignacion) : undefined,
      data.observaciones || undefined
    );

    logger.info(
      `⚠️  Aula "${asignacionExistente.aulas.nombre}" desasignada de actividad ` +
      `"${asignacionExistente.actividades.nombre}"`
    );

    return desasignada;
  }

  /**
   * Reactivar una asignación desactivada
   */
  async reactivarAsignacion(id: number) {
    const asignacionExistente = await this.actividadAulaRepository.findById(id);
    if (!asignacionExistente) {
      throw new Error(`Asignación con ID ${id} no encontrada`);
    }

    if (asignacionExistente.activa) {
      throw new Error('La asignación ya está activa');
    }

    // Validar disponibilidad horaria antes de reactivar
    const horariosActividad = await this.prisma.horarios_actividades.findMany({
      where: {
        actividadId: asignacionExistente.actividadId,
        activo: true
      }
    });

    const conflictos = await detectarConflictosHorarios(
      this.prisma,
      asignacionExistente.aulaId,
      horariosActividad.map(h => ({
        diaSemanaId: h.diaSemanaId,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      })),
      asignacionExistente.actividadId
    );

    if (conflictos.length > 0) {
      throw new Error(
        `No se puede reactivar la asignación debido a conflictos horarios actuales. ` +
        `El aula ahora está ocupada en los horarios de la actividad.`
      );
    }

    return this.actividadAulaRepository.reactivar(id);
  }

  /**
   * Verifica disponibilidad completa de un aula para una actividad
   */
  async verificarDisponibilidad(data: VerificarDisponibilidadDto): Promise<DisponibilidadResponse> {
    // Validar que actividad y aula existen
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

    // Obtener horarios de la actividad
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

    // Detectar conflictos horarios
    const conflictos = await detectarConflictosHorarios(
      this.prisma,
      data.aulaId,
      horariosActividad.map(h => ({
        diaSemanaId: h.diaSemanaId,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      })),
      data.excluirAsignacionId
    );

    // Verificar capacidad
    const participantesActivos = await this.prisma.participacion_actividades.count({
      where: {
        actividadId: data.actividadId,
        activa: true
      }
    });

    const capacidadSuficiente = participantesActivos <= aula.capacidad;

    // Construir respuesta
    const observaciones: string[] = [];
    if (!capacidadSuficiente) {
      observaciones.push(
        `⚠️  Capacidad insuficiente: ${participantesActivos} participantes > ${aula.capacidad} capacidad`
      );
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

  /**
   * Sugiere aulas disponibles para una actividad
   */
  async sugerirAulasParaActividad(actividadId: number, criterios?: any) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    return sugerirAulasDisponibles(this.prisma, actividadId, criterios);
  }

  /**
   * Asigna múltiples aulas a una actividad
   */
  async asignarMultiplesAulas(data: AsignarMultiplesAulasDto) {
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
      } catch (error) {
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

  /**
   * Cambia el aula de una actividad
   */
  async cambiarAula(actividadId: number, aulaIdActual: number, data: CambiarAulaDto) {
    // Buscar asignación actual
    const asignacionActual = await this.actividadAulaRepository.findByActividadAndAula(
      actividadId,
      aulaIdActual
    );

    if (!asignacionActual || !asignacionActual.activa) {
      throw new Error('No se encontró una asignación activa del aula especificada a la actividad');
    }

    // Desasignar aula actual
    await this.actividadAulaRepository.desasignar(
      asignacionActual.id,
      new Date(),
      data.observaciones || 'Cambio de aula'
    );

    // Asignar nueva aula
    const nuevaAsignacion = await this.asignarAula({
      actividadId,
      aulaId: data.nuevaAulaId,
      observaciones: data.observaciones || 'Cambio de aula'
    });

    logger.info(
      `🔄 Aula cambiada para actividad ${actividadId}: ` +
      `"${asignacionActual.aulas.nombre}" → "${nuevaAsignacion.aulas.nombre}"`
    );

    return {
      asignacionAnterior: asignacionActual,
      nuevaAsignacion
    };
  }

  /**
   * Obtiene resumen de ocupación de un aula
   */
  async getOcupacionAula(aulaId: number) {
    const aula = await this.aulaRepository.findById(aulaId.toString());
    if (!aula) {
      throw new Error(`Aula con ID ${aulaId} no encontrada`);
    }

    const resumen = await getResumenOcupacionAula(this.prisma, aulaId);

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
