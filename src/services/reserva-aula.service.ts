// @ts-nocheck
import { ReservaAula, PrismaClient } from '@prisma/client';
import { ReservaAulaRepository } from '@/repositories/reserva-aula.repository';
import { AulaRepository } from '@/repositories/aula.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { EstadoReservaService } from '@/services/estado-reserva.service';
import {
  CreateReservaAulaDto,
  UpdateReservaAulaDto,
  ReservaAulaQueryDto,
  ConflictDetectionDto,
  CreateBulkReservasDto,
  DeleteBulkReservasDto,
  CreateRecurringReservaDto,
  ReservaSearchDto,
  ReservaStatsDto,
  AprobarReservaDto,
  RechazarReservaDto,
  CancelarReservaDto
} from '@/dto/reserva-aula.dto';
import { logger } from '@/utils/logger';
import { hasActiveTipo, isPersonaActiva } from '@/utils/persona.helper';

export class ReservaAulaService {
  private estadoReservaService: EstadoReservaService;

  constructor(
    private reservaAulaRepository: ReservaAulaRepository,
    private aulaRepository: AulaRepository,
    private personaRepository: PersonaRepository,
    private actividadRepository: ActividadRepository,
    private prisma: PrismaClient
  ) {
    this.estadoReservaService = new EstadoReservaService(prisma);
  }

  async createReserva(data: CreateReservaAulaDto): Promise<ReservaAula> {
    // Validate that aula exists and is active
    const aula = await this.aulaRepository.findById(data.aulaId);
    if (!aula) {
      throw new Error(`Aula con ID ${data.aulaId} no encontrada`);
    }
    if (!aula.activa) {
      throw new Error(`El aula ${aula.nombre} no está activa`);
    }

    // Validate that docente exists and is DOCENTE type
    const docente = await this.personaRepository.findById(data.docenteId);
    if (!docente) {
      throw new Error(`Docente con ID ${data.docenteId} no encontrado`);
    }

    // Check if person is active
    if (!docente.activo) {
      throw new Error(`La persona ${docente.nombre} ${docente.apellido} está inactiva`);
    }

    // Check if person has DOCENTE type active
    const esDocente = await hasActiveTipo(docente.id, 'DOCENTE');
    if (!esDocente) {
      throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente activo`);
    }

    // Validate actividad if provided
    if (data.actividadId) {
      const actividad = await this.actividadRepository.findById(data.actividadId);
      if (!actividad) {
        throw new Error(`Actividad con ID ${data.actividadId} no encontrada`);
      }
      if (!actividad.activa) {
        throw new Error(`La actividad ${actividad.nombre} no está activa`);
      }
    }

    // Check for conflicts
    const conflicts = await this.detectConflicts({
      aulaId: data.aulaId,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin
    });

    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(c =>
        `${c.aulas.nombre} - ${new Date(c.fechaInicio).toLocaleString()} a ${new Date(c.fechaFin).toLocaleString()}`
      ).join(', ');
      throw new Error(`Conflicto de horarios detectado con las siguientes reservas: ${conflictDetails}`);
    }

    // Validate docente availability (check if docente has other reservations at the same time)
    await this.validateDocenteAvailability(data.docenteId, data.fechaInicio, data.fechaFin);

    // Assign default estado if not provided
    if (!data.estadoReservaId) {
      const estadoInicial = await this.estadoReservaService.getEstadoInicial();
      data.estadoReservaId = estadoInicial.id;
    }

    const reserva = await this.reservaAulaRepository.create(data);

    logger.info(`Reserva de aula creada: ${aula.nombre} - ${docente.nombre} ${docente.apellido} - ${new Date(data.fechaInicio).toLocaleString()} (ID: ${reserva.id})`);

    return reserva;
  }

  async getReservas(query: ReservaAulaQueryDto): Promise<{ data: ReservaAula[]; total: number; pages: number }> {
    const result = await this.reservaAulaRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  async getReservaById(id: number): Promise<ReservaAula | null> {
    return this.reservaAulaRepository.findById(id);
  }

  async getReservasByAula(aulaId: string, incluirPasadas = false): Promise<ReservaAula[]> {
    // Validate aula exists
    const aula = await this.aulaRepository.findById(aulaId);
    if (!aula) {
      throw new Error(`Aula con ID ${aulaId} no encontrada`);
    }

    return this.reservaAulaRepository.findByAulaId(aulaId, incluirPasadas);
  }

  async getReservasByDocente(docenteId: string, incluirPasadas = false): Promise<ReservaAula[]> {
    // Validate docente exists
    const docente = await this.personaRepository.findById(docenteId);
    if (!docente) {
      throw new Error(`Docente con ID ${docenteId} no encontrado`);
    }

    return this.reservaAulaRepository.findByDocenteId(docenteId, incluirPasadas);
  }

  async getReservasByActividad(actividadId: string, incluirPasadas = false): Promise<ReservaAula[]> {
    // Validate actividad exists
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    return this.reservaAulaRepository.findByActividadId(actividadId, incluirPasadas);
  }

  async updateReserva(id: number, data: UpdateReservaAulaDto): Promise<ReservaAula> {
    const existingReserva = await this.reservaAulaRepository.findById(id);
    if (!existingReserva) {
      throw new Error(`Reserva con ID ${id} no encontrada`);
    }

    // Validate aula if being updated
    if (data.aulaId && data.aulaId !== existingReserva.aulaId) {
      const aula = await this.aulaRepository.findById(data.aulaId);
      if (!aula || !aula.activa) {
        throw new Error(`Aula con ID ${data.aulaId} no encontrada o inactiva`);
      }
    }

    // Validate docente if being updated
    if (data.docenteId && data.docenteId !== existingReserva.docenteId) {
      const docente = await this.personaRepository.findById(data.docenteId);
      if (!docente) {
        throw new Error(`Docente con ID ${data.docenteId} no encontrado`);
      }
      if (!docente.activo) {
        throw new Error(`Docente con ID ${data.docenteId} está inactivo`);
      }
      const esDocente = await hasActiveTipo(docente.id, 'DOCENTE');
      if (!esDocente) {
        throw new Error(`La persona con ID ${data.docenteId} no es un docente activo`);
      }
    }

    // Validate actividad if being updated
    if (data.actividadId !== undefined && data.actividadId !== existingReserva.actividadId) {
      if (data.actividadId) {
        const actividad = await this.actividadRepository.findById(data.actividadId);
        if (!actividad || !actividad.activa) {
          throw new Error(`Actividad con ID ${data.actividadId} no encontrada o inactiva`);
        }
      }
    }

    // Check for conflicts if dates or aula are being updated
    if (data.fechaInicio || data.fechaFin || data.aulaId) {
      const conflictData: ConflictDetectionDto = {
        aulaId: data.aulaId || existingReserva.aulaId,
        fechaInicio: data.fechaInicio || existingReserva.fechaInicio.toISOString(),
        fechaFin: data.fechaFin || existingReserva.fechaFin.toISOString(),
        excludeReservaId: id
      };

      const conflicts = await this.detectConflicts(conflictData);
      if (conflicts.length > 0) {
        throw new Error(`Actualización cancelada: conflicto de horarios detectado`);
      }

      // Validate docente availability
      const docenteId = data.docenteId || existingReserva.docenteId;
      const fechaInicio = data.fechaInicio || existingReserva.fechaInicio.toISOString();
      const fechaFin = data.fechaFin || existingReserva.fechaFin.toISOString();

      await this.validateDocenteAvailability(docenteId, fechaInicio, fechaFin, id);
    }

    const updatedReserva = await this.reservaAulaRepository.update(id, data);

    logger.info(`Reserva de aula actualizada: ID ${id}`);

    return updatedReserva;
  }

  async deleteReserva(id: number): Promise<ReservaAula> {
    const existingReserva = await this.reservaAulaRepository.findById(id);
    if (!existingReserva) {
      throw new Error(`Reserva con ID ${id} no encontrada`);
    }

    // Check if reservation is in the past (prevent deletion of past events for audit purposes)
    const now = new Date();
    if (existingReserva.fechaFin < now) {
      throw new Error(`No se puede eliminar una reserva que ya finalizó`);
    }

    const deletedReserva = await this.reservaAulaRepository.delete(id);

    logger.info(`Reserva de aula eliminada: ${existingReserva.aula.nombre} - ${new Date(existingReserva.fechaInicio).toLocaleString()}`);

    return deletedReserva;
  }

  async detectConflicts(conflictData: ConflictDetectionDto): Promise<ReservaAula[]> {
    return this.reservaAulaRepository.detectConflicts(conflictData);
  }

  async createBulkReservas(data: CreateBulkReservasDto): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    const validReservas: CreateReservaAulaDto[] = [];

    // Validate each reservation
    for (const reserva of data.reservas) {
      try {
        // Basic validation (aula, docente, actividad)
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
        const esDocente = await hasActiveTipo(docente.id, 'DOCENTE');
        if (!esDocente) {
          errors.push(`Persona ${reserva.docenteId} no es un docente activo`);
          continue;
        }

        if (reserva.actividadId && (!actividad || !actividad.activa)) {
          errors.push(`Actividad ${reserva.actividadId} no válida`);
          continue;
        }

        // Check conflicts
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
      } catch (error) {
        errors.push(`Error validando reserva: ${error}`);
      }
    }

    // Create valid reservations
    const result = validReservas.length > 0
      ? await this.reservaAulaRepository.createBulk(validReservas)
      : { count: 0 };

    logger.info(`Creación masiva de reservas: ${result.count} creadas, ${errors.length} errores`);

    return {
      count: result.count,
      errors
    };
  }

  async deleteBulkReservas(data: DeleteBulkReservasDto): Promise<{ count: number }> {
    // Validate that all reservations can be deleted (not in the past)
    const reservas = await Promise.all(
      data.ids.map(id => this.reservaAulaRepository.findById(id))
    );

    const now = new Date();
    const invalidIds = reservas
      .filter((reserva, index) => !reserva || reserva.fechaFin < now)
      .map((_, index) => data.ids[index]);

    if (invalidIds.length > 0) {
      throw new Error(`No se pueden eliminar reservas pasadas o inexistentes: ${invalidIds.join(', ')}`);
    }

    const result = await this.reservaAulaRepository.deleteBulk(data.ids);

    logger.info(`Eliminación masiva de reservas: ${result.count} eliminadas`);

    return result;
  }

  async createRecurringReserva(data: CreateRecurringReservaDto): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    const reservasToCreate: CreateReservaAulaDto[] = [];

    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    const hasta = new Date(data.recurrencia.fechaHasta);
    const duracion = fin.getTime() - inicio.getTime();

    let currentDate = new Date(inicio);
    let count = 0;

    while (currentDate <= hasta && count < (data.recurrencia.maxOcurrencias || 100)) {
      // Check if current date matches criteria
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

      // Advance to next occurrence
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

    // Create all reservations using bulk method
    const result = await this.createBulkReservas({ reservas: reservasToCreate });

    logger.info(`Reservas recurrentes creadas: ${result.count} de ${reservasToCreate.length} planificadas`);

    return result;
  }

  async searchReservas(searchData: ReservaSearchDto): Promise<ReservaAula[]> {
    return this.reservaAulaRepository.search(searchData);
  }

  async getStatistics(statsData: ReservaStatsDto): Promise<any> {
    return this.reservaAulaRepository.getStatistics(statsData);
  }

  async getUpcomingReservations(limit = 10): Promise<ReservaAula[]> {
    return this.reservaAulaRepository.getUpcomingReservations(limit);
  }

  async getCurrentReservations(): Promise<ReservaAula[]> {
    return this.reservaAulaRepository.getCurrentReservations();
  }

  // Helper method to validate docente availability
  private async validateDocenteAvailability(
    docenteId: string,
    fechaInicio: string,
    fechaFin: string,
    excludeReservaId?: string
  ): Promise<void> {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Find overlapping reservations for the same docente
    const docenteReservas = await this.reservaAulaRepository.findByDocenteId(docenteId, true);

    const conflicts = docenteReservas.filter(reserva => {
      if (excludeReservaId && reserva.id === excludeReservaId) {
        return false;
      }

      const reservaInicio = new Date(reserva.fechaInicio);
      const reservaFin = new Date(reserva.fechaFin);

      // Check for overlap
      return (inicio < reservaFin && fin > reservaInicio);
    });

    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(c =>
        `${c.aulas.nombre} - ${new Date(c.fechaInicio).toLocaleString()}`
      ).join(', ');
      throw new Error(`El docente ya tiene reservas en horarios conflictivos: ${conflictDetails}`);
    }
  }

  // ============================================================================
  // WORKFLOW METHODS - ESTADOS DE RESERVA
  // ============================================================================

  /**
   * Aprobar una reserva
   * Transición: PENDIENTE -> CONFIRMADA
   */
  async aprobarReserva(id: number, data: AprobarReservaDto): Promise<ReservaAula> {
    const reserva = await this.reservaAulaRepository.findById(id);
    if (!reserva) {
      throw new Error(`Reserva con ID ${id} no encontrada`);
    }

    // Validate current state
    if (!reserva.estadoReserva) {
      throw new Error('La reserva no tiene un estado asignado');
    }

    // Validate transition
    const transicionValida = await this.estadoReservaService.validateTransicion(
      reserva.estadoReserva.codigo,
      'CONFIRMADA'
    );

    if (!transicionValida) {
      throw new Error(
        `No se puede aprobar una reserva en estado ${reserva.estadoReserva.nombre}. ` +
        `Solo se pueden aprobar reservas en estado PENDIENTE`
      );
    }

    // Validate persona que aprueba existe
    const aprobador = await this.personaRepository.findById(data.aprobadoPorId);
    if (!aprobador || !aprobador.activo) {
      throw new Error('La persona que intenta aprobar no existe o está inactiva');
    }

    // Get CONFIRMADA estado
    const estadoConfirmada = await this.estadoReservaService.findByCodigo('CONFIRMADA');

    // Update reserva
    const updatedReserva = await this.reservaAulaRepository.update(id, {
      estadoReservaId: estadoConfirmada.data.id,
      aprobadoPorId: data.aprobadoPorId,
      observaciones: data.observaciones || reserva.observaciones
    });

    logger.info(`Reserva ${id} aprobada por persona ${data.aprobadoPorId}`);

    return updatedReserva;
  }

  /**
   * Rechazar una reserva
   * Transición: PENDIENTE -> RECHAZADA
   */
  async rechazarReserva(id: number, data: RechazarReservaDto): Promise<ReservaAula> {
    const reserva = await this.reservaAulaRepository.findById(id);
    if (!reserva) {
      throw new Error(`Reserva con ID ${id} no encontrada`);
    }

    // Validate current state
    if (!reserva.estadoReserva) {
      throw new Error('La reserva no tiene un estado asignado');
    }

    // Validate transition
    const transicionValida = await this.estadoReservaService.validateTransicion(
      reserva.estadoReserva.codigo,
      'RECHAZADA'
    );

    if (!transicionValida) {
      throw new Error(
        `No se puede rechazar una reserva en estado ${reserva.estadoReserva.nombre}. ` +
        `Solo se pueden rechazar reservas en estado PENDIENTE`
      );
    }

    // Validate persona que rechaza existe
    const rechazador = await this.personaRepository.findById(data.rechazadoPorId);
    if (!rechazador || !rechazador.activo) {
      throw new Error('La persona que intenta rechazar no existe o está inactiva');
    }

    // Get RECHAZADA estado
    const estadoRechazada = await this.estadoReservaService.findByCodigo('RECHAZADA');

    // Update reserva (set activa = false and add motivo)
    const updatedReserva = await this.reservaAulaRepository.update(id, {
      estadoReservaId: estadoRechazada.data.id,
      canceladoPorId: data.rechazadoPorId, // Reuse canceladoPor for rechazadoPor
      motivoCancelacion: data.motivo,
      activa: false
    } as any);

    logger.info(`Reserva ${id} rechazada por persona ${data.rechazadoPorId}. Motivo: ${data.motivo}`);

    return updatedReserva;
  }

  /**
   * Cancelar una reserva
   * Transición: PENDIENTE | CONFIRMADA -> CANCELADA
   */
  async cancelarReserva(id: number, data: CancelarReservaDto): Promise<ReservaAula> {
    const reserva = await this.reservaAulaRepository.findById(id);
    if (!reserva) {
      throw new Error(`Reserva con ID ${id} no encontrada`);
    }

    // Validate current state
    if (!reserva.estadoReserva) {
      throw new Error('La reserva no tiene un estado asignado');
    }

    // Validate transition
    const transicionValida = await this.estadoReservaService.validateTransicion(
      reserva.estadoReserva.codigo,
      'CANCELADA'
    );

    if (!transicionValida) {
      throw new Error(
        `No se puede cancelar una reserva en estado ${reserva.estadoReserva.nombre}. ` +
        `Solo se pueden cancelar reservas en estado PENDIENTE o CONFIRMADA`
      );
    }

    // Validate persona que cancela existe
    const cancelador = await this.personaRepository.findById(data.canceladoPorId);
    if (!cancelador || !cancelador.activo) {
      throw new Error('La persona que intenta cancelar no existe o está inactiva');
    }

    // Get CANCELADA estado
    const estadoCancelada = await this.estadoReservaService.findByCodigo('CANCELADA');

    // Update reserva (set activa = false)
    const updatedReserva = await this.reservaAulaRepository.update(id, {
      estadoReservaId: estadoCancelada.data.id,
      canceladoPorId: data.canceladoPorId,
      motivoCancelacion: data.motivoCancelacion,
      activa: false
    } as any);

    logger.info(`Reserva ${id} cancelada por persona ${data.canceladoPorId}. Motivo: ${data.motivoCancelacion}`);

    return updatedReserva;
  }

  /**
   * Completar una reserva (finalizada exitosamente)
   * Transición: CONFIRMADA -> COMPLETADA
   */
  async completarReserva(id: number): Promise<ReservaAula> {
    const reserva = await this.reservaAulaRepository.findById(id);
    if (!reserva) {
      throw new Error(`Reserva con ID ${id} no encontrada`);
    }

    // Validate current state
    if (!reserva.estadoReserva) {
      throw new Error('La reserva no tiene un estado asignado');
    }

    // Validate transition
    const transicionValida = await this.estadoReservaService.validateTransicion(
      reserva.estadoReserva.codigo,
      'COMPLETADA'
    );

    if (!transicionValida) {
      throw new Error(
        `No se puede completar una reserva en estado ${reserva.estadoReserva.nombre}. ` +
        `Solo se pueden completar reservas en estado CONFIRMADA`
      );
    }

    // Validate reservation has ended
    const now = new Date();
    if (reserva.fechaFin > now) {
      throw new Error('No se puede completar una reserva que aún no ha finalizado');
    }

    // Get COMPLETADA estado
    const estadoCompletada = await this.estadoReservaService.findByCodigo('COMPLETADA');

    // Update reserva
    const updatedReserva = await this.reservaAulaRepository.update(id, {
      estadoReservaId: estadoCompletada.data.id
    });

    logger.info(`Reserva ${id} marcada como completada`);

    return updatedReserva;
  }

  // ============================================================================
  // ADVANCED CONFLICT DETECTION
  // ============================================================================

  /**
   * Detecta TODOS los conflictos (puntuales + recurrentes)
   * Combina conflictos de reserva_aulas y reservas_aulas_secciones
   */
  async detectAllConflicts(conflictData: ConflictDetectionDto): Promise<{
    puntuales: ReservaAula[];
    recurrentes: any[];
    total: number;
  }> {
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

  // ============================================================================
  // BUSINESS VALIDATIONS
  // ============================================================================

  /**
   * Valida que el aula tenga capacidad suficiente para la actividad
   */
  async validateCapacidadAula(aulaId: number, actividadId?: number): Promise<boolean> {
    const aula = await this.aulaRepository.findById(aulaId);
    if (!aula) {
      throw new Error(`Aula con ID ${aulaId} no encontrada`);
    }

    if (actividadId) {
      const actividad = await this.actividadRepository.findById(actividadId);
      if (!actividad) {
        throw new Error(`Actividad con ID ${actividadId} no encontrada`);
      }

      // Validate capacity (assuming actividad has a capacidadRequerida field)
      // This would require adding this field to the actividad model
      // For now, just return true as capacity is not enforced
    }

    return true;
  }

  /**
   * Valida que el aula tenga el equipamiento requerido para la actividad
   */
  async validateEquipamientoRequerido(aulaId: number, actividadId?: number): Promise<boolean> {
    const aula = await this.aulaRepository.findById(aulaId);
    if (!aula) {
      throw new Error(`Aula con ID ${aulaId} no encontrada`);
    }

    if (actividadId) {
      const actividad = await this.actividadRepository.findById(actividadId);
      if (!actividad) {
        throw new Error(`Actividad con ID ${actividadId} no encontrada`);
      }

      // Validate equipment (assuming actividad has an equipamientoRequerido field)
      // This would require implementing equipment requirements in the actividad model
      // For now, just return true as equipment validation is not enforced
    }

    return true;
  }

  /**
   * Valida que la reserva esté dentro del horario de operación del aula
   */
  async validateHorarioOperacion(aulaId: number, fechaInicio: string, fechaFin: string): Promise<boolean> {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Get hour and minutes
    const horaInicio = inicio.getHours();
    const minutoInicio = inicio.getMinutes();
    const horaFin = fin.getHours();
    const minutoFin = fin.getMinutes();

    // Default operating hours: 8:00 - 22:00 (could be made configurable per aula)
    const HORA_APERTURA = 8;
    const HORA_CIERRE = 22;

    if (horaInicio < HORA_APERTURA || (horaFin > HORA_CIERRE || (horaFin === HORA_CIERRE && minutoFin > 0))) {
      throw new Error(
        `La reserva debe estar dentro del horario de operación (${HORA_APERTURA}:00 - ${HORA_CIERRE}:00)`
      );
    }

    return true;
  }
}