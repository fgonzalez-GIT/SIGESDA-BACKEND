import { PrismaClient } from '@prisma/client';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
import { timeStringToDateTime } from '@/utils/time.utils';

/**
 * Repository para manejo de Actividades V2.0
 * Usa FK a tablas catálogo (tipos_actividades, categorias_actividades, estados_actividades, dias_semana)
 */
export class ActividadRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crea una nueva actividad con horarios, docentes y reservas opcionales
   */
  async create(data: CreateActividadDto) {
    const { horarios, docentes, reservasAulas, ...actividadData } = data;

    return this.prisma.actividades.create({
      data: {
        codigoActividad: actividadData.codigoActividad,
        nombre: actividadData.nombre,
        tipoActividadId: actividadData.tipoActividadId,
        categoriaId: actividadData.categoriaId,
        estadoId: actividadData.estadoId,
        descripcion: actividadData.descripcion ?? undefined,
        fechaDesde: actividadData.fechaDesde,
        fechaHasta: actividadData.fechaHasta ?? undefined,
        capacidadMaxima: actividadData.cupoMaximo ?? undefined,
        costo: actividadData.costo ?? 0,
        activa: true,
        observaciones: actividadData.observaciones ?? undefined,

        // Crear horarios inline
        horarios_actividades: horarios && horarios.length > 0 ? {
          create: horarios.map(h => ({
            diaSemanaId: h.diaSemanaId,
            horaInicio: timeStringToDateTime(h.horaInicio),
            horaFin: timeStringToDateTime(h.horaFin),
            activo: h.activo
          }))
        } : undefined,

        // Crear asignaciones de docentes inline
        docentes_actividades: docentes && docentes.length > 0 ? {
          create: docentes.map(d => ({
            personas: { connect: { id: d.docenteId } },
            rolesDocentes: { connect: { id: d.rolDocenteId } },
            observaciones: d.observaciones ?? undefined,
            activo: true
          }))
        } : undefined
      },
      include: {
        horarios_actividades: {
          orderBy: [
            { diaSemana: { orden: 'asc' } },
            { horaInicio: 'asc' }
          ],
          include: {
            diaSemana: true
          }
        },
        docentes_actividades: {
          include: {
            personas: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true
              }
            },
            rolesDocentes: true
          },
          where: { activo: true }
        }
      }
    });
  }

  /**
   * Busca todas las actividades con filtros opcionales
   */
  async findAll(query: QueryActividadesDto) {
    const where: any = {};

    // Filtros por FK a catálogos (ahora habilitados)
    if (query.tipoActividadId) {
      where.tipoActividadId = query.tipoActividadId;
    }

    if (query.categoriaId) {
      where.categoriaId = query.categoriaId;
    }

    if (query.estadoId) {
      where.estadoId = query.estadoId;
    }

    // Filtro por día de semana (ahora usa FK)
    if (query.diaSemanaId) {
      where.horarios_actividades = {
        some: {
          diaSemanaId: query.diaSemanaId,
          activo: true
        }
      };
    }

    // Filtro por docente
    if (query.docenteId) {
      where.docentes_actividades = {
        some: {
          docenteId: query.docenteId,
          activo: true
        }
      };
    }

    // Filtro por aula
    if (query.aulaId) {
      where.horarios_actividades = {
        ...where.horarios_actividades,
        some: {
          ...(where.horarios_actividades?.some || {}),
          reservas_aulas_actividades: {
            some: {
              aulaId: query.aulaId
            }
          }
        }
      };
    }

    // Filtro por rango de costo
    if (query.costoDesde !== undefined || query.costoHasta !== undefined) {
      where.costo = {};
      if (query.costoDesde !== undefined) {
        where.costo.gte = query.costoDesde;
      }
      if (query.costoHasta !== undefined) {
        where.costo.lte = query.costoHasta;
      }
    }

    // Búsqueda de texto
    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
        { codigoActividad: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    // Filtro por vigencia
    if (query.vigentes) {
      const hoy = new Date();
      where.fechaDesde = { lte: hoy };
      where.OR = [
        { fechaHasta: null },
        { fechaHasta: { gte: hoy } }
      ];
    }

    const skip = (query.page - 1) * query.limit;

    // Configurar ordering
    const orderBy: any = {};
    if (query.orderBy === 'codigo') {
      orderBy.codigoActividad = query.orderDir;
    } else if (query.orderBy === 'fechaDesde') {
      orderBy.fechaDesde = query.orderDir;
    } else if (query.orderBy === 'cupoMaximo') {
      orderBy.capacidadMaxima = query.orderDir;
    } else if (query.orderBy === 'created_at') {
      orderBy.createdAt = query.orderDir;
    } else {
      orderBy.nombre = query.orderDir;
    }

    const [data, total] = await Promise.all([
      this.prisma.actividades.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: query.incluirRelaciones ? {
          tipoActividad: true,
          categoria: true,
          estado: true,
          horarios_actividades: {
            orderBy: [
              { diaSemanaId: 'asc' },
              { horaInicio: 'asc' }
            ],
            where: { activo: true },
            include: {
              diaSemana: true
            }
          },
          docentes_actividades: {
            include: {
              personas: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  tipos: {
                    where: { activo: true },
                    include: { tipoPersona: true, especialidad: true }
                  }
                }
              },
              rolesDocentes: true
            },
            where: { activo: true }
          },
          _count: {
            select: {
              participacion_actividades: {
                where: { activa: true }
              }
            }
          }
        } : undefined
      }),
      this.prisma.actividades.count({ where })
    ]);

    // Si hay filtro de cupo disponible, filtrar en memoria
    if (query.conCupo) {
      const dataConCupo = data.filter(act => {
        if (!act.capacidadMaxima) return true; // Sin límite = siempre disponible
        const inscritos = (act as any)._count?.participacion_actividades || 0;
        return inscritos < act.capacidadMaxima;
      });
      return {
        data: dataConCupo,
        total: dataConCupo.length
      };
    }

    return { data, total };
  }

  /**
   * Busca una actividad por ID con todas sus relaciones
   */
  async findById(id: number) {
    return this.prisma.actividades.findUnique({
      where: { id },
      include: {
        horarios_actividades: {
          orderBy: [
            { diaSemana: { orden: 'asc' } },
            { horaInicio: 'asc' }
          ],
          include: {
            diaSemana: true
          }
        },
        docentes_actividades: {
          include: {
            personas: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true,
                tipos: {
                  where: { activo: true },
                  include: {
                    tipoPersona: true,
                    especialidad: true
                  }
                }
              }
            },
            rolesDocentes: true
          },
          where: { activo: true }
        },
        participacion_actividades: {
          include: {
            personas: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true,
                tipos: {
                  where: { activo: true },
                  include: {
                    tipoPersona: true
                  }
                }
              }
            }
          },
          where: { activa: true }
        },
        _count: {
          select: {
            participacion_actividades: {
              where: { activa: true }
            }
          }
        }
      }
    });
  }

  /**
   * Busca una actividad por código
   */
  async findByCodigoActividad(codigo: string) {
    return this.prisma.actividades.findUnique({
      where: { codigoActividad: codigo },
      include: {
        tipoActividad: true,
        categoria: true,
        estado: true,
        horarios_actividades: {
          where: { activo: true },
          include: { diaSemana: true }
        },
        docentes_actividades: {
          where: { activo: true },
          include: {
            personas: true,
            rolesDocentes: true
          }
        }
      }
    });
  }

  /**
   * Actualiza una actividad (sin tocar horarios/docentes)
   */
  async update(id: number, data: UpdateActividadDto) {
    const updateData: any = {};

    // Mapear todos los campos disponibles
    if (data.codigoActividad) updateData.codigoActividad = data.codigoActividad;
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.tipoActividadId) updateData.tipoActividadId = data.tipoActividadId;
    if (data.categoriaId) updateData.categoriaId = data.categoriaId;
    if (data.estadoId) updateData.estadoId = data.estadoId;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.cupoMaximo !== undefined) updateData.capacidadMaxima = data.cupoMaximo;
    if (data.fechaDesde) updateData.fechaDesde = data.fechaDesde;
    if (data.fechaHasta !== undefined) updateData.fechaHasta = data.fechaHasta;
    if (data.costo !== undefined) updateData.costo = data.costo;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;

    return this.prisma.actividades.update({
      where: { id },
      data: updateData,
      include: {
        tipoActividad: true,
        categoria: true,
        estado: true,
        horarios_actividades: {
          orderBy: [
            { diaSemanaId: 'asc' },
            { horaInicio: 'asc' }
          ],
          include: { diaSemana: true }
        },
        docentes_actividades: {
          include: {
            personas: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                tipos: {
                  where: { activo: true },
                  include: { tipoPersona: true, especialidad: true }
                }
              }
            },
            rolesDocentes: true
          },
          where: { activo: true }
        }
      }
    });
  }

  /**
   * Elimina una actividad (hard delete)
   */
  async delete(id: number) {
    return this.prisma.actividades.delete({
      where: { id }
    });
  }

  /**
   * Cambia el estado de una actividad
   */
  async cambiarEstado(id: number, nuevoEstadoId: number, observaciones?: string) {
    const updateData: any = {
      estadoId: nuevoEstadoId
    };

    if (observaciones !== undefined) {
      updateData.observaciones = observaciones;
    }

    return this.prisma.actividades.update({
      where: { id },
      data: updateData,
      include: {
        estado: true,
        tipoActividad: true,
        categoria: true
      }
    });
  }

  // ==================== HORARIOS ====================

  /**
   * Agrega un horario a una actividad
   */
  async agregarHorario(actividadId: number, horarioData: any) {
    return this.prisma.horarios_actividades.create({
      data: {
        actividadId,
        diaSemanaId: horarioData.diaSemanaId,
        horaInicio: timeStringToDateTime(horarioData.horaInicio),
        horaFin: timeStringToDateTime(horarioData.horaFin),
        activo: horarioData.activo !== false
      },
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true
          }
        }
      }
    });
  }

  /**
   * Actualiza un horario
   */
  async updateHorario(horarioId: number, horarioData: any) {
    const updateData: any = {};

    if (horarioData.diaSemanaId) updateData.diaSemanaId = horarioData.diaSemanaId;
    if (horarioData.horaInicio) updateData.horaInicio = timeStringToDateTime(horarioData.horaInicio);
    if (horarioData.horaFin) updateData.horaFin = timeStringToDateTime(horarioData.horaFin);
    if (horarioData.activo !== undefined) updateData.activo = horarioData.activo;

    return this.prisma.horarios_actividades.update({
      where: { id: horarioId },
      data: updateData,
      include: {
        // diasSemana eliminado (relación no existe - es ENUM)
        actividades: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });
  }

  /**
   * Elimina un horario
   */
  async deleteHorario(horarioId: number) {
    return this.prisma.horarios_actividades.delete({
      where: { id: horarioId }
    });
  }

  /**
   * Elimina todos los horarios de una actividad
   */
  async deleteHorariosByActividad(actividadId: number) {
    return this.prisma.horarios_actividades.deleteMany({
      where: { actividadId }
    });
  }

  /**
   * Obtiene todos los horarios de una actividad
   */
  async getHorariosByActividad(actividadId: number) {
    return this.prisma.horarios_actividades.findMany({
      where: { actividadId },
      include: {
        diaSemana: true
      },
      orderBy: [
        { diaSemanaId: 'asc' },
        { horaInicio: 'asc' }
      ]
    });
  }

  async findHorarioById(horarioId: number) {
    return this.prisma.horarios_actividades.findUnique({
      where: { id: horarioId },
      include: {
        // diasSemana eliminado (relación no existe - es ENUM)
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true
          }
        }
      }
    });
  }

  // ==================== DOCENTES ====================

  /**
   * Busca una asignación de docente existente
   */
  async findAsignacionDocente(actividadId: number, docenteId: number, rolDocenteId: number) {
    return this.prisma.docentes_actividades.findFirst({
      where: {
        actividadId,
        docenteId,
        rolDocenteId,
        activo: true
      },
      include: {
        rolesDocentes: true
      }
    });
  }

  /**
   * Asigna un docente a una actividad
   */
  async asignarDocente(actividadId: number, docenteId: number, rolDocenteId: number, observaciones?: string) {
    return this.prisma.docentes_actividades.create({
      data: {
        actividades: { connect: { id: actividadId } },
        personas: { connect: { id: docenteId } },
        rolesDocentes: { connect: { id: rolDocenteId } },
        observaciones,
        activo: true
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            tipos: {
              where: { activo: true },
              include: { tipoPersona: true, especialidad: true }
            }
          }
        },
        rolesDocentes: true,
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true
          }
        }
      }
    });
  }

  /**
   * Desasigna un docente de una actividad (soft delete)
   */
  async desasignarDocente(actividadId: number, docenteId: number, rolDocenteId: number) {
    // Buscar la asignación activa
    const asignacion = await this.prisma.docentes_actividades.findFirst({
      where: {
        actividadId,
        docenteId,
        rolDocenteId,
        activo: true
      }
    });

    if (!asignacion) {
      throw new Error('Asignación de docente no encontrada');
    }

    return this.prisma.docentes_actividades.update({
      where: { id: asignacion.id },
      data: {
        activo: false,
        fechaDesasignacion: new Date()
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        rolesDocentes: true
      }
    });
  }

  /**
   * Desasigna un docente usando el ID de la asignación
   */
  async desasignarDocenteById(asignacionId: number) {
    const asignacion = await this.prisma.docentes_actividades.findUnique({
      where: { id: asignacionId }
    });

    if (!asignacion) {
      throw new Error('Asignación de docente no encontrada');
    }

    return this.prisma.docentes_actividades.update({
      where: { id: asignacionId },
      data: {
        activo: false,
        fechaDesasignacion: new Date()
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        rolesDocentes: true,
        actividades: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });
  }

  /**
   * Obtiene docentes de una actividad
   */
  async getDocentesByActividad(actividadId: number) {
    return this.prisma.docentes_actividades.findMany({
      where: {
        actividadId,
        activo: true
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            tipos: {
              where: { activo: true },
              include: { tipoPersona: true, especialidad: true }
            }
          }
        },
        rolesDocentes: true
      }
    });
  }

  /**
   * Obtiene docentes disponibles (todos los de tipo DOCENTE activos)
   * ACTUALIZADO: Compatible con arquitectura persona_tipo V2
   */
  async getDocentesDisponibles() {
    // Obtener personas que tienen tipo DOCENTE activo
    const docentes = await this.prisma.persona.findMany({
      where: {
        tipos: {
          some: {
            tipoPersona: {
              codigo: 'DOCENTE'
            },
            activo: true,
            fechaBaja: null
          }
        }
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        tipos: {
          where: {
            tipoPersona: {
              codigo: 'DOCENTE'
            },
            activo: true
          },
          include: {
            especialidad: {
              select: {
                id: true,
                codigo: true,
                nombre: true
              }
            }
          }
        }
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });

    // Transformar respuesta para mantener compatibilidad con API existente
    return docentes.map(docente => ({
      id: docente.id,
      nombre: docente.nombre,
      apellido: docente.apellido,
      email: docente.email,
      telefono: docente.telefono,
      especialidad: docente.tipos[0]?.especialidad?.nombre || null,
      especialidadId: docente.tipos[0]?.especialidad?.id || null,
      especialidadCodigo: docente.tipos[0]?.especialidad?.codigo || null,
      honorariosPorHora: docente.tipos[0]?.honorariosPorHora || null
    }));
  }

  /**
   * Valida que una persona tenga el tipo DOCENTE activo
   * NUEVO: Compatible con arquitectura persona_tipo V2
   */
  async validarDocente(docenteId: number) {
    const persona = await this.prisma.persona.findUnique({
      where: { id: docenteId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        tipos: {
          where: {
            tipoPersona: {
              codigo: 'DOCENTE'
            },
            activo: true,
            fechaBaja: null
          },
          select: {
            id: true,
            activo: true,
            fechaBaja: true
          }
        }
      }
    });

    if (!persona) {
      return null;
    }

    return {
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido,
      esDocenteActivo: persona.tipos.length > 0
    };
  }

  // ==================== PARTICIPACIONES ====================

  /**
   * Obtiene participantes de una actividad
   */
  async getParticipantes(actividadId: number) {
    return this.prisma.participacion_actividades.findMany({
      where: {
        actividadId: actividadId,
        activa: true
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            tipos: {
              where: { activo: true },
              include: { tipoPersona: true, categoria: true }
            }
          }
        }
      },
      orderBy: [
        { personas: { apellido: 'asc' } },
        { personas: { nombre: 'asc' } }
      ]
    });
  }

  /**
   * Busca una participación existente por persona y actividad
   */
  async findParticipacionByPersonaAndActividad(
    actividadId: number,
    personaId: number
  ) {
    return this.prisma.participacion_actividades.findFirst({
      where: {
        actividadId: actividadId,
        personaId: personaId
      },
      select: {
        id: true,
        activa: true,
        fechaInicio: true,
        fechaFin: true
      }
    });
  }

  /**
   * Inscribe un participante en una actividad
   * VALIDACIÓN DE CUPO: Verifica capacidad antes de inscribir
   */
  async addParticipante(
    actividadId: number,
    personaId: number,
    fechaInicio: string,
    observaciones?: string
  ) {
    // 1. Verificar que la actividad existe y obtener su cupo máximo
    const actividad = await this.prisma.actividades.findUnique({
      where: { id: actividadId },
      select: {
        id: true,
        nombre: true,
        capacidadMaxima: true
      }
    });

    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    // 2. Si la actividad tiene cupo máximo, validar disponibilidad
    if (actividad.capacidadMaxima !== null && actividad.capacidadMaxima !== undefined) {
      const participantesActivos = await this.prisma.participacion_actividades.count({
        where: {
          actividadId: actividadId,
          activa: true
        }
      });

      if (participantesActivos >= actividad.capacidadMaxima) {
        throw new Error(
          `No se puede inscribir: La actividad "${actividad.nombre}" ha alcanzado su capacidad máxima de ${actividad.capacidadMaxima} participantes (actualmente: ${participantesActivos} inscriptos)`
        );
      }
    }

    // 3. Verificar que no existe participación activa duplicada
    const participacionExistente = await this.findParticipacionByPersonaAndActividad(
      actividadId,
      personaId
    );

    if (participacionExistente && participacionExistente.activo) {
      throw new Error(
        `La persona ya está inscripta activamente en la actividad "${actividad.nombre}"`
      );
    }

    // 4. Crear la participación
    return this.prisma.participacion_actividades.create({
      data: {
        actividadId: actividadId,
        personaId: personaId,
        fechaInicio: new Date(fechaInicio),
        observaciones: observaciones || null,
        activa: true
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            tipos: {
              where: { activo: true },
              include: { tipoPersona: true }
            }
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true
          }
        }
      }
    });
  }

  /**
   * Elimina (soft delete) un participante de una actividad
   */
  async deleteParticipante(
    actividadId: number,
    participanteId: number
  ) {
    return this.prisma.participacion_actividades.update({
      where: {
        id: participanteId
      },
      data: {
        activa: false,
        fechaFin: new Date()
      }
    });
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtiene estadísticas de una actividad
   */
  async getEstadisticas(actividadId: number) {
    const actividad = await this.prisma.actividades.findUnique({
      where: { id: actividadId },
      include: {
        _count: {
          select: {
            participacion_actividades: {
              where: { activa: true }
            },
            horarios_actividades: {
              where: { activo: true }
            },
            docentes_actividades: {
              where: { activo: true }
            }
          }
        }
      }
    });

    if (!actividad) return null;

    const participantesActivos = actividad._count.participacion_actividades;
    const porcentajeOcupacion = actividad.capacidadMaxima
      ? Math.round((participantesActivos / actividad.capacidadMaxima) * 100)
      : null;

    return {
      totalParticipantes: participantesActivos,
      totalHorarios: actividad._count.horarios_actividades,
      totalDocentes: actividad._count.docentes_actividades,
      cupoMaximo: actividad.capacidadMaxima,
      cupoDisponible: actividad.capacidadMaxima ? actividad.capacidadMaxima - participantesActivos : null,
      porcentajeOcupacion,
      estaLlena: actividad.capacidadMaxima ? participantesActivos >= actividad.capacidadMaxima : false
    };
  }

  // ==================== CATÁLOGOS ====================

  /**
   * Obtiene todos los tipos de actividades desde la base de datos
   */
  async getTiposActividades() {
    return this.prisma.tipos_actividades.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtiene todas las categorías de actividades desde la base de datos
   */
  async getCategoriasActividades() {
    return this.prisma.categorias_actividades.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtiene todos los estados de actividades desde la base de datos
   */
  async getEstadosActividades() {
    return this.prisma.estados_actividades.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtiene todos los días de la semana desde la base de datos
   */
  async getDiasSemana() {
    return this.prisma.dias_semana.findMany({
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtiene todos los roles de docentes desde la base de datos
   */
  async getRolesDocentes() {
    return this.prisma.roles_docentes.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    });
  }

  // ==================== UTILIDADES ====================

  /**
   * Convierte string de hora "HH:MM" o "HH:MM:SS" a Date para PostgreSQL TIME
   */
  private parseTimeToDate(time: string): Date {
    // PostgreSQL TIME requiere un Date completo, pero solo usa la parte de hora
    // Usamos UTC para evitar problemas con zonas horarias
    const [hours, minutes, seconds = '00'] = time.split(':');
    const date = new Date();
    date.setUTCHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
    return date;
  }

  /**
   * Extrae el time de un Date (formato HH:MM:SS)
   */
  static formatTime(date: Date): string {
    return date.toISOString().substring(11, 19); // HH:MM:SS
  }

  /**
   * Convierte minutos a formato HH:MM
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Convierte HH:MM a minutos
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
