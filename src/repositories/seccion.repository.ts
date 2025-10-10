import { PrismaClient, Prisma, DiaSemana } from '@prisma/client';
import {
  CreateSeccionDto,
  UpdateSeccionDto,
  CreateHorarioSeccionDto,
  UpdateHorarioSeccionDto,
  CreateParticipacionSeccionDto,
  UpdateParticipacionSeccionDto,
  CreateReservaAulaSeccionDto,
  UpdateReservaAulaSeccionDto,
  QuerySeccionesDto
} from '@/dto/seccion.dto';
import {
  SeccionConHorarios,
  SeccionDetallada,
  PaginationParams
} from '@/types/interfaces';

export class SeccionRepository {
  constructor(private prisma: PrismaClient) {}

  // ============================================================================
  // CRUD BÁSICO DE SECCIONES
  // ============================================================================

  /**
   * Crear una nueva sección de actividad
   */
  async create(data: CreateSeccionDto): Promise<SeccionConHorarios> {
    const { horarios, docenteIds, reservasAulas, ...seccionData } = data;

    return this.prisma.seccionActividad.create({
      data: {
        ...seccionData,
        horarios: horarios && horarios.length > 0 ? {
          createMany: {
            data: horarios
          }
        } : undefined,
        docentes: docenteIds && docenteIds.length > 0 ? {
          connect: docenteIds.map(id => ({ id }))
        } : undefined
        // Las reservas de aulas se crean después, requieren validación adicional
      },
      include: {
        horarios: {
          orderBy: [
            { diaSemana: 'asc' },
            { horaInicio: 'asc' }
          ]
        },
        docentes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        },
        actividad: true,
        _count: {
          select: {
            participaciones: true,
            reservasAula: true
          }
        }
      }
    });
  }

  /**
   * Buscar sección por ID
   */
  async findById(id: string): Promise<SeccionConHorarios | null> {
    return this.prisma.seccionActividad.findUnique({
      where: { id },
      include: {
        horarios: {
          where: { activo: true },
          orderBy: [
            { diaSemana: 'asc' },
            { horaInicio: 'asc' }
          ]
        },
        docentes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        },
        actividad: true,
        _count: {
          select: {
            participaciones: true,
            reservasAula: true
          }
        }
      }
    });
  }

  /**
   * Obtener sección detallada con todas las relaciones
   */
  async findByIdDetallada(id: string): Promise<SeccionDetallada | null> {
    return this.prisma.seccionActividad.findUnique({
      where: { id },
      include: {
        horarios: {
          orderBy: [
            { diaSemana: 'asc' },
            { horaInicio: 'asc' }
          ]
        },
        docentes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            especialidad: true
          }
        },
        actividad: true,
        participaciones: {
          include: {
            persona: {
              select: {
                id: true,
                tipo: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true
              }
            }
          }
        },
        reservasAula: {
          include: {
            aula: {
              select: {
                id: true,
                nombre: true,
                capacidad: true,
                ubicacion: true
              }
            }
          }
        },
        _count: {
          select: {
            participaciones: true,
            horarios: true,
            reservasAula: true
          }
        }
      }
    });
  }

  /**
   * Listar secciones con filtros y paginación
   */
  async findAll(
    filters: QuerySeccionesDto,
    pagination: PaginationParams
  ): Promise<{ secciones: SeccionConHorarios[]; total: number }> {
    const where: Prisma.SeccionActividadWhereInput = {
      ...(filters.actividadId && { actividadId: filters.actividadId }),
      ...(filters.activa !== undefined && { activa: filters.activa }),
      ...(filters.search && {
        OR: [
          { nombre: { contains: filters.search, mode: 'insensitive' } },
          { codigo: { contains: filters.search, mode: 'insensitive' } },
          { actividad: { nombre: { contains: filters.search, mode: 'insensitive' } } }
        ]
      })
    };

    const [secciones, total] = await Promise.all([
      this.prisma.seccionActividad.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        include: {
          horarios: {
            where: { activo: true },
            orderBy: [
              { diaSemana: 'asc' },
              { horaInicio: 'asc' }
            ]
          },
          docentes: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              especialidad: true
            }
          },
          actividad: true,
          _count: {
            select: {
              participaciones: true,
              reservasAula: true
            }
          }
        },
        orderBy: [
          { activa: 'desc' },
          { actividad: { nombre: 'asc' } },
          { nombre: 'asc' }
        ]
      }),
      this.prisma.seccionActividad.count({ where })
    ]);

    return { secciones, total };
  }

  /**
   * Actualizar sección
   */
  async update(id: string, data: UpdateSeccionDto): Promise<SeccionConHorarios> {
    return this.prisma.seccionActividad.update({
      where: { id },
      data,
      include: {
        horarios: {
          orderBy: [
            { diaSemana: 'asc' },
            { horaInicio: 'asc' }
          ]
        },
        docentes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        },
        actividad: true,
        _count: {
          select: {
            participaciones: true,
            reservasAula: true
          }
        }
      }
    });
  }

  /**
   * Eliminar sección (cascade a horarios, participaciones, reservas)
   */
  async delete(id: string): Promise<void> {
    await this.prisma.seccionActividad.delete({
      where: { id }
    });
  }

  // ============================================================================
  // GESTIÓN DE HORARIOS DE SECCIÓN
  // ============================================================================

  /**
   * Agregar horario a sección
   */
  async addHorario(data: CreateHorarioSeccionDto) {
    return this.prisma.horarioSeccion.create({
      data
    });
  }

  /**
   * Buscar horario por ID
   */
  async findHorarioById(id: string) {
    return this.prisma.horarioSeccion.findUnique({
      where: { id },
      include: {
        seccion: {
          include: {
            actividad: true
          }
        }
      }
    });
  }

  /**
   * Actualizar horario de sección
   */
  async updateHorario(id: string, data: UpdateHorarioSeccionDto) {
    return this.prisma.horarioSeccion.update({
      where: { id },
      data
    });
  }

  /**
   * Eliminar horario de sección
   */
  async deleteHorario(id: string): Promise<void> {
    await this.prisma.horarioSeccion.delete({
      where: { id }
    });
  }

  /**
   * Listar horarios de una sección
   */
  async findHorariosBySeccion(seccionId: string) {
    return this.prisma.horarioSeccion.findMany({
      where: { seccionId },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' }
      ]
    });
  }

  // ============================================================================
  // GESTIÓN DE DOCENTES
  // ============================================================================

  /**
   * Asignar docente a sección
   */
  async addDocente(seccionId: string, docenteId: string) {
    return this.prisma.seccionActividad.update({
      where: { id: seccionId },
      data: {
        docentes: {
          connect: { id: docenteId }
        }
      },
      include: {
        docentes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        },
        horarios: true
      }
    });
  }

  /**
   * Remover docente de sección
   */
  async removeDocente(seccionId: string, docenteId: string) {
    return this.prisma.seccionActividad.update({
      where: { id: seccionId },
      data: {
        docentes: {
          disconnect: { id: docenteId }
        }
      },
      include: {
        docentes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        }
      }
    });
  }

  // ============================================================================
  // GESTIÓN DE PARTICIPACIONES
  // ============================================================================

  /**
   * Crear participación en sección
   */
  async createParticipacion(data: CreateParticipacionSeccionDto) {
    return this.prisma.participacionSeccion.create({
      data,
      include: {
        persona: {
          select: {
            id: true,
            tipo: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        seccion: {
          include: {
            actividad: true,
            horarios: true
          }
        }
      }
    });
  }

  /**
   * Buscar participación por ID
   */
  async findParticipacionById(id: string) {
    return this.prisma.participacionSeccion.findUnique({
      where: { id },
      include: {
        persona: true,
        seccion: {
          include: {
            actividad: true,
            horarios: true
          }
        }
      }
    });
  }

  /**
   * Verificar si persona ya está inscrita en sección
   */
  async findParticipacionByPersonaSeccion(personaId: string, seccionId: string) {
    return this.prisma.participacionSeccion.findUnique({
      where: {
        personaId_seccionId: {
          personaId,
          seccionId
        }
      }
    });
  }

  /**
   * Listar participaciones de una sección
   */
  async findParticipacionesBySeccion(seccionId: string, soloActivas: boolean = true) {
    return this.prisma.participacionSeccion.findMany({
      where: {
        seccionId,
        ...(soloActivas && { activa: true })
      },
      include: {
        persona: {
          select: {
            id: true,
            tipo: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true
          }
        }
      },
      orderBy: [
        { persona: { apellido: 'asc' } },
        { persona: { nombre: 'asc' } }
      ]
    });
  }

  /**
   * Listar participaciones de una persona
   */
  async findParticipacionesByPersona(personaId: string, soloActivas: boolean = true) {
    return this.prisma.participacionSeccion.findMany({
      where: {
        personaId,
        ...(soloActivas && { activa: true })
      },
      include: {
        seccion: {
          include: {
            actividad: true,
            horarios: {
              where: { activo: true },
              orderBy: [
                { diaSemana: 'asc' },
                { horaInicio: 'asc' }
              ]
            }
          }
        }
      },
      orderBy: {
        fechaInicio: 'desc'
      }
    });
  }

  /**
   * Actualizar participación
   */
  async updateParticipacion(id: string, data: UpdateParticipacionSeccionDto) {
    return this.prisma.participacionSeccion.update({
      where: { id },
      data,
      include: {
        persona: true,
        seccion: {
          include: {
            actividad: true
          }
        }
      }
    });
  }

  /**
   * Dar de baja participación (soft delete)
   */
  async bajaParticipacion(id: string, fechaFin?: Date) {
    return this.prisma.participacionSeccion.update({
      where: { id },
      data: {
        activa: false,
        fechaFin: fechaFin || new Date()
      }
    });
  }

  /**
   * Eliminar participación (hard delete)
   */
  async deleteParticipacion(id: string): Promise<void> {
    await this.prisma.participacionSeccion.delete({
      where: { id }
    });
  }

  // ============================================================================
  // GESTIÓN DE RESERVAS DE AULAS
  // ============================================================================

  /**
   * Crear reserva de aula para sección
   */
  async createReservaAula(data: CreateReservaAulaSeccionDto) {
    return this.prisma.reservaAulaSeccion.create({
      data,
      include: {
        seccion: {
          include: {
            actividad: true
          }
        },
        aula: true
      }
    });
  }

  /**
   * Buscar reserva por ID
   */
  async findReservaAulaById(id: string) {
    return this.prisma.reservaAulaSeccion.findUnique({
      where: { id },
      include: {
        seccion: {
          include: {
            actividad: true,
            docentes: true
          }
        },
        aula: true
      }
    });
  }

  /**
   * Listar reservas de una sección
   */
  async findReservasAulaBySeccion(seccionId: string) {
    return this.prisma.reservaAulaSeccion.findMany({
      where: { seccionId },
      include: {
        aula: true
      },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' }
      ]
    });
  }

  /**
   * Actualizar reserva de aula
   */
  async updateReservaAula(id: string, data: UpdateReservaAulaSeccionDto) {
    return this.prisma.reservaAulaSeccion.update({
      where: { id },
      data,
      include: {
        seccion: {
          include: {
            actividad: true
          }
        },
        aula: true
      }
    });
  }

  /**
   * Eliminar reserva de aula
   */
  async deleteReservaAula(id: string): Promise<void> {
    await this.prisma.reservaAulaSeccion.delete({
      where: { id }
    });
  }

  // ============================================================================
  // VALIDACIÓN DE CONFLICTOS
  // ============================================================================

  /**
   * Verificar si un docente tiene conflicto de horarios
   */
  async verificarConflictoDocente(
    docenteId: string,
    diaSemana: DiaSemana,
    horaInicio: string,
    horaFin: string,
    excluirSeccionId?: string
  ): Promise<any[]> {
    // Convertir horarios a minutos para comparación
    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [finHora, finMin] = horaFin.split(':').map(Number);
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const finMinutos = finHora * 60 + finMin;

    // Buscar todas las secciones del docente en ese día
    const secciones = await this.prisma.seccionActividad.findMany({
      where: {
        docentes: {
          some: {
            id: docenteId
          }
        },
        activa: true,
        ...(excluirSeccionId && { id: { not: excluirSeccionId } }),
        horarios: {
          some: {
            diaSemana,
            activo: true
          }
        }
      },
      include: {
        actividad: true,
        horarios: {
          where: {
            diaSemana,
            activo: true
          }
        }
      }
    });

    // Filtrar secciones con solapamiento de horarios
    const conflictos = secciones.filter(seccion => {
      return seccion.horarios.some(horario => {
        const [horInicioHora, horInicioMin] = horario.horaInicio.split(':').map(Number);
        const [horFinHora, horFinMin] = horario.horaFin.split(':').map(Number);
        const horInicioMinutos = horInicioHora * 60 + horInicioMin;
        const horFinMinutos = horFinHora * 60 + horFinMin;

        // Hay solapamiento si:
        // - El nuevo horario empieza antes de que termine el existente Y
        // - El nuevo horario termina después de que empiece el existente
        return inicioMinutos < horFinMinutos && finMinutos > horInicioMinutos;
      });
    });

    return conflictos;
  }

  /**
   * Verificar si un aula tiene conflicto de reservas
   */
  async verificarConflictoAula(
    aulaId: string,
    diaSemana: DiaSemana,
    horaInicio: string,
    horaFin: string,
    excluirSeccionId?: string
  ): Promise<any[]> {
    // Convertir horarios a minutos
    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [finHora, finMin] = horaFin.split(':').map(Number);
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const finMinutos = finHora * 60 + finMin;

    // Buscar todas las reservas del aula en ese día
    const reservas = await this.prisma.reservaAulaSeccion.findMany({
      where: {
        aulaId,
        diaSemana,
        ...(excluirSeccionId && { seccionId: { not: excluirSeccionId } }),
        // Solo reservas vigentes
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: new Date() } }
        ]
      },
      include: {
        seccion: {
          include: {
            actividad: true,
            docentes: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        },
        aula: true
      }
    });

    // Filtrar reservas con solapamiento
    const conflictos = reservas.filter(reserva => {
      const [resInicioHora, resInicioMin] = reserva.horaInicio.split(':').map(Number);
      const [resFinHora, resFinMin] = reserva.horaFin.split(':').map(Number);
      const resInicioMinutos = resInicioHora * 60 + resInicioMin;
      const resFinMinutos = resFinHora * 60 + resFinMin;

      return inicioMinutos < resFinMinutos && finMinutos > resInicioMinutos;
    });

    return conflictos;
  }

  // ============================================================================
  // ESTADÍSTICAS Y REPORTES
  // ============================================================================

  /**
   * Contar participantes activos de una sección
   */
  async contarParticipantesActivos(seccionId: string): Promise<number> {
    return this.prisma.participacionSeccion.count({
      where: {
        seccionId,
        activa: true
      }
    });
  }

  /**
   * Obtener secciones por actividad
   */
  async findSeccionesByActividad(actividadId: string) {
    return this.prisma.seccionActividad.findMany({
      where: { actividadId },
      include: {
        horarios: {
          where: { activo: true },
          orderBy: [
            { diaSemana: 'asc' },
            { horaInicio: 'asc' }
          ]
        },
        docentes: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        _count: {
          select: {
            participaciones: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }

  /**
   * Obtener secciones por docente
   */
  async findSeccionesByDocente(docenteId: string) {
    return this.prisma.seccionActividad.findMany({
      where: {
        docentes: {
          some: {
            id: docenteId
          }
        },
        activa: true
      },
      include: {
        actividad: true,
        horarios: {
          where: { activo: true },
          orderBy: [
            { diaSemana: 'asc' },
            { horaInicio: 'asc' }
          ]
        },
        _count: {
          select: {
            participaciones: true
          }
        }
      },
      orderBy: [
        { actividad: { nombre: 'asc' } },
        { nombre: 'asc' }
      ]
    });
  }

  /**
   * Obtener secciones por día de la semana
   */
  async findSeccionesByDia(diaSemana: DiaSemana) {
    return this.prisma.seccionActividad.findMany({
      where: {
        activa: true,
        horarios: {
          some: {
            diaSemana,
            activo: true
          }
        }
      },
      include: {
        actividad: true,
        horarios: {
          where: {
            diaSemana,
            activo: true
          },
          orderBy: {
            horaInicio: 'asc'
          }
        },
        docentes: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        _count: {
          select: {
            participaciones: true
          }
        }
      },
      orderBy: {
        horarios: {
          _count: 'asc'
        }
      }
    });
  }
}
