import { PrismaClient, DiaSemana, TipoPersona } from '@prisma/client';
import { SeccionRepository } from '@/repositories/seccion.repository';
import {
  CreateSeccionDto,
  UpdateSeccionDto,
  CreateHorarioSeccionDto,
  UpdateHorarioSeccionDto,
  CreateParticipacionSeccionDto,
  UpdateParticipacionSeccionDto,
  CreateReservaAulaSeccionDto,
  UpdateReservaAulaSeccionDto,
  QuerySeccionesDto,
  VerificarConflictoSeccionDto
} from '@/dto/seccion.dto';
import {
  SeccionConHorarios,
  SeccionDetallada,
  PaginationParams,
  ConflictoSeccion,
  EstadisticasSeccion,
  CargaHorariaDocente,
  HorarioSemanalSeccion,
  OcupacionSecciones
} from '@/types/interfaces';

export class SeccionService {
  private repository: SeccionRepository;

  constructor(private prisma: PrismaClient) {
    this.repository = new SeccionRepository(prisma);
  }

  // ============================================================================
  // CRUD DE SECCIONES
  // ============================================================================

  /**
   * Crear nueva sección con validaciones completas
   */
  async createSeccion(data: CreateSeccionDto): Promise<SeccionConHorarios> {
    // 1. Validar que la actividad existe
    const actividad = await this.prisma.actividad.findUnique({
      where: { id: data.actividadId }
    });

    if (!actividad) {
      throw new Error('Actividad no encontrada');
    }

    if (!actividad.activa) {
      throw new Error('No se puede crear sección para una actividad inactiva');
    }

    // 2. Validar que el nombre de la sección no esté duplicado para esta actividad
    const seccionExistente = await this.prisma.seccionActividad.findUnique({
      where: {
        actividadId_nombre: {
          actividadId: data.actividadId,
          nombre: data.nombre
        }
      }
    });

    if (seccionExistente) {
      throw new Error(`Ya existe una sección con el nombre "${data.nombre}" para esta actividad`);
    }

    // 3. Validar código único si se proporciona
    if (data.codigo) {
      const codigoExistente = await this.prisma.seccionActividad.findFirst({
        where: {
          codigo: data.codigo,
          actividadId: data.actividadId
        }
      });

      if (codigoExistente) {
        throw new Error(`El código "${data.codigo}" ya está en uso para esta actividad`);
      }
    }

    // 4. Validar que los docentes existen y son tipo DOCENTE
    if (data.docenteIds && data.docenteIds.length > 0) {
      const docentes = await this.prisma.persona.findMany({
        where: {
          id: { in: data.docenteIds },
          tipo: TipoPersona.DOCENTE
        }
      });

      if (docentes.length !== data.docenteIds.length) {
        throw new Error('Uno o más docentes no existen o no son de tipo DOCENTE');
      }

      // Validar conflictos de horarios de docentes
      if (data.horarios && data.horarios.length > 0) {
        for (const docente of docentes) {
          for (const horario of data.horarios) {
            const conflictos = await this.repository.verificarConflictoDocente(
              docente.id,
              horario.diaSemana,
              horario.horaInicio,
              horario.horaFin
            );

            if (conflictos.length > 0) {
              const conflicto = conflictos[0];
              throw new Error(
                `El docente ${docente.nombre} ${docente.apellido} ya tiene asignada ` +
                `la sección "${conflicto.nombre}" de "${conflicto.actividad.nombre}" ` +
                `el día ${horario.diaSemana} de ${horario.horaInicio} a ${horario.horaFin}`
              );
            }
          }
        }
      }
    }

    // 5. Validar horarios (no solapamiento interno)
    if (data.horarios && data.horarios.length > 1) {
      for (let i = 0; i < data.horarios.length; i++) {
        for (let j = i + 1; j < data.horarios.length; j++) {
          const h1 = data.horarios[i];
          const h2 = data.horarios[j];

          if (h1.diaSemana === h2.diaSemana) {
            const overlap = this.checkHorarioOverlap(
              h1.horaInicio,
              h1.horaFin,
              h2.horaInicio,
              h2.horaFin
            );

            if (overlap) {
              throw new Error(
                `Conflicto de horarios el día ${h1.diaSemana}: ` +
                `${h1.horaInicio}-${h1.horaFin} se solapa con ${h2.horaInicio}-${h2.horaFin}`
              );
            }
          }
        }
      }
    }

    // 6. Validar reservas de aulas si se proporcionan
    if (data.reservasAulas && data.reservasAulas.length > 0) {
      for (const reserva of data.reservasAulas) {
        // Verificar que el aula existe
        const aula = await this.prisma.aula.findUnique({
          where: { id: reserva.aulaId }
        });

        if (!aula) {
          throw new Error(`Aula con ID ${reserva.aulaId} no encontrada`);
        }

        if (!aula.activa) {
          throw new Error(`El aula ${aula.nombre} no está activa`);
        }
      }
    }

    // 7. Crear la sección
    const seccion = await this.repository.create(data);

    // 8. Crear reservas de aulas si se proporcionaron (después de crear la sección)
    if (data.reservasAulas && data.reservasAulas.length > 0) {
      for (const reserva of data.reservasAulas) {
        // Validar conflictos de aula antes de crear
        const conflictos = await this.repository.verificarConflictoAula(
          reserva.aulaId,
          reserva.diaSemana,
          reserva.horaInicio,
          reserva.horaFin
        );

        if (conflictos.length > 0) {
          // Eliminar la sección creada si hay conflictos
          await this.repository.delete(seccion.id);
          const conflicto = conflictos[0];
          throw new Error(
            `El aula ya está reservada para la sección "${conflicto.seccion.nombre}" ` +
            `de "${conflicto.seccion.actividad.nombre}" ` +
            `el día ${reserva.diaSemana} de ${reserva.horaInicio} a ${reserva.horaFin}`
          );
        }

        await this.repository.createReservaAula({
          seccionId: seccion.id,
          ...reserva
        });
      }
    }

    return this.repository.findById(seccion.id) as Promise<SeccionConHorarios>;
  }

  /**
   * Obtener sección por ID
   */
  async getSeccionById(id: string): Promise<SeccionConHorarios> {
    const seccion = await this.repository.findById(id);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    return seccion;
  }

  /**
   * Obtener sección detallada por ID
   */
  async getSeccionDetallada(id: string): Promise<SeccionDetallada> {
    const seccion = await this.repository.findByIdDetallada(id);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    return seccion;
  }

  /**
   * Listar secciones con filtros
   */
  async listSecciones(
    filters: QuerySeccionesDto,
    pagination: PaginationParams
  ): Promise<{ secciones: SeccionConHorarios[]; total: number; totalPages: number }> {
    const { secciones, total } = await this.repository.findAll(filters, pagination);

    return {
      secciones,
      total,
      totalPages: Math.ceil(total / pagination.limit)
    };
  }

  /**
   * Actualizar sección
   */
  async updateSeccion(id: string, data: UpdateSeccionDto): Promise<SeccionConHorarios> {
    const seccionExistente = await this.repository.findById(id);

    if (!seccionExistente) {
      throw new Error('Sección no encontrada');
    }

    // Validar nombre único si se está actualizando
    if (data.nombre && data.nombre !== seccionExistente.nombre) {
      const nombreDuplicado = await this.prisma.seccionActividad.findUnique({
        where: {
          actividadId_nombre: {
            actividadId: seccionExistente.actividadId,
            nombre: data.nombre
          }
        }
      });

      if (nombreDuplicado) {
        throw new Error(`Ya existe una sección con el nombre "${data.nombre}" para esta actividad`);
      }
    }

    // Validar código único si se está actualizando
    if (data.codigo && data.codigo !== seccionExistente.codigo) {
      const codigoDuplicado = await this.prisma.seccionActividad.findFirst({
        where: {
          codigo: data.codigo,
          actividadId: seccionExistente.actividadId,
          id: { not: id }
        }
      });

      if (codigoDuplicado) {
        throw new Error(`El código "${data.codigo}" ya está en uso para esta actividad`);
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Eliminar sección
   */
  async deleteSeccion(id: string): Promise<void> {
    const seccion = await this.repository.findById(id);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    // Validar que no tenga participaciones activas
    const participantesActivos = await this.repository.contarParticipantesActivos(id);

    if (participantesActivos > 0) {
      throw new Error(
        `No se puede eliminar la sección porque tiene ${participantesActivos} participantes activos. ` +
        'Desactive la sección o dé de baja a los participantes primero.'
      );
    }

    await this.repository.delete(id);
  }

  // ============================================================================
  // GESTIÓN DE HORARIOS
  // ============================================================================

  /**
   * Agregar horario a sección con validaciones
   */
  async addHorario(data: CreateHorarioSeccionDto) {
    const seccion = await this.repository.findById(data.seccionId);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    // Validar conflictos con otros horarios de la misma sección
    for (const horario of seccion.horarios) {
      if (horario.diaSemana === data.diaSemana) {
        const overlap = this.checkHorarioOverlap(
          data.horaInicio,
          data.horaFin,
          horario.horaInicio,
          horario.horaFin
        );

        if (overlap) {
          throw new Error(
            `Conflicto de horarios: el nuevo horario ${data.horaInicio}-${data.horaFin} ` +
            `se solapa con el horario existente ${horario.horaInicio}-${horario.horaFin}`
          );
        }
      }
    }

    // Validar conflictos con docentes
    for (const docente of seccion.docentes) {
      const conflictos = await this.repository.verificarConflictoDocente(
        docente.id,
        data.diaSemana,
        data.horaInicio,
        data.horaFin,
        data.seccionId
      );

      if (conflictos.length > 0) {
        const conflicto = conflictos[0];
        throw new Error(
          `El docente ${docente.nombre} ${docente.apellido} ya tiene asignada ` +
          `la sección "${conflicto.nombre}" el día ${data.diaSemana} ` +
          `de ${data.horaInicio} a ${data.horaFin}`
        );
      }
    }

    return this.repository.addHorario(data);
  }

  /**
   * Actualizar horario con validaciones
   */
  async updateHorario(id: string, data: UpdateHorarioSeccionDto) {
    const horario = await this.repository.findHorarioById(id);

    if (!horario) {
      throw new Error('Horario no encontrado');
    }

    // Si se están actualizando día u horas, validar conflictos
    if (data.diaSemana || data.horaInicio || data.horaFin) {
      const nuevoDia = data.diaSemana || horario.diaSemana;
      const nuevaHoraInicio = data.horaInicio || horario.horaInicio;
      const nuevaHoraFin = data.horaFin || horario.horaFin;

      // Validar conflictos con otros horarios de la misma sección
      const seccion = await this.repository.findById(horario.seccionId);

      if (seccion) {
        for (const h of seccion.horarios) {
          if (h.id !== id && h.diaSemana === nuevoDia) {
            const overlap = this.checkHorarioOverlap(
              nuevaHoraInicio,
              nuevaHoraFin,
              h.horaInicio,
              h.horaFin
            );

            if (overlap) {
              throw new Error(
                `Conflicto de horarios: el horario actualizado se solapa con ` +
                `el horario existente ${h.horaInicio}-${h.horaFin}`
              );
            }
          }
        }

        // Validar conflictos con docentes
        for (const docente of seccion.docentes) {
          const conflictos = await this.repository.verificarConflictoDocente(
            docente.id,
            nuevoDia,
            nuevaHoraInicio,
            nuevaHoraFin,
            horario.seccionId
          );

          if (conflictos.length > 0) {
            const conflicto = conflictos[0];
            throw new Error(
              `El docente ${docente.nombre} ${docente.apellido} ya tiene asignada ` +
              `otra sección en ese horario`
            );
          }
        }
      }
    }

    return this.repository.updateHorario(id, data);
  }

  /**
   * Eliminar horario
   */
  async deleteHorario(id: string): Promise<void> {
    const horario = await this.repository.findHorarioById(id);

    if (!horario) {
      throw new Error('Horario no encontrado');
    }

    await this.repository.deleteHorario(id);
  }

  // ============================================================================
  // GESTIÓN DE DOCENTES
  // ============================================================================

  /**
   * Asignar docente a sección con validación de conflictos
   */
  async addDocente(seccionId: string, docenteId: string) {
    const seccion = await this.repository.findById(seccionId);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    // Verificar que el docente existe y es tipo DOCENTE
    const docente = await this.prisma.persona.findUnique({
      where: { id: docenteId }
    });

    if (!docente) {
      throw new Error('Docente no encontrado');
    }

    if (docente.tipo !== TipoPersona.DOCENTE) {
      throw new Error('La persona seleccionada no es un docente');
    }

    // Verificar que el docente no esté ya asignado
    const yaAsignado = seccion.docentes.some(d => d.id === docenteId);

    if (yaAsignado) {
      throw new Error('El docente ya está asignado a esta sección');
    }

    // Validar conflictos de horarios
    for (const horario of seccion.horarios) {
      const conflictos = await this.repository.verificarConflictoDocente(
        docenteId,
        horario.diaSemana,
        horario.horaInicio,
        horario.horaFin,
        seccionId
      );

      if (conflictos.length > 0) {
        const conflicto = conflictos[0];
        throw new Error(
          `El docente ${docente.nombre} ${docente.apellido} ya tiene asignada ` +
          `la sección "${conflicto.nombre}" de "${conflicto.actividad.nombre}" ` +
          `el día ${horario.diaSemana} de ${horario.horaInicio} a ${horario.horaFin}`
        );
      }
    }

    return this.repository.addDocente(seccionId, docenteId);
  }

  /**
   * Remover docente de sección
   */
  async removeDocente(seccionId: string, docenteId: string) {
    const seccion = await this.repository.findById(seccionId);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    const docenteAsignado = seccion.docentes.some(d => d.id === docenteId);

    if (!docenteAsignado) {
      throw new Error('El docente no está asignado a esta sección');
    }

    return this.repository.removeDocente(seccionId, docenteId);
  }

  // ============================================================================
  // GESTIÓN DE PARTICIPACIONES
  // ============================================================================

  /**
   * Inscribir participante en sección con validaciones
   */
  async inscribirParticipante(data: CreateParticipacionSeccionDto) {
    const seccion = await this.repository.findByIdDetallada(data.seccionId);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    if (!seccion.activa) {
      throw new Error('No se puede inscribir en una sección inactiva');
    }

    // Verificar que la persona existe
    const persona = await this.prisma.persona.findUnique({
      where: { id: data.personaId }
    });

    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    // Verificar que no esté ya inscrito
    const yaInscrito = await this.repository.findParticipacionByPersonaSeccion(
      data.personaId,
      data.seccionId
    );

    if (yaInscrito) {
      throw new Error('La persona ya está inscrita en esta sección');
    }

    // Verificar capacidad máxima
    if (seccion.capacidadMaxima) {
      const participantesActivos = await this.repository.contarParticipantesActivos(data.seccionId);

      if (participantesActivos >= seccion.capacidadMaxima) {
        throw new Error(
          `La sección ha alcanzado su capacidad máxima (${seccion.capacidadMaxima} participantes)`
        );
      }
    }

    return this.repository.createParticipacion(data);
  }

  /**
   * Actualizar participación
   */
  async updateParticipacion(id: string, data: UpdateParticipacionSeccionDto) {
    const participacion = await this.repository.findParticipacionById(id);

    if (!participacion) {
      throw new Error('Participación no encontrada');
    }

    return this.repository.updateParticipacion(id, data);
  }

  /**
   * Dar de baja participación
   */
  async bajaParticipacion(id: string, fechaFin?: Date) {
    const participacion = await this.repository.findParticipacionById(id);

    if (!participacion) {
      throw new Error('Participación no encontrada');
    }

    if (!participacion.activa) {
      throw new Error('La participación ya está inactiva');
    }

    return this.repository.bajaParticipacion(id, fechaFin);
  }

  /**
   * Listar participantes de una sección
   */
  async listarParticipantes(seccionId: string, soloActivas: boolean = true) {
    const seccion = await this.repository.findById(seccionId);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    return this.repository.findParticipacionesBySeccion(seccionId, soloActivas);
  }

  /**
   * Listar secciones de una persona
   */
  async listarSeccionesPersona(personaId: string, soloActivas: boolean = true) {
    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId }
    });

    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    return this.repository.findParticipacionesByPersona(personaId, soloActivas);
  }

  // ============================================================================
  // GESTIÓN DE RESERVAS DE AULAS
  // ============================================================================

  /**
   * Crear reserva de aula con validación de conflictos
   */
  async createReservaAula(data: CreateReservaAulaSeccionDto) {
    const seccion = await this.repository.findById(data.seccionId);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    // Verificar que el aula existe
    const aula = await this.prisma.aula.findUnique({
      where: { id: data.aulaId }
    });

    if (!aula) {
      throw new Error('Aula no encontrada');
    }

    if (!aula.activa) {
      throw new Error(`El aula ${aula.nombre} no está activa`);
    }

    // Validar conflictos de aula
    const conflictos = await this.repository.verificarConflictoAula(
      data.aulaId,
      data.diaSemana,
      data.horaInicio,
      data.horaFin,
      data.seccionId
    );

    if (conflictos.length > 0) {
      const conflicto = conflictos[0];
      throw new Error(
        `El aula ${aula.nombre} ya está reservada para la sección ` +
        `"${conflicto.seccion.nombre}" de "${conflicto.seccion.actividad.nombre}" ` +
        `el día ${data.diaSemana} de ${data.horaInicio} a ${data.horaFin}`
      );
    }

    return this.repository.createReservaAula(data);
  }

  /**
   * Actualizar reserva de aula
   */
  async updateReservaAula(id: string, data: UpdateReservaAulaSeccionDto) {
    const reserva = await this.repository.findReservaAulaById(id);

    if (!reserva) {
      throw new Error('Reserva de aula no encontrada');
    }

    return this.repository.updateReservaAula(id, data);
  }

  /**
   * Eliminar reserva de aula
   */
  async deleteReservaAula(id: string) {
    const reserva = await this.repository.findReservaAulaById(id);

    if (!reserva) {
      throw new Error('Reserva de aula no encontrada');
    }

    await this.repository.deleteReservaAula(id);
  }

  // ============================================================================
  // VALIDACIONES Y UTILIDADES
  // ============================================================================

  /**
   * Verificar conflictos de docente/aula
   */
  async verificarConflictos(data: VerificarConflictoSeccionDto): Promise<ConflictoSeccion[]> {
    const conflictos: ConflictoSeccion[] = [];

    // Verificar conflictos de docente si se proporciona
    if (data.docenteId) {
      const conflictosDocente = await this.repository.verificarConflictoDocente(
        data.docenteId,
        data.diaSemana,
        data.horaInicio,
        data.horaFin,
        data.seccionId
      );

      for (const conflicto of conflictosDocente) {
        const docente = await this.prisma.persona.findUnique({
          where: { id: data.docenteId }
        });

        conflictos.push({
          tipo: 'DOCENTE',
          mensaje: `El docente ${docente?.nombre} ${docente?.apellido} ya tiene asignada otra sección en este horario`,
          detalles: {
            seccionId: conflicto.id,
            seccionNombre: conflicto.nombre,
            actividadNombre: conflicto.actividad.nombre,
            diaSemana: data.diaSemana,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            docente: `${docente?.nombre} ${docente?.apellido}`
          }
        });
      }
    }

    // Verificar conflictos de aula si se proporciona
    if (data.aulaId) {
      const conflictosAula = await this.repository.verificarConflictoAula(
        data.aulaId,
        data.diaSemana,
        data.horaInicio,
        data.horaFin,
        data.seccionId
      );

      for (const conflicto of conflictosAula) {
        const aula = await this.prisma.aula.findUnique({
          where: { id: data.aulaId }
        });

        conflictos.push({
          tipo: 'AULA',
          mensaje: `El aula ${aula?.nombre} ya está reservada para otra sección en este horario`,
          detalles: {
            seccionId: conflicto.seccion.id,
            seccionNombre: conflicto.seccion.nombre,
            actividadNombre: conflicto.seccion.actividad.nombre,
            diaSemana: data.diaSemana,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            aula: aula?.nombre
          }
        });
      }
    }

    return conflictos;
  }

  /**
   * Verificar solapamiento de horarios
   */
  private checkHorarioOverlap(
    inicio1: string,
    fin1: string,
    inicio2: string,
    fin2: string
  ): boolean {
    const [h1Inicio, m1Inicio] = inicio1.split(':').map(Number);
    const [h1Fin, m1Fin] = fin1.split(':').map(Number);
    const [h2Inicio, m2Inicio] = inicio2.split(':').map(Number);
    const [h2Fin, m2Fin] = fin2.split(':').map(Number);

    const minutos1Inicio = h1Inicio * 60 + m1Inicio;
    const minutos1Fin = h1Fin * 60 + m1Fin;
    const minutos2Inicio = h2Inicio * 60 + m2Inicio;
    const minutos2Fin = h2Fin * 60 + m2Fin;

    return minutos1Inicio < minutos2Fin && minutos1Fin > minutos2Inicio;
  }

  // ============================================================================
  // REPORTES Y ESTADÍSTICAS
  // ============================================================================

  /**
   * Obtener estadísticas de una sección
   */
  async getEstadisticasSeccion(seccionId: string): Promise<EstadisticasSeccion> {
    const seccion = await this.repository.findByIdDetallada(seccionId);

    if (!seccion) {
      throw new Error('Sección no encontrada');
    }

    const participantesActivos = seccion.participaciones.filter(p => p.activa);
    const socios = participantesActivos.filter(p => p.persona.tipo === TipoPersona.SOCIO);
    const noSocios = participantesActivos.filter(p => p.persona.tipo === TipoPersona.NO_SOCIO);

    const capacidad = seccion.capacidadMaxima || seccion.actividad.capacidadMaxima || 0;
    const ocupacion = capacidad > 0
      ? Math.round((participantesActivos.length / capacidad) * 100)
      : 0;
    const disponibles = capacidad > 0 ? capacidad - participantesActivos.length : 0;

    return {
      seccion: seccion.nombre,
      actividad: seccion.actividad.nombre,
      participantes: {
        total: participantesActivos.length,
        activos: participantesActivos.length,
        socios: socios.length,
        noSocios: noSocios.length
      },
      ocupacion: {
        porcentaje: ocupacion,
        disponibles: Math.max(0, disponibles)
      },
      docentes: seccion.docentes.map(d => `${d.nombre} ${d.apellido}`),
      aulas: seccion.reservasAula.map(r => r.aula.nombre),
      horarios: seccion.horarios.map(h => ({
        dia: h.diaSemana,
        horario: `${h.horaInicio}-${h.horaFin}`
      }))
    };
  }

  /**
   * Obtener carga horaria de un docente
   */
  async getCargaHorariaDocente(docenteId: string): Promise<CargaHorariaDocente> {
    const docente = await this.prisma.persona.findUnique({
      where: { id: docenteId }
    });

    if (!docente) {
      throw new Error('Docente no encontrado');
    }

    if (docente.tipo !== TipoPersona.DOCENTE) {
      throw new Error('La persona seleccionada no es un docente');
    }

    const secciones = await this.repository.findSeccionesByDocente(docenteId);

    let totalHorasSemana = 0;
    const seccionesDetalle = [];

    for (const seccion of secciones) {
      for (const horario of seccion.horarios) {
        const [hInicio, mInicio] = horario.horaInicio.split(':').map(Number);
        const [hFin, mFin] = horario.horaFin.split(':').map(Number);
        const horas = (hFin * 60 + mFin - hInicio * 60 - mInicio) / 60;

        totalHorasSemana += horas;

        seccionesDetalle.push({
          seccionId: seccion.id,
          actividad: seccion.actividad.nombre,
          seccion: seccion.nombre,
          horas,
          dia: horario.diaSemana,
          horario: `${horario.horaInicio}-${horario.horaFin}`
        });
      }
    }

    const resultado: CargaHorariaDocente = {
      docenteId: docente.id,
      docente: `${docente.nombre} ${docente.apellido}`,
      totalHorasSemana,
      secciones: seccionesDetalle
    };

    // Agregar alerta si supera las 20 horas semanales
    if (totalHorasSemana > 20) {
      resultado.alerta = {
        tipo: 'SOBRECARGA',
        mensaje: `El docente tiene ${totalHorasSemana} horas semanales, superando las 20 horas recomendadas`
      };
    }

    return resultado;
  }

  /**
   * Obtener horario semanal de secciones
   */
  async getHorarioSemanal(): Promise<HorarioSemanalSeccion[]> {
    const diasSemana: DiaSemana[] = [
      DiaSemana.LUNES,
      DiaSemana.MARTES,
      DiaSemana.MIERCOLES,
      DiaSemana.JUEVES,
      DiaSemana.VIERNES,
      DiaSemana.SABADO,
      DiaSemana.DOMINGO
    ];

    const horarioSemanal: HorarioSemanalSeccion[] = [];

    for (const dia of diasSemana) {
      const secciones = await this.repository.findSeccionesByDia(dia);

      const seccionesDelDia = [];

      for (const seccion of secciones) {
        const participantesActivos = await this.repository.contarParticipantesActivos(seccion.id);
        const capacidad = seccion.capacidadMaxima || seccion.actividad.capacidadMaxima || 0;
        const ocupacion = capacidad > 0
          ? Math.round((participantesActivos / capacidad) * 100)
          : 0;

        for (const horario of seccion.horarios) {
          const reservaAula = await this.prisma.reservaAulaSeccion.findFirst({
            where: {
              seccionId: seccion.id,
              diaSemana: dia,
              horaInicio: horario.horaInicio
            },
            include: {
              aula: true
            }
          });

          seccionesDelDia.push({
            seccionId: seccion.id,
            actividadNombre: seccion.actividad.nombre,
            seccionNombre: seccion.nombre,
            codigo: seccion.codigo || undefined,
            docentes: seccion.docentes.map(d => `${d.nombre} ${d.apellido}`),
            aula: reservaAula?.aula.nombre,
            horario: `${horario.horaInicio}-${horario.horaFin}`,
            participantes: participantesActivos,
            capacidad,
            ocupacion
          });
        }
      }

      horarioSemanal.push({
        dia,
        secciones: seccionesDelDia.sort((a, b) => a.horario.localeCompare(b.horario))
      });
    }

    return horarioSemanal;
  }

  /**
   * Obtener ocupación global de secciones
   */
  async getOcupacionSecciones(): Promise<OcupacionSecciones> {
    const secciones = await this.prisma.seccionActividad.findMany({
      where: { activa: true },
      include: {
        actividad: true,
        _count: {
          select: {
            participaciones: true
          }
        }
      }
    });

    let totalOcupacion = 0;
    let seccionesConCapacidad = 0;
    let seccionesLlenas = 0;
    let seccionesDisponibles = 0;

    const detalle = [];

    for (const seccion of secciones) {
      const participantesActivos = await this.repository.contarParticipantesActivos(seccion.id);
      const capacidad = seccion.capacidadMaxima || seccion.actividad.capacidadMaxima || 0;

      if (capacidad > 0) {
        const ocupacion = Math.round((participantesActivos / capacidad) * 100);
        totalOcupacion += ocupacion;
        seccionesConCapacidad++;

        if (participantesActivos >= capacidad) {
          seccionesLlenas++;
        } else {
          seccionesDisponibles++;
        }

        detalle.push({
          seccionId: seccion.id,
          actividad: seccion.actividad.nombre,
          seccion: seccion.nombre,
          ocupacion,
          participantes: participantesActivos,
          capacidad
        });
      }
    }

    const ocupacionPromedio = seccionesConCapacidad > 0
      ? Math.round(totalOcupacion / seccionesConCapacidad)
      : 0;

    return {
      totalSecciones: secciones.length,
      ocupacionPromedio,
      seccionesLlenas,
      seccionesDisponibles,
      detalle: detalle.sort((a, b) => b.ocupacion - a.ocupacion)
    };
  }

  /**
   * Obtener secciones por actividad
   */
  async getSeccionesByActividad(actividadId: string) {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id: actividadId }
    });

    if (!actividad) {
      throw new Error('Actividad no encontrada');
    }

    return this.repository.findSeccionesByActividad(actividadId);
  }
}
