import { PrismaClient } from '@prisma/client';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';

/**
 * Repository para manejo de Actividades V2.0
 * Basado en el nuevo modelo con tablas de catálogos e IDs SERIAL
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
        codigo_actividad: actividadData.codigoActividad,
        nombre: actividadData.nombre,
        tipo_actividad_id: actividadData.tipoActividadId,
        categoria_id: actividadData.categoriaId,
        estado_id: actividadData.estadoId,
        descripcion: actividadData.descripcion ?? undefined,
        fecha_desde: new Date(actividadData.fechaDesde),
        fecha_hasta: actividadData.fechaHasta ? new Date(actividadData.fechaHasta) : undefined,
        capacidadMaxima: actividadData.cupoMaximo ?? undefined,
        costo: actividadData.costo,
        observaciones: actividadData.observaciones ?? undefined,

        // Crear horarios inline
        horarios_actividades: horarios && horarios.length > 0 ? {
          create: horarios.map(h => ({
            dia_semana_id: h.diaSemanaId,
            hora_inicio: this.parseTimeToDate(h.horaInicio),
            hora_fin: this.parseTimeToDate(h.horaFin),
            activo: h.activo
          }))
        } : undefined,

        // Crear asignaciones de docentes inline
        docentes_actividades: docentes && docentes.length > 0 ? {
          create: docentes.map(d => ({
            docente_id: d.docenteId,
            rol_docente_id: d.rolDocenteId,
            observaciones: d.observaciones ?? undefined,
            activo: true
          }))
        } : undefined
      },
      include: {
        tipos_actividades: true,
        categorias_actividades: true,
        estados_actividades: true,
        horarios_actividades: {
          include: {
            dias_semana: true
          },
          orderBy: [
            { dia_semana_id: 'asc' },
            { hora_inicio: 'asc' }
          ]
        },
        docentes_actividades: {
          include: {
            personas: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                especialidad: true,
                email: true
              }
            },
            roles_docentes: true
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

    // Filtros básicos
    if (query.tipoActividadId) {
      where.tipo_actividad_id = query.tipoActividadId;
    }

    if (query.categoriaId) {
      where.categoria_id = query.categoriaId;
    }

    if (query.estadoId) {
      where.estado_id = query.estadoId;
    }

    // Filtro por día de semana
    if (query.diaSemanaId) {
      where.horarios_actividades = {
        some: {
          dia_semana_id: query.diaSemanaId,
          activo: true
        }
      };
    }

    // Filtro por docente
    if (query.docenteId) {
      where.docentes_actividades = {
        some: {
          docente_id: query.docenteId,
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
              aula_id: query.aulaId
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
        { codigo_actividad: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    // Filtro por vigencia
    if (query.vigentes) {
      const hoy = new Date();
      where.fecha_desde = { lte: hoy };
      where.OR = [
        { fecha_hasta: null },
        { fecha_hasta: { gte: hoy } }
      ];
    }

    const skip = (query.page - 1) * query.limit;

    // Configurar ordering
    const orderBy: any = {};
    if (query.orderBy === 'codigo') {
      orderBy.codigo_actividad = query.orderDir;
    } else if (query.orderBy === 'fechaDesde') {
      orderBy.fecha_desde = query.orderDir;
    } else if (query.orderBy === 'cupoMaximo') {
      orderBy.capacidadMaxima = query.orderDir;
    } else if (query.orderBy === 'created_at') {
      orderBy.created_at = query.orderDir;
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
          tipos_actividades: true,
          categorias_actividades: true,
          estados_actividades: true,
          horarios_actividades: {
            include: {
              dias_semana: true
            },
            orderBy: [
              { dia_semana_id: 'asc' },
              { hora_inicio: 'asc' }
            ],
            where: { activo: true }
          },
          docentes_actividades: {
            include: {
              personas: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  especialidad: true
                }
              },
              roles_docentes: true
            },
            where: { activo: true }
          },
          _count: {
            select: {
              participaciones_actividades: {
                where: { activo: true }
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
        const inscritos = (act as any)._count?.participaciones_actividades || 0;
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
        tipos_actividades: true,
        categorias_actividades: true,
        estados_actividades: true,
        horarios_actividades: {
          include: {
            dias_semana: true,
            reservas_aulas_actividades: {
              include: {
                aulas: {
                  select: {
                    id: true,
                    nombre: true,
                    capacidad: true
                  }
                }
              }
            }
          },
          orderBy: [
            { dia_semana_id: 'asc' },
            { hora_inicio: 'asc' }
          ]
        },
        docentes_actividades: {
          include: {
            personas: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                especialidad: true,
                email: true,
                telefono: true,
                honorariosPorHora: true
              }
            },
            roles_docentes: true
          },
          where: { activo: true }
        },
        participaciones_actividades: {
          include: {
            personas: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                tipo: true,
                email: true,
                telefono: true
              }
            }
          },
          where: { activo: true }
        },
        _count: {
          select: {
            participaciones_actividades: {
              where: { activo: true }
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
      where: { codigo_actividad: codigo },
      include: {
        tipos_actividades: true,
        categorias_actividades: true,
        estados_actividades: true
      }
    });
  }

  /**
   * Actualiza una actividad (sin tocar horarios/docentes)
   */
  async update(id: number, data: UpdateActividadDto) {
    const updateData: any = {};

    if (data.codigoActividad) updateData.codigo_actividad = data.codigoActividad;
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.tipoActividadId) updateData.tipo_actividad_id = data.tipoActividadId;
    if (data.categoriaId) updateData.categoria_id = data.categoriaId;
    if (data.estadoId) updateData.estado_id = data.estadoId;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.fechaDesde) updateData.fecha_desde = new Date(data.fechaDesde);
    if (data.fechaHasta !== undefined) {
      updateData.fecha_hasta = data.fechaHasta ? new Date(data.fechaHasta) : null;
    }
    if (data.cupoMaximo !== undefined) updateData.capacidadMaxima = data.cupoMaximo;
    if (data.costo !== undefined) updateData.costo = data.costo;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;

    return this.prisma.actividades.update({
      where: { id },
      data: updateData,
      include: {
        tipos_actividades: true,
        categorias_actividades: true,
        estados_actividades: true,
        horarios_actividades: {
          include: { dias_semana: true },
          orderBy: [
            { dia_semana_id: 'asc' },
            { hora_inicio: 'asc' }
          ]
        },
        docentes_actividades: {
          include: {
            personas: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                especialidad: true
              }
            },
            roles_docentes: true
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
    return this.prisma.actividades.update({
      where: { id },
      data: {
        estado_id: nuevoEstadoId,
        observaciones: observaciones || undefined
      },
      include: {
        estados_actividades: true
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
        actividad_id: actividadId,
        dia_semana_id: horarioData.diaSemanaId,
        hora_inicio: this.parseTimeToDate(horarioData.horaInicio),
        hora_fin: this.parseTimeToDate(horarioData.horaFin),
        activo: horarioData.activo !== false
      },
      include: {
        dias_semana: true,
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true
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

    if (horarioData.diaSemanaId) updateData.dia_semana_id = horarioData.diaSemanaId;
    if (horarioData.horaInicio) updateData.hora_inicio = this.parseTimeToDate(horarioData.horaInicio);
    if (horarioData.horaFin) updateData.hora_fin = this.parseTimeToDate(horarioData.horaFin);
    if (horarioData.activo !== undefined) updateData.activo = horarioData.activo;

    return this.prisma.horarios_actividades.update({
      where: { id: horarioId },
      data: updateData,
      include: {
        dias_semana: true,
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
   * Obtiene todos los horarios de una actividad
   */
  async getHorariosByActividad(actividadId: number) {
    return this.prisma.horarios_actividades.findMany({
      where: { actividad_id: actividadId },
      include: {
        dias_semana: true,
        reservas_aulas_actividades: {
          include: {
            aulas: true
          }
        }
      },
      orderBy: [
        { dia_semana_id: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });
  }

  async findHorarioById(horarioId: number) {
    return this.prisma.horarios_actividades.findUnique({
      where: { id: horarioId },
      include: {
        dias_semana: true,
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true
          }
        }
      }
    });
  }

  // ==================== DOCENTES ====================

  /**
   * Asigna un docente a una actividad
   */
  async asignarDocente(actividadId: number, docenteId: number, rolDocenteId: number, observaciones?: string) {
    return this.prisma.docentes_actividades.create({
      data: {
        actividad_id: actividadId,
        docente_id: docenteId,
        rol_docente_id: rolDocenteId,
        observaciones,
        activo: true
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true,
            email: true
          }
        },
        roles_docentes: true,
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true
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
        actividad_id: actividadId,
        docente_id: docenteId,
        rol_docente_id: rolDocenteId,
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
        fecha_desasignacion: new Date()
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        roles_docentes: true
      }
    });
  }

  /**
   * Obtiene docentes de una actividad
   */
  async getDocentesByActividad(actividadId: number) {
    return this.prisma.docentes_actividades.findMany({
      where: {
        actividad_id: actividadId,
        activo: true
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true,
            email: true,
            telefono: true,
            honorariosPorHora: true
          }
        },
        roles_docentes: true
      }
    });
  }

  /**
   * Obtiene docentes disponibles (todos los de tipo DOCENTE activos)
   */
  async getDocentesDisponibles() {
    return this.prisma.persona.findMany({
      where: {
        tipo: 'DOCENTE',
        fechaBaja: null
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        especialidad: true,
        email: true,
        telefono: true,
        honorariosPorHora: true
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  // ==================== PARTICIPACIONES ====================

  /**
   * Obtiene participantes de una actividad
   */
  async getParticipantes(actividadId: number) {
    return this.prisma.participaciones_actividades.findMany({
      where: {
        actividad_id: actividadId,
        activo: true
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true,
            email: true,
            telefono: true,
            categoriaId: true,
            categoria: true
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
    return this.prisma.participaciones_actividades.findFirst({
      where: {
        actividad_id: actividadId,
        persona_id: personaId
      },
      select: {
        id: true,
        activo: true,
        fecha_inicio: true,
        fecha_fin: true
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
    return this.prisma.participaciones_actividades.create({
      data: {
        actividad_id: actividadId,
        persona_id: personaId,
        fecha_inicio: new Date(fechaInicio),
        observaciones: observaciones || null,
        activo: true
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true,
            email: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true
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
    return this.prisma.participaciones_actividades.update({
      where: {
        id: participanteId,
        actividad_id: actividadId
      },
      data: {
        activo: false,
        fecha_fin: new Date()
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
            participaciones_actividades: {
              where: { activo: true }
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

    const participantesActivos = actividad._count.participaciones_actividades;
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
