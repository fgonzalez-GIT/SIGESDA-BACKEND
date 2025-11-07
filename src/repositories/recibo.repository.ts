// @ts-nocheck
import { PrismaClient, Recibo, TipoRecibo, EstadoRecibo, Prisma } from '@prisma/client';
import {
  CreateReciboDto,
  ReciboQueryDto,
  ReciboSearchDto,
  ReciboStatsDto
} from '@/dto/recibo.dto';

export class ReciboRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateReciboDto & { numero: string }): Promise<Recibo> {
    return this.prisma.recibo.create({
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null
      },
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true
          }
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            numeroSocio: true
          }
        },
        mediosPago: {
          orderBy: { fecha: 'desc' }
        }
      }
    });
  }

  async findAll(query: ReciboQueryDto): Promise<{ data: Recibo[]; total: number }> {
    const where: Prisma.ReciboWhereInput = {};

    if (query.tipo) {
      where.tipo = query.tipo;
    }

    if (query.estado) {
      where.estado = query.estado;
    }

    if (query.emisorId) {
      where.emisorId = query.emisorId;
    }

    if (query.receptorId) {
      where.receptorId = query.receptorId;
    }

    // Date range filtering
    if (query.fechaDesde || query.fechaHasta) {
      where.fecha = {};
      if (query.fechaDesde) {
        where.fecha.gte = new Date(query.fechaDesde);
      }
      if (query.fechaHasta) {
        where.fecha.lte = new Date(query.fechaHasta);
      }
    }

    // Amount filtering
    if (query.importeMinimo || query.importeMaximo) {
      where.importe = {};
      if (query.importeMinimo) {
        where.importe.gte = query.importeMinimo;
      }
      if (query.importeMaximo) {
        where.importe.lte = query.importeMaximo;
      }
    }

    // Special filters
    if (query.vencidosOnly) {
      const now = new Date();
      where.AND = [
        { fechaVencimiento: { not: null } },
        { fechaVencimiento: { lt: now } },
        { estado: { in: [EstadoRecibo.PENDIENTE, EstadoRecibo.VENCIDO] } }
      ];
    }

    if (query.pendientesOnly) {
      where.estado = EstadoRecibo.PENDIENTE;
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.recibo.findMany({
        where,
        skip,
        take: query.limit,
        include: {
          emisor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              tipo: true
            }
          },
          receptor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              tipo: true,
              numeroSocio: true
            }
          },
          mediosPago: {
            orderBy: { fecha: 'desc' }
          },
          cuota: {
            select: {
              id: true,
              categoria: true,
              mes: true,
              anio: true,
              montoTotal: true
            }
          }
        },
        orderBy: [
          { fecha: 'desc' },
          { numero: 'desc' }
        ]
      }),
      this.prisma.recibo.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Recibo | null> {
    return this.prisma.recibo.findUnique({
      where: { id },
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            email: true,
            telefono: true
          }
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            numeroSocio: true,
            email: true,
            telefono: true
          }
        },
        mediosPago: {
          orderBy: { fecha: 'desc' }
        },
        cuota: {
          include: {
            recibo: false // Avoid circular reference
          }
        }
      }
    });
  }

  async findByNumero(numero: string): Promise<Recibo | null> {
    return this.prisma.recibo.findUnique({
      where: { numero },
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true
          }
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            numeroSocio: true
          }
        },
        mediosPago: true
      }
    });
  }

  async findByPersonaId(personaId: string, tipo?: 'emisor' | 'receptor'): Promise<Recibo[]> {
    const where: Prisma.ReciboWhereInput = {};

    if (tipo === 'emisor') {
      where.emisorId = personaId;
    } else if (tipo === 'receptor') {
      where.receptorId = personaId;
    } else {
      where.OR = [
        { emisorId: personaId },
        { receptorId: personaId }
      ];
    }

    return this.prisma.recibo.findMany({
      where,
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true
          }
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            numeroSocio: true
          }
        },
        mediosPago: true
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async update(id: string, data: Partial<CreateReciboDto>): Promise<Recibo> {
    const updateData: any = { ...data };

    if (updateData.fecha) {
      updateData.fecha = new Date(updateData.fecha);
    }

    if (updateData.fechaVencimiento !== undefined) {
      updateData.fechaVencimiento = updateData.fechaVencimiento ? new Date(updateData.fechaVencimiento) : null;
    }

    return this.prisma.recibo.update({
      where: { id },
      data: updateData,
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true
          }
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            numeroSocio: true
          }
        },
        mediosPago: true
      }
    });
  }

  async updateEstado(id: string, nuevoEstado: EstadoRecibo, observaciones?: string): Promise<Recibo> {
    const updateData: any = { estado: nuevoEstado };

    if (observaciones) {
      updateData.observaciones = observaciones;
    }

    return this.prisma.recibo.update({
      where: { id },
      data: updateData,
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true
          }
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            numeroSocio: true
          }
        },
        mediosPago: true
      }
    });
  }

  async delete(id: string): Promise<Recibo> {
    return this.prisma.recibo.delete({
      where: { id }
    });
  }

  async deleteBulk(ids: string[]): Promise<{ count: number }> {
    return this.prisma.recibo.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  async createBulk(recibos: (CreateReciboDto & { numero: string })[]): Promise<{ count: number }> {
    const data = recibos.map(recibo => ({
      ...recibo,
      fecha: recibo.fecha ? new Date(recibo.fecha) : new Date(),
      fechaVencimiento: recibo.fechaVencimiento ? new Date(recibo.fechaVencimiento) : null
    }));

    return this.prisma.recibo.createMany({
      data,
      skipDuplicates: false // We want to catch number conflicts
    });
  }

  async updateBulkEstados(ids: string[], nuevoEstado: EstadoRecibo, observaciones?: string): Promise<{ count: number }> {
    const updateData: any = { estado: nuevoEstado };

    if (observaciones) {
      updateData.observaciones = observaciones;
    }

    return this.prisma.recibo.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: updateData
    });
  }

  async search(searchData: ReciboSearchDto): Promise<Recibo[]> {
    const { search, searchBy, tipo, estado, fechaDesde, fechaHasta } = searchData;

    let searchConditions: Prisma.ReciboWhereInput[] = [];

    if (searchBy === 'all' || searchBy === 'numero') {
      searchConditions.push({
        numero: { contains: search, mode: 'insensitive' }
      });
    }

    if (searchBy === 'all' || searchBy === 'concepto') {
      searchConditions.push({
        concepto: { contains: search, mode: 'insensitive' }
      });
    }

    if (searchBy === 'all' || searchBy === 'emisor') {
      searchConditions.push({
        emisor: {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } },
            { dni: { contains: search } }
          ]
        }
      });
    }

    if (searchBy === 'all' || searchBy === 'receptor') {
      searchConditions.push({
        receptor: {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } },
            { dni: { contains: search } }
          ]
        }
      });
    }

    const where: Prisma.ReciboWhereInput = {
      OR: searchConditions
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (estado) {
      where.estado = estado;
    }

    // Date range filtering
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) {
        where.fecha.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fecha.lte = new Date(fechaHasta);
      }
    }

    return this.prisma.recibo.findMany({
      where,
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true
          }
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            numeroSocio: true
          }
        },
        mediosPago: true
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async getStatistics(statsData: ReciboStatsDto): Promise<any> {
    const { fechaDesde, fechaHasta, agruparPor } = statsData;

    const where: Prisma.ReciboWhereInput = {
      fecha: {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta)
      }
    };

    switch (agruparPor) {
      case 'tipo':
        return this.prisma.recibo.groupBy({
          by: ['tipo'],
          where,
          _count: {
            id: true
          },
          _sum: {
            importe: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        });

      case 'estado':
        return this.prisma.recibo.groupBy({
          by: ['estado'],
          where,
          _count: {
            id: true
          },
          _sum: {
            importe: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        });

      case 'mes':
        // This would be more complex, grouping by month
        return this.prisma.$queryRaw`
          SELECT
            EXTRACT(YEAR FROM fecha) as year,
            EXTRACT(MONTH FROM fecha) as month,
            COUNT(*)::int as count,
            SUM(importe) as total_amount
          FROM recibos
          WHERE fecha >= ${new Date(fechaDesde)} AND fecha <= ${new Date(fechaHasta)}
          GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha)
          ORDER BY year DESC, month DESC
        `;

      default:
        // General statistics
        return this.prisma.recibo.aggregate({
          where,
          _count: {
            id: true
          },
          _sum: {
            importe: true
          },
          _avg: {
            importe: true
          }
        });
    }
  }

  async getNextNumero(): Promise<string> {
    const lastRecibo = await this.prisma.recibo.findFirst({
      select: {
        numero: true
      },
      orderBy: {
        numero: 'desc'
      }
    });

    if (!lastRecibo) {
      return '000001';
    }

    // Extract number from string (assuming format like "000001", "000002", etc.)
    const currentNumber = parseInt(lastRecibo.numero);
    const nextNumber = currentNumber + 1;

    // Format with leading zeros (6 digits)
    return nextNumber.toString().padStart(6, '0');
  }

  async getVencidos(): Promise<Recibo[]> {
    const now = new Date();

    return this.prisma.recibo.findMany({
      where: {
        fechaVencimiento: {
          not: null,
          lt: now
        },
        estado: {
          in: [EstadoRecibo.PENDIENTE, EstadoRecibo.VENCIDO]
        }
      },
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true
          }
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            numeroSocio: true
          }
        }
      },
      orderBy: { fechaVencimiento: 'asc' }
    });
  }

  async getPendientes(): Promise<Recibo[]> {
    return this.prisma.recibo.findMany({
      where: {
        estado: EstadoRecibo.PENDIENTE
      },
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true
          }
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            tipo: true,
            numeroSocio: true
          }
        }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fecha: 'asc' }
      ]
    });
  }

  async markVencidosAsVencido(): Promise<{ count: number }> {
    const now = new Date();

    return this.prisma.recibo.updateMany({
      where: {
        fechaVencimiento: {
          not: null,
          lt: now
        },
        estado: EstadoRecibo.PENDIENTE
      },
      data: {
        estado: EstadoRecibo.VENCIDO
      }
    });
  }
}