import { PrismaClient, ReservaAula, Prisma } from '@prisma/client';
import {
  CreateReservaAulaDto,
  ReservaAulaQueryDto,
  ConflictDetectionDto,
  ReservaSearchDto,
  ReservaStatsDto
} from '@/dto/reserva-aula.dto';

export class ReservaAulaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateReservaAulaDto): Promise<ReservaAula> {
    return this.prisma.reservaAula.create({
      data: {
        ...data,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin)
      },
      include: {
        aula: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            equipamiento: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            descripcion: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            especialidad: true
          }
        }
      }
    });
  }

  async findAll(query: ReservaAulaQueryDto): Promise<{ data: ReservaAula[]; total: number }> {
    const where: Prisma.ReservaAulaWhereInput = {};

    if (query.aulaId) {
      where.aulaId = query.aulaId;
    }

    if (query.actividadId) {
      where.actividadId = query.actividadId;
    }

    if (query.docenteId) {
      where.docenteId = query.docenteId;
    }

    // Date range filtering
    if (query.fechaDesde || query.fechaHasta) {
      where.fechaInicio = {};
      if (query.fechaDesde) {
        where.fechaInicio.gte = new Date(query.fechaDesde);
      }
      if (query.fechaHasta) {
        where.fechaInicio.lte = new Date(query.fechaHasta);
      }
    }

    // Filter out past reservations by default
    if (!query.incluirPasadas) {
      const now = new Date();
      if (!where.fechaFin) {
        where.fechaFin = {};
      }
      where.fechaFin.gte = now;
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.reservaAula.findMany({
        where,
        skip,
        take: query.limit,
        include: {
          aula: {
            select: {
              id: true,
              nombre: true,
              capacidad: true,
              ubicacion: true,
              equipamiento: true,
              activa: true
            }
          },
          actividad: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              descripcion: true,
              activa: true
            }
          },
          docente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              especialidad: true,
              fechaBaja: true
            }
          }
        },
        orderBy: [
          { fechaInicio: 'asc' },
          { aula: { nombre: 'asc' } }
        ]
      }),
      this.prisma.reservaAula.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<ReservaAula | null> {
    return this.prisma.reservaAula.findUnique({
      where: { id },
      include: {
        aula: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            equipamiento: true,
            activa: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            descripcion: true,
            activa: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            especialidad: true,
            fechaBaja: true,
            email: true,
            telefono: true
          }
        }
      }
    });
  }

  async findByAulaId(aulaId: string, incluirPasadas = false): Promise<ReservaAula[]> {
    const where: Prisma.ReservaAulaWhereInput = { aulaId };

    if (!incluirPasadas) {
      const now = new Date();
      where.fechaFin = { gte: now };
    }

    return this.prisma.reservaAula.findMany({
      where,
      include: {
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async findByDocenteId(docenteId: string, incluirPasadas = false): Promise<ReservaAula[]> {
    const where: Prisma.ReservaAulaWhereInput = { docenteId };

    if (!incluirPasadas) {
      const now = new Date();
      where.fechaFin = { gte: now };
    }

    return this.prisma.reservaAula.findMany({
      where,
      include: {
        aula: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async findByActividadId(actividadId: string, incluirPasadas = false): Promise<ReservaAula[]> {
    const where: Prisma.ReservaAulaWhereInput = { actividadId };

    if (!incluirPasadas) {
      const now = new Date();
      where.fechaFin = { gte: now };
    }

    return this.prisma.reservaAula.findMany({
      where,
      include: {
        aula: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async detectConflicts(conflictData: ConflictDetectionDto): Promise<ReservaAula[]> {
    const { aulaId, fechaInicio, fechaFin, excludeReservaId } = conflictData;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const where: Prisma.ReservaAulaWhereInput = {
      aulaId,
      OR: [
        // Overlap scenarios:
        // 1. New reservation starts before existing ends and ends after existing starts
        {
          AND: [
            { fechaInicio: { lt: fin } },
            { fechaFin: { gt: inicio } }
          ]
        }
      ]
    };

    // Exclude current reservation when updating
    if (excludeReservaId) {
      where.id = { not: excludeReservaId };
    }

    return this.prisma.reservaAula.findMany({
      where,
      include: {
        aula: {
          select: {
            id: true,
            nombre: true
          }
        },
        actividad: {
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
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async update(id: string, data: Partial<CreateReservaAulaDto>): Promise<ReservaAula> {
    const updateData: any = { ...data };

    if (updateData.fechaInicio) {
      updateData.fechaInicio = new Date(updateData.fechaInicio);
    }

    if (updateData.fechaFin) {
      updateData.fechaFin = new Date(updateData.fechaFin);
    }

    return this.prisma.reservaAula.update({
      where: { id },
      data: updateData,
      include: {
        aula: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        },
        docente: {
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

  async delete(id: string): Promise<ReservaAula> {
    return this.prisma.reservaAula.delete({
      where: { id }
    });
  }

  async deleteBulk(ids: string[]): Promise<{ count: number }> {
    return this.prisma.reservaAula.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  async createBulk(reservas: CreateReservaAulaDto[]): Promise<{ count: number }> {
    const data = reservas.map(reserva => ({
      ...reserva,
      fechaInicio: new Date(reserva.fechaInicio),
      fechaFin: new Date(reserva.fechaFin)
    }));

    return this.prisma.reservaAula.createMany({
      data,
      skipDuplicates: false // We want to catch conflicts
    });
  }

  async search(searchData: ReservaSearchDto): Promise<ReservaAula[]> {
    const { search, searchBy, fechaDesde, fechaHasta, incluirPasadas } = searchData;

    let searchConditions: Prisma.ReservaAulaWhereInput[] = [];

    if (searchBy === 'all' || searchBy === 'aula') {
      searchConditions.push({
        aula: {
          nombre: { contains: search, mode: 'insensitive' }
        }
      });
    }

    if (searchBy === 'all' || searchBy === 'docente') {
      searchConditions.push({
        docente: {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } }
          ]
        }
      });
    }

    if (searchBy === 'all' || searchBy === 'actividad') {
      searchConditions.push({
        actividad: {
          nombre: { contains: search, mode: 'insensitive' }
        }
      });
    }

    if (searchBy === 'all' || searchBy === 'observaciones') {
      searchConditions.push({
        observaciones: { contains: search, mode: 'insensitive' }
      });
    }

    const where: Prisma.ReservaAulaWhereInput = {
      OR: searchConditions
    };

    // Date range filtering
    if (fechaDesde || fechaHasta) {
      where.fechaInicio = {};
      if (fechaDesde) {
        where.fechaInicio.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaInicio.lte = new Date(fechaHasta);
      }
    }

    // Filter past reservations
    if (!incluirPasadas) {
      const now = new Date();
      if (!where.fechaFin) {
        where.fechaFin = {};
      }
      where.fechaFin.gte = now;
    }

    return this.prisma.reservaAula.findMany({
      where,
      include: {
        aula: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async getStatistics(statsData: ReservaStatsDto): Promise<any> {
    const { fechaDesde, fechaHasta, agruparPor } = statsData;

    const where: Prisma.ReservaAulaWhereInput = {
      fechaInicio: {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta)
      }
    };

    switch (agruparPor) {
      case 'aula':
        return this.prisma.reservaAula.groupBy({
          by: ['aulaId'],
          where,
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        });

      case 'docente':
        return this.prisma.reservaAula.groupBy({
          by: ['docenteId'],
          where,
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        });

      case 'actividad':
        return this.prisma.reservaAula.groupBy({
          by: ['actividadId'],
          where,
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        });

      default:
        // General statistics
        return this.prisma.reservaAula.aggregate({
          where,
          _count: {
            id: true
          }
        });
    }
  }

  async getUpcomingReservations(limit = 10): Promise<ReservaAula[]> {
    const now = new Date();

    return this.prisma.reservaAula.findMany({
      where: {
        fechaInicio: {
          gte: now
        }
      },
      include: {
        aula: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' },
      take: limit
    });
  }

  async getCurrentReservations(): Promise<ReservaAula[]> {
    const now = new Date();

    return this.prisma.reservaAula.findMany({
      where: {
        fechaInicio: {
          lte: now
        },
        fechaFin: {
          gte: now
        }
      },
      include: {
        aula: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }
}