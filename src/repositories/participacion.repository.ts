import { PrismaClient, ParticipacionActividad } from '@prisma/client';
import {
  CreateParticipacionDto,
  ParticipacionQueryDto,
  EstadisticasParticipacionDto,
  ReporteInasistenciasDto
} from '@/dto/participacion.dto';

type ParticipacionConRelaciones = ParticipacionActividad & {
  persona: {
    id: string;
    nombre: string;
    apellido: string;
    tipo: string;
  };
  actividad: {
    id: string;
    nombre: string;
    tipo: string;
    precio: number;
  };
};

export class ParticipacionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateParticipacionDto): Promise<ParticipacionConRelaciones> {
    return this.prisma.participacionActividad.create({
      data: {
        ...data,
        precioEspecial: data.precioEspecial ? Number(data.precioEspecial) : null
      },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      }
    });
  }

  async findAll(query: ParticipacionQueryDto): Promise<{
    data: ParticipacionConRelaciones[];
    total: number;
  }> {
    const where: any = {};

    // Filtros básicos
    if (query.personaId) {
      where.personaId = query.personaId;
    }

    if (query.actividadId) {
      where.actividadId = query.actividadId;
    }

    if (query.activa !== undefined) {
      where.activa = query.activa;
    }

    // Filtros de fecha
    if (query.fechaDesde || query.fechaHasta) {
      where.fechaInicio = {};
      if (query.fechaDesde) {
        where.fechaInicio.gte = query.fechaDesde;
      }
      if (query.fechaHasta) {
        where.fechaInicio.lte = query.fechaHasta;
      }
    }

    // Filtro de precio especial
    if (query.conPrecioEspecial !== undefined) {
      if (query.conPrecioEspecial) {
        where.precioEspecial = { not: null };
      } else {
        where.precioEspecial = null;
      }
    }

    // Búsqueda en nombre de persona o actividad
    if (query.search) {
      where.OR = [
        {
          persona: {
            OR: [
              { nombre: { contains: query.search, mode: 'insensitive' } },
              { apellido: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        },
        {
          actividad: {
            nombre: { contains: query.search, mode: 'insensitive' }
          }
        }
      ];
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    switch (query.sortBy) {
      case 'persona':
        orderBy.persona = { apellido: query.sortOrder };
        break;
      case 'actividad':
        orderBy.actividad = { nombre: query.sortOrder };
        break;
      default:
        orderBy[query.sortBy] = query.sortOrder;
        break;
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.participacionActividad.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: {
          persona: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              tipo: true
            }
          },
          actividad: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              precio: true
            }
          }
        }
      }),
      this.prisma.participacionActividad.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<ParticipacionConRelaciones | null> {
    return this.prisma.participacionActividad.findUnique({
      where: { id },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true,
            dni: true,
            email: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true,
            descripcion: true,
            capacidadMaxima: true
          }
        }
      }
    });
  }

  async findByPersonaId(personaId: string): Promise<ParticipacionConRelaciones[]> {
    return this.prisma.participacionActividad.findMany({
      where: { personaId },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });
  }

  async findByActividadId(actividadId: string): Promise<ParticipacionConRelaciones[]> {
    return this.prisma.participacionActividad.findMany({
      where: { actividadId },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });
  }

  async findParticipacionesActivas(personaId?: string): Promise<ParticipacionConRelaciones[]> {
    const where: any = {
      activa: true,
      OR: [
        { fechaFin: null }, // Sin fecha de fin
        { fechaFin: { gt: new Date() } } // Fecha de fin en el futuro
      ]
    };

    if (personaId) {
      where.personaId = personaId;
    }

    return this.prisma.participacionActividad.findMany({
      where,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });
  }

  async update(id: string, data: Partial<CreateParticipacionDto>): Promise<ParticipacionConRelaciones> {
    const updateData: any = { ...data };
    if (updateData.precioEspecial !== undefined) {
      updateData.precioEspecial = updateData.precioEspecial ? Number(updateData.precioEspecial) : null;
    }

    return this.prisma.participacionActividad.update({
      where: { id },
      data: updateData,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      }
    });
  }

  async delete(id: string): Promise<ParticipacionConRelaciones> {
    return this.prisma.participacionActividad.delete({
      where: { id },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      }
    });
  }

  async finalizarParticipacion(id: string, fechaFin?: Date, motivo?: string): Promise<ParticipacionConRelaciones> {
    const updateData: any = {
      activa: false,
      fechaFin: fechaFin || new Date()
    };

    if (motivo) {
      updateData.observaciones = motivo;
    }

    return this.prisma.participacionActividad.update({
      where: { id },
      data: updateData,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      }
    });
  }

  async reactivarParticipacion(id: string): Promise<ParticipacionConRelaciones> {
    return this.prisma.participacionActividad.update({
      where: { id },
      data: {
        activa: true,
        fechaFin: null
      },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      }
    });
  }

  async verificarConflictosHorarios(
    personaId: string,
    fechaInicio: Date,
    fechaFin?: Date,
    excluirId?: string
  ): Promise<ParticipacionConRelaciones[]> {
    const where: any = {
      personaId,
      activa: true,
      OR: [
        {
          AND: [
            { fechaInicio: { lte: fechaInicio } },
            {
              OR: [
                { fechaFin: null },
                { fechaFin: { gte: fechaInicio } }
              ]
            }
          ]
        }
      ]
    };

    if (fechaFin) {
      where.OR.push({
        AND: [
          { fechaInicio: { lte: fechaFin } },
          {
            OR: [
              { fechaFin: null },
              { fechaFin: { gte: fechaInicio } }
            ]
          }
        ]
      });
    }

    if (excluirId) {
      where.id = { not: excluirId };
    }

    return this.prisma.participacionActividad.findMany({
      where,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      }
    });
  }

  async contarParticipantesPorActividad(actividadId: string): Promise<{
    total: number;
    activos: number;
    inactivos: number;
  }> {
    const [total, activos] = await Promise.all([
      this.prisma.participacionActividad.count({
        where: { actividadId }
      }),
      this.prisma.participacionActividad.count({
        where: { actividadId, activa: true }
      })
    ]);

    return {
      total,
      activos,
      inactivos: total - activos
    };
  }

  async getEstadisticasParticipacion(params: EstadisticasParticipacionDto): Promise<any[]> {
    const where: any = {};

    if (params.fechaDesde || params.fechaHasta) {
      where.fechaInicio = {};
      if (params.fechaDesde) where.fechaInicio.gte = params.fechaDesde;
      if (params.fechaHasta) where.fechaInicio.lte = params.fechaHasta;
    }

    if (params.soloActivas) {
      where.activa = true;
    }

    switch (params.agruparPor) {
      case 'actividad':
        return this.prisma.participacionActividad.groupBy({
          by: ['actividadId'],
          where,
          _count: {
            actividadId: true
          },
          orderBy: {
            _count: {
              actividadId: 'desc'
            }
          }
        });

      case 'persona':
        return this.prisma.participacionActividad.groupBy({
          by: ['personaId'],
          where,
          _count: {
            personaId: true
          },
          orderBy: {
            _count: {
              personaId: 'desc'
            }
          }
        });

      case 'tipo_actividad':
        // Esta consulta requiere join, implementaremos con query raw
        return this.prisma.$queryRaw`
          SELECT a.tipo, COUNT(pa.id)::int as count
          FROM "participacion_actividades" pa
          JOIN "actividades" a ON pa."actividadId" = a.id
          WHERE ($1::timestamp IS NULL OR pa."fechaInicio" >= $1::timestamp)
            AND ($2::timestamp IS NULL OR pa."fechaInicio" <= $2::timestamp)
            AND ($3::boolean IS NULL OR pa.activa = $3::boolean)
          GROUP BY a.tipo
          ORDER BY count DESC
        ` as any[];

      case 'mes':
      default:
        return this.prisma.$queryRaw`
          SELECT
            DATE_TRUNC('month', "fechaInicio") as mes,
            COUNT(*)::int as count
          FROM "participacion_actividades"
          WHERE ($1::timestamp IS NULL OR "fechaInicio" >= $1::timestamp)
            AND ($2::timestamp IS NULL OR "fechaInicio" <= $2::timestamp)
            AND ($3::boolean IS NULL OR activa = $3::boolean)
          GROUP BY DATE_TRUNC('month', "fechaInicio")
          ORDER BY mes DESC
        ` as any[];
    }
  }

  async getParticipacionesPorVencer(diasAnticipacion: number = 30): Promise<ParticipacionConRelaciones[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);

    return this.prisma.participacionActividad.findMany({
      where: {
        activa: true,
        fechaFin: {
          not: null,
          lte: fechaLimite
        }
      },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true,
            email: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      },
      orderBy: { fechaFin: 'asc' }
    });
  }

  async bulkCreate(participaciones: CreateParticipacionDto[]): Promise<number> {
    // Usar transacción para operación bulk
    const result = await this.prisma.$transaction(
      participaciones.map(participacion =>
        this.prisma.participacionActividad.create({
          data: {
            ...participacion,
            precioEspecial: participacion.precioEspecial ? Number(participacion.precioEspecial) : null
          }
        })
      )
    );

    return result.length;
  }

  async transferirParticipacion(
    id: string,
    nuevaActividadId: string,
    fechaTransferencia: Date,
    conservarFechaInicio: boolean = false
  ): Promise<ParticipacionConRelaciones> {
    const updateData: any = {
      actividadId: nuevaActividadId
    };

    if (!conservarFechaInicio) {
      updateData.fechaInicio = fechaTransferencia;
    }

    return this.prisma.participacionActividad.update({
      where: { id },
      data: updateData,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true
          }
        }
      }
    });
  }

  async getReporteInasistencias(params: ReporteInasistenciasDto): Promise<any[]> {
    // Esta es una implementación simplificada
    // En un sistema real, tendríamos una tabla de asistencias
    const where: any = {
      fechaInicio: {
        gte: params.fechaDesde,
        lte: params.fechaHasta
      },
      activa: true
    };

    if (params.actividadId) {
      where.actividadId = params.actividadId;
    }

    return this.prisma.participacionActividad.findMany({
      where,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        }
      }
    });
  }
}