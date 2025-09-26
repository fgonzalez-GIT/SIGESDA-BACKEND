import { PrismaClient, Actividad, TipoActividad, TipoPersona } from '@prisma/client';
import { CreateActividadDto, ActividadQueryDto } from '@/dto/actividad.dto';

export class ActividadRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateActividadDto): Promise<Actividad> {
    const { docenteIds, ...actividadData } = data;

    return this.prisma.actividad.create({
      data: {
        ...actividadData,
        docentes: docenteIds && docenteIds.length > 0 ? {
          connect: docenteIds.map(id => ({ id }))
        } : undefined
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

  async findAll(query: ActividadQueryDto): Promise<{ data: Actividad[]; total: number }> {
    const where: any = {};

    if (query.tipo) {
      where.tipo = query.tipo;
    }

    if (query.activa !== undefined) {
      where.activa = query.activa;
    }

    if (query.precioDesde !== undefined || query.precioHasta !== undefined) {
      where.precio = {};
      if (query.precioDesde !== undefined) {
        where.precio.gte = query.precioDesde;
      }
      if (query.precioHasta !== undefined) {
        where.precio.lte = query.precioHasta;
      }
    }

    if (query.conDocentes !== undefined) {
      if (query.conDocentes) {
        where.docentes = {
          some: {}
        };
      } else {
        where.docentes = {
          none: {}
        };
      }
    }

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.actividad.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [
          { activa: 'desc' }, // Activas primero
          { nombre: 'asc' }
        ],
        include: {
          docentes: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              especialidad: true
            }
          },
          _count: {
            select: {
              participaciones: {
                where: { activa: true }
              }
            }
          }
        }
      }),
      this.prisma.actividad.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Actividad | null> {
    return this.prisma.actividad.findUnique({
      where: { id },
      include: {
        docentes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true,
            honorariosPorHora: true
          }
        },
        participaciones: {
          where: { activa: true },
          include: {
            persona: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                tipo: true,
                categoria: true
              }
            }
          }
        },
        reservasAula: {
          include: {
            aula: {
              select: {
                id: true,
                nombre: true
              }
            },
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });
  }

  async findByTipo(tipo: TipoActividad): Promise<Actividad[]> {
    return this.prisma.actividad.findMany({
      where: {
        tipo,
        activa: true
      },
      orderBy: { nombre: 'asc' },
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

  async update(id: string, data: Partial<CreateActividadDto>): Promise<Actividad> {
    const { docenteIds, ...actividadData } = data;

    const updateData: any = { ...actividadData };

    if (docenteIds !== undefined) {
      // Primero desconectar todos los docentes
      await this.prisma.actividad.update({
        where: { id },
        data: {
          docentes: {
            set: []
          }
        }
      });

      // Luego conectar los nuevos docentes
      if (docenteIds.length > 0) {
        updateData.docentes = {
          connect: docenteIds.map(docenteId => ({ id: docenteId }))
        };
      }
    }

    return this.prisma.actividad.update({
      where: { id },
      data: updateData,
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

  async delete(id: string): Promise<Actividad> {
    return this.prisma.actividad.delete({
      where: { id }
    });
  }

  async softDelete(id: string): Promise<Actividad> {
    return this.prisma.actividad.update({
      where: { id },
      data: { activa: false }
    });
  }

  async asignarDocente(actividadId: string, docenteId: string): Promise<Actividad> {
    return this.prisma.actividad.update({
      where: { id: actividadId },
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
        }
      }
    });
  }

  async desasignarDocente(actividadId: string, docenteId: string): Promise<Actividad> {
    return this.prisma.actividad.update({
      where: { id: actividadId },
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

  async getParticipantes(actividadId: string): Promise<any[]> {
    const participaciones = await this.prisma.participacionActividad.findMany({
      where: {
        actividadId,
        activa: true
      },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true,
            categoria: true,
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

    return participaciones;
  }

  async getEstadisticas(actividadId: string): Promise<any> {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id: actividadId },
      include: {
        _count: {
          select: {
            participaciones: {
              where: { activa: true }
            },
            reservasAula: true
          }
        }
      }
    });

    if (!actividad) return null;

    const participacionesPorTipo = await this.prisma.participacionActividad.groupBy({
      by: ['personaId'],
      where: {
        actividadId,
        activa: true
      },
      _count: true
    });

    // Obtener tipos de persona de los participantes
    const participantesIds = participacionesPorTipo.map(p => p.personaId);
    const tiposPersona = await this.prisma.persona.groupBy({
      by: ['tipo'],
      where: {
        id: { in: participantesIds }
      },
      _count: true
    });

    return {
      totalParticipantes: actividad._count.participaciones,
      totalReservas: actividad._count.reservasAula,
      capacidadMaxima: actividad.capacidadMaxima,
      porcentajeOcupacion: actividad.capacidadMaxima
        ? Math.round((actividad._count.participaciones / actividad.capacidadMaxima) * 100)
        : null,
      participantesPorTipo: tiposPersona
    };
  }

  async getDocentesDisponibles(): Promise<any[]> {
    return this.prisma.persona.findMany({
      where: {
        tipo: TipoPersona.DOCENTE,
        fechaBaja: null // Solo docentes activos
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        especialidad: true,
        honorariosPorHora: true
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }
}