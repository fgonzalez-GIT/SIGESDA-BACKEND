// @ts-nocheck
import { PrismaClient, ParticipacionActividad } from '@prisma/client';
import {
  CreateParticipacionDto,
  ParticipacionQueryDto,
  EstadisticasParticipacionDto,
  ReporteInasistenciasDto
} from '@/dto/participacion.dto';

type ParticipacionConRelaciones = {
  id: number;
  personaId: number;
  actividadId: number;
  fechaInicio: Date;
  fechaFin: Date | null;
  precioEspecial: any; // Decimal
  activa: boolean;
  observaciones: string | null;
  createdAt: Date;
  updatedAt: Date;
  personas: {
    id: number;
    nombre: string;
    apellido: string;
    dni?: string;
    email?: string | null;
  };
  actividades: {
    id: number;
    nombre: string;
    codigoActividad: string;
    costo: any; // Decimal
    descripcion?: string | null;
    capacidadMaxima?: number | null;
    tipoActividadId: number;
  };
};

export class ParticipacionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateParticipacionDto): Promise<ParticipacionConRelaciones> {
    return this.prisma.participacion_actividades.create({
      data: {
        personaId: data.personaId,
        actividadId: data.actividadId,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin || null,
        precioEspecial: data.precioEspecial ? Number(data.precioEspecial) : null,
        activa: data.activa !== undefined ? data.activa : true,
        observaciones: data.observaciones || null
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            email: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            descripcion: true,
            capacidadMaxima: true,
            costo: true,
            tipoActividadId: true
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
          personas: {
            OR: [
              { nombre: { contains: query.search, mode: 'insensitive' } },
              { apellido: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        },
        {
          actividades: {
            nombre: { contains: query.search, mode: 'insensitive' }
          }
        }
      ];
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    switch (query.sortBy) {
      case 'persona':
        orderBy.personas = { apellido: query.sortOrder };
        break;
      case 'actividad':
        orderBy.actividades = { nombre: query.sortOrder };
        break;
      default:
        orderBy[query.sortBy] = query.sortOrder;
        break;
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.participacion_actividades.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: {
          personas: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              email: true,
              tipos: {
                where: { activo: true },
                include: {
                  tipoPersona: {
                    select: {
                      id: true,
                      codigo: true,
                      nombre: true
                    }
                  }
                }
              }
            }
          },
          actividades: {
            select: {
              id: true,
              nombre: true,
              codigo_actividad: true,
              descripcion: true,
              capacidadMaxima: true,
              costo: true
            }
          }
        }
      }),
      this.prisma.participacion_actividades.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<ParticipacionConRelaciones | null> {
    return this.prisma.participacion_actividades.findUnique({
      where: { id },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            email: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            descripcion: true,
            cupo_maximo: true
          }
        }
      }
    });
  }

  async findByPersonaId(personaId: number): Promise<ParticipacionConRelaciones[]> {
    return this.prisma.participacion_actividades.findMany({
      where: { personaId: personaId },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });
  }

  async findByActividadId(actividadId: number): Promise<ParticipacionConRelaciones[]> {
    return this.prisma.participacion_actividades.findMany({
      where: { actividadId: actividadId },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });
  }

  async findByPersonaAndActividad(personaId: number, actividadId: number): Promise<ParticipacionConRelaciones | null> {
    return this.prisma.participacion_actividades.findFirst({
      where: {
        personaId: personaId,
        actividadId: actividadId
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
          }
        }
      }
    });
  }

  async findParticipacionesActivas(personaId?: number): Promise<ParticipacionConRelaciones[]> {
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

    return this.prisma.participacion_actividades.findMany({
      where,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });
  }

  async update(id: number, data: Partial<CreateParticipacionDto>): Promise<ParticipacionConRelaciones> {
    const updateData: any = {};

    if (data.personaId !== undefined) updateData.personaId = data.personaId;
    if (data.actividadId !== undefined) updateData.actividadId = data.actividadId;
    if (data.fechaInicio !== undefined) updateData.fechaInicio = data.fechaInicio;
    if (data.fechaFin !== undefined) updateData.fechaFin = data.fechaFin || null;
    if (data.precioEspecial !== undefined) updateData.precioEspecial = data.precioEspecial ? Number(data.precioEspecial) : null;
    if (data.activa !== undefined) updateData.activa = data.activa;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null;

    return this.prisma.participacion_actividades.update({
      where: { id },
      data: updateData,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
          }
        }
      }
    });
  }

  async delete(id: number): Promise<ParticipacionConRelaciones> {
    return this.prisma.participacion_actividades.delete({
      where: { id },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
          }
        }
      }
    });
  }

  async finalizarParticipacion(id: number, fechaFin?: Date, motivo?: string): Promise<ParticipacionConRelaciones> {
    const updateData: any = {
      activa: false,
      fechaFin: fechaFin || new Date()
    };

    if (motivo) {
      updateData.observaciones = motivo;
    }

    return this.prisma.participacion_actividades.update({
      where: { id },
      data: updateData,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
          }
        }
      }
    });
  }

  async reactivarParticipacion(id: number): Promise<ParticipacionConRelaciones> {
    return this.prisma.participacion_actividades.update({
      where: { id },
      data: {
        activa: true,
        fechaFin: null
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
          }
        }
      }
    });
  }

  async verificarConflictosHorarios(
    personaId: number,
    fechaInicio: Date,
    fechaFin?: Date,
    excluirId?: number
  ): Promise<ParticipacionConRelaciones[]> {
    const where: any = {
      personaId: personaId,
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

    return this.prisma.participacion_actividades.findMany({
      where,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
          }
        }
      }
    });
  }

  async contarParticipantesPorActividad(actividadId: number): Promise<{
    total: number;
    activos: number;
    inactivos: number;
  }> {
    const [total, activos] = await Promise.all([
      this.prisma.participacion_actividades.count({
        where: { actividadId: actividadId }
      }),
      this.prisma.participacion_actividades.count({
        where: { actividadId: actividadId, activa: true }
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
        return this.prisma.participacion_actividades.groupBy({
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
        return this.prisma.participacion_actividades.groupBy({
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

    return this.prisma.participacion_actividades.findMany({
      where: {
        activa: true,
        fechaFin: {
          not: null,
          lte: fechaLimite
        }
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            email: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
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
        this.prisma.participacion_actividades.create({
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
    id: number,
    nuevaActividadId: number,
    fechaTransferencia: Date,
    conservarFechaInicio: boolean = false
  ): Promise<ParticipacionConRelaciones> {
    const updateData: any = {
      actividadId: nuevaActividadId
    };

    if (!conservarFechaInicio) {
      updateData.fechaInicio = fechaTransferencia;
    }

    return this.prisma.participacion_actividades.update({
      where: { id },
      data: updateData,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            costo: true,
            tipoActividadId: true
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

    return this.prisma.participacion_actividades.findMany({
      where,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            email: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            descripcion: true,
            capacidadMaxima: true,
            costo: true,
            tipoActividadId: true
          }
        }
      }
    });
  }
}