import { PrismaClient, ParticipacionActividad } from '@prisma/client';
import {
  CreateParticipacionDto,
  ParticipacionQueryDto,
  EstadisticasParticipacionDto,
  ReporteInasistenciasDto
} from '@/dto/participacion.dto';

type ParticipacionConRelaciones = {
  id: number;
  persona_id: number;
  actividad_id: number;
  fecha_inicio: Date;
  fecha_fin: Date | null;
  precio_especial: any; // Decimal
  activo: boolean;
  observaciones: string | null;
  created_at: Date;
  updated_at: Date;
  personas: {
    id: number;
    nombre: string;
    apellido: string;
    tipo: string;
    dni?: string;
    email?: string | null;
  };
  actividades: {
    id: number;
    nombre: string;
    codigo_actividad: string;
    costo: any; // Decimal
    descripcion?: string | null;
    capacidadMaxima?: number | null;
    tipo_actividad_id: number;
  };
};

export class ParticipacionRepository {
  constructor(private prisma: PrismaClient) {}

  // Helper para convertir de DTO (camelCase) a Prisma (snake_case)
  private mapDtoToPrisma(data: CreateParticipacionDto): any {
    return {
      persona_id: data.personaId,
      actividad_id: data.actividadId,
      fecha_inicio: data.fechaInicio,
      fecha_fin: data.fechaFin || null,
      precio_especial: data.precioEspecial ? Number(data.precioEspecial) : null,
      activo: data.activa !== undefined ? data.activa : true,
      observaciones: data.observaciones || null
    };
  }

  async create(data: CreateParticipacionDto): Promise<ParticipacionConRelaciones> {
    return this.prisma.participaciones_actividades.create({
      data: this.mapDtoToPrisma(data),
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true,
            dni: true,
            email: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            descripcion: true,
            capacidadMaxima: true,
            costo: true,
            tipo_actividad_id: true
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

    // Filtros básicos (Mapear a snake_case)
    if (query.personaId) {
      where.persona_id = query.personaId;
    }

    if (query.actividadId) {
      where.actividad_id = query.actividadId;
    }

    if (query.activa !== undefined) {
      where.activo = query.activa;
    }

    // Filtros de fecha
    if (query.fechaDesde || query.fechaHasta) {
      where.fecha_inicio = {};
      if (query.fechaDesde) {
        where.fecha_inicio.gte = query.fechaDesde;
      }
      if (query.fechaHasta) {
        where.fecha_inicio.lte = query.fechaHasta;
      }
    }

    // Filtro de precio especial
    if (query.conPrecioEspecial !== undefined) {
      if (query.conPrecioEspecial) {
        where.precio_especial = { not: null };
      } else {
        where.precio_especial = null;
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
      this.prisma.participaciones_actividades.findMany({
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
              tipo: true,
              dni: true,
              email: true
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
      this.prisma.participaciones_actividades.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<ParticipacionConRelaciones | null> {
    return this.prisma.participaciones_actividades.findUnique({
      where: { id },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true,
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
    return this.prisma.participaciones_actividades.findMany({
      where: { persona_id: personaId },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
          }
        }
      },
      orderBy: { fecha_inicio: 'desc' }
    });
  }

  async findByActividadId(actividadId: number): Promise<ParticipacionConRelaciones[]> {
    return this.prisma.participaciones_actividades.findMany({
      where: { actividad_id: actividadId },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
          }
        }
      },
      orderBy: { fecha_inicio: 'desc' }
    });
  }

  async findByPersonaAndActividad(personaId: number, actividadId: number): Promise<ParticipacionConRelaciones | null> {
    return this.prisma.participaciones_actividades.findFirst({
      where: {
        persona_id: personaId,
        actividad_id: actividadId
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
          }
        }
      }
    });
  }

  async findParticipacionesActivas(personaId?: number): Promise<ParticipacionConRelaciones[]> {
    const where: any = {
      activo: true,
      OR: [
        { fecha_fin: null }, // Sin fecha de fin
        { fecha_fin: { gt: new Date() } } // Fecha de fin en el futuro
      ]
    };

    if (personaId) {
      where.persona_id = personaId;
    }

    return this.prisma.participaciones_actividades.findMany({
      where,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
          }
        }
      },
      orderBy: { fecha_inicio: 'desc' }
    });
  }

  async update(id: number, data: Partial<CreateParticipacionDto>): Promise<ParticipacionConRelaciones> {
    const updateData: any = {};

    if (data.personaId !== undefined) updateData.persona_id = data.personaId;
    if (data.actividadId !== undefined) updateData.actividad_id = data.actividadId;
    if (data.fechaInicio !== undefined) updateData.fecha_inicio = data.fechaInicio;
    if (data.fechaFin !== undefined) updateData.fecha_fin = data.fechaFin || null;
    if (data.precioEspecial !== undefined) updateData.precio_especial = data.precioEspecial ? Number(data.precioEspecial) : null;
    if (data.activa !== undefined) updateData.activo = data.activa;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null;

    return this.prisma.participaciones_actividades.update({
      where: { id },
      data: updateData,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
          }
        }
      }
    });
  }

  async delete(id: number): Promise<ParticipacionConRelaciones> {
    return this.prisma.participaciones_actividades.delete({
      where: { id },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
          }
        }
      }
    });
  }

  async finalizarParticipacion(id: number, fechaFin?: Date, motivo?: string): Promise<ParticipacionConRelaciones> {
    const updateData: any = {
      activo: false,
      fecha_fin: fechaFin || new Date()
    };

    if (motivo) {
      updateData.observaciones = motivo;
    }

    return this.prisma.participaciones_actividades.update({
      where: { id },
      data: updateData,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
          }
        }
      }
    });
  }

  async reactivarParticipacion(id: number): Promise<ParticipacionConRelaciones> {
    return this.prisma.participaciones_actividades.update({
      where: { id },
      data: {
        activo: true,
        fecha_fin: null
      },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
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
      persona_id: personaId,
      activo: true,
      OR: [
        {
          AND: [
            { fecha_inicio: { lte: fechaInicio } },
            {
              OR: [
                { fecha_fin: null },
                { fecha_fin: { gte: fechaInicio } }
              ]
            }
          ]
        }
      ]
    };

    if (fechaFin) {
      where.OR.push({
        AND: [
          { fecha_inicio: { lte: fechaFin } },
          {
            OR: [
              { fecha_fin: null },
              { fecha_fin: { gte: fechaInicio } }
            ]
          }
        ]
      });
    }

    if (excluirId) {
      where.id = { not: excluirId };
    }

    return this.prisma.participaciones_actividades.findMany({
      where,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
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
      this.prisma.participaciones_actividades.count({
        where: { actividad_id: actividadId }
      }),
      this.prisma.participaciones_actividades.count({
        where: { actividad_id: actividadId, activo: true }
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
        return this.prisma.participaciones_actividades.groupBy({
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
        return this.prisma.participaciones_actividades.groupBy({
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

    return this.prisma.participaciones_actividades.findMany({
      where: {
        activo: true,
        fecha_fin: {
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
            tipo: true,
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
            tipo_actividad_id: true
          }
        }
      },
      orderBy: { fecha_fin: 'asc' }
    });
  }

  async bulkCreate(participaciones: CreateParticipacionDto[]): Promise<number> {
    // Usar transacción para operación bulk
    const result = await this.prisma.$transaction(
      participaciones.map(participacion =>
        this.prisma.participaciones_actividades.create({
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
      actividad_id: nuevaActividadId
    };

    if (!conservarFechaInicio) {
      updateData.fecha_inicio = fechaTransferencia;
    }

    return this.prisma.participaciones_actividades.update({
      where: { id },
      data: updateData,
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            costo: true,
            tipo_actividad_id: true
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
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo: true,
            dni: true,
            email: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigo_actividad: true,
            descripcion: true,
            capacidadMaxima: true,
            costo: true,
            tipo_actividad_id: true
          }
        }
      }
    });
  }
}