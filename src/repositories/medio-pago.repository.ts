// @ts-nocheck
import { PrismaClient, MedioPago, MedioPagoTipo, Prisma } from '@prisma/client';
import type {
  MedioPagoFilterDto,
  MedioPagoSearchDto,
  MedioPagoStatsDto,
  ConciliacionBancariaDto,
  CreateMedioPagoDto,
  UpdateMedioPagoDto
} from '../dto/medio-pago.dto';

export class MedioPagoRepository {
  constructor(private prisma: PrismaClient) {}

  // Crear un medio de pago
  async create(data: CreateMedioPagoDto): Promise<MedioPago> {
    return this.prisma.medioPago.create({
      data: {
        ...data,
        importe: new Prisma.Decimal(data.importe),
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
      },
      include: {
        recibo: {
          include: {
            receptor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
              }
            }
          }
        }
      }
    });
  }

  // Obtener todos los medios de pago con filtros
  async findMany(filters: MedioPagoFilterDto): Promise<{
    mediosPago: Array<MedioPago & {
      recibo: {
        numero: string;
        estado: string;
        importe: Prisma.Decimal;
        concepto: string;
        fecha: Date;
        receptor: {
          id: string;
          nombre: string;
          apellido: string;
          dni: string;
        } | null;
      };
    }>;
    total: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, orderBy = 'fecha', orderDirection = 'desc', ...filterFields } = filters;
    const skip = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: Prisma.MedioPagoWhereInput = {};

    if (filterFields.reciboId) {
      where.reciboId = filterFields.reciboId;
    }

    if (filterFields.tipo) {
      where.tipo = filterFields.tipo;
    }

    if (filterFields.importeMinimo || filterFields.importeMaximo) {
      where.importe = {};
      if (filterFields.importeMinimo) {
        where.importe.gte = new Prisma.Decimal(filterFields.importeMinimo);
      }
      if (filterFields.importeMaximo) {
        where.importe.lte = new Prisma.Decimal(filterFields.importeMaximo);
      }
    }

    if (filterFields.fechaDesde || filterFields.fechaHasta) {
      where.fecha = {};
      if (filterFields.fechaDesde) {
        where.fecha.gte = new Date(filterFields.fechaDesde);
      }
      if (filterFields.fechaHasta) {
        where.fecha.lte = new Date(filterFields.fechaHasta);
      }
    }

    if (filterFields.banco) {
      where.banco = {
        contains: filterFields.banco,
        mode: 'insensitive'
      };
    }

    if (filterFields.numero) {
      where.numero = {
        contains: filterFields.numero,
        mode: 'insensitive'
      };
    }

    // Definir ordenamiento
    const orderByClause: Prisma.MedioPagoOrderByWithRelationInput = {};
    switch (orderBy) {
      case 'importe':
        orderByClause.importe = orderDirection;
        break;
      case 'tipo':
        orderByClause.tipo = orderDirection;
        break;
      case 'numero':
        orderByClause.numero = orderDirection;
        break;
      case 'fecha':
      default:
        orderByClause.fecha = orderDirection;
        break;
    }

    const [mediosPago, total] = await Promise.all([
      this.prisma.medioPago.findMany({
        where,
        include: {
          recibo: {
            include: {
              receptor: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  dni: true,
                }
              }
            }
          }
        },
        orderBy: orderByClause,
        skip,
        take: limit,
      }),
      this.prisma.medioPago.count({ where })
    ]);

    return {
      mediosPago,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Obtener medio de pago por ID
  async findById(id: string): Promise<(MedioPago & {
    recibo: {
      numero: string;
      estado: string;
      importe: Prisma.Decimal;
      concepto: string;
      fecha: Date;
      receptor: {
        id: string;
        nombre: string;
        apellido: string;
        dni: string;
      } | null;
    };
  }) | null> {
    return this.prisma.medioPago.findUnique({
      where: { id },
      include: {
        recibo: {
          include: {
            receptor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
              }
            }
          }
        }
      }
    });
  }

  // Obtener medios de pago por recibo
  async findByReciboId(reciboId: string): Promise<Array<MedioPago>> {
    return this.prisma.medioPago.findMany({
      where: { reciboId },
      orderBy: { fecha: 'desc' },
      include: {
        recibo: {
          select: {
            numero: true,
            estado: true,
            importe: true,
            concepto: true,
          }
        }
      }
    });
  }

  // Actualizar medio de pago
  async update(id: string, data: UpdateMedioPagoDto): Promise<MedioPago> {
    const updateData: any = { ...data };

    if (updateData.importe !== undefined) {
      updateData.importe = new Prisma.Decimal(updateData.importe);
    }

    if (updateData.fecha) {
      updateData.fecha = new Date(updateData.fecha);
    }

    return this.prisma.medioPago.update({
      where: { id },
      data: updateData,
      include: {
        recibo: {
          include: {
            receptor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
              }
            }
          }
        }
      }
    });
  }

  // Eliminar medio de pago
  async delete(id: string): Promise<MedioPago> {
    return this.prisma.medioPago.delete({
      where: { id }
    });
  }

  // Eliminar múltiples medios de pago
  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return this.prisma.medioPago.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  // Buscar medios de pago
  async search(filters: MedioPagoSearchDto): Promise<Array<MedioPago & {
    recibo: {
      numero: string;
      estado: string;
      importe: Prisma.Decimal;
      concepto: string;
      fecha: Date;
      receptor: {
        id: string;
        nombre: string;
        apellido: string;
        dni: string;
      } | null;
    };
  }>> {
    const { search, searchBy = 'all', ...filterFields } = filters;

    const where: Prisma.MedioPagoWhereInput = {};

    // Filtros adicionales
    if (filterFields.tipo) {
      where.tipo = filterFields.tipo;
    }

    if (filterFields.fechaDesde || filterFields.fechaHasta) {
      where.fecha = {};
      if (filterFields.fechaDesde) {
        where.fecha.gte = new Date(filterFields.fechaDesde);
      }
      if (filterFields.fechaHasta) {
        where.fecha.lte = new Date(filterFields.fechaHasta);
      }
    }

    // Lógica de búsqueda
    const searchConditions: Prisma.MedioPagoWhereInput[] = [];

    if (searchBy === 'numero' || searchBy === 'all') {
      searchConditions.push({
        numero: {
          contains: search,
          mode: 'insensitive'
        }
      });
    }

    if (searchBy === 'banco' || searchBy === 'all') {
      searchConditions.push({
        banco: {
          contains: search,
          mode: 'insensitive'
        }
      });
    }

    if (searchBy === 'recibo' || searchBy === 'all') {
      searchConditions.push({
        recibo: {
          OR: [
            { numero: { contains: search, mode: 'insensitive' } },
            { concepto: { contains: search, mode: 'insensitive' } },
            {
              receptor: {
                OR: [
                  { nombre: { contains: search, mode: 'insensitive' } },
                  { apellido: { contains: search, mode: 'insensitive' } },
                  { dni: { contains: search } }
                ]
              }
            }
          ]
        }
      });
    }

    if (searchConditions.length > 0) {
      where.OR = searchConditions;
    }

    return this.prisma.medioPago.findMany({
      where,
      include: {
        recibo: {
          include: {
            receptor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      },
      take: 50 // Limitar resultados de búsqueda
    });
  }

  // Obtener estadísticas de medios de pago
  async getStats(filters: MedioPagoStatsDto): Promise<{
    totalMediosPago: number;
    importeTotal: number;
    porTipo: Array<{
      tipo: MedioPagoTipo;
      cantidad: number;
      importeTotal: number;
      porcentaje: number;
    }>;
    porBanco?: Array<{
      banco: string;
      cantidad: number;
      importeTotal: number;
      tipos: MedioPagoTipo[];
    }>;
  }> {
    const { fechaDesde, fechaHasta, agruparPor = 'tipo', reciboId } = filters;

    const where: Prisma.MedioPagoWhereInput = {
      fecha: {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta)
      }
    };

    if (reciboId) {
      where.reciboId = reciboId;
    }

    // Estadísticas generales
    const [totalMediosPago, importeTotalResult] = await Promise.all([
      this.prisma.medioPago.count({ where }),
      this.prisma.medioPago.aggregate({
        where,
        _sum: {
          importe: true
        }
      })
    ]);

    const importeTotal = Number(importeTotalResult._sum.importe || 0);

    // Estadísticas por tipo
    const statsPorTipo = await this.prisma.medioPago.groupBy({
      by: ['tipo'],
      where,
      _count: {
        id: true
      },
      _sum: {
        importe: true
      },
      orderBy: {
        _sum: {
          importe: 'desc'
        }
      }
    });

    const porTipo = statsPorTipo.map(stat => ({
      tipo: stat.tipo,
      cantidad: stat._count.id,
      importeTotal: Number(stat._sum.importe || 0),
      porcentaje: importeTotal > 0 ? (Number(stat._sum.importe || 0) / importeTotal) * 100 : 0
    }));

    const result: any = {
      totalMediosPago,
      importeTotal,
      porTipo
    };

    // Estadísticas por banco si se agrupa por banco
    if (agruparPor === 'banco') {
      const statsPorBanco = await this.prisma.medioPago.groupBy({
        by: ['banco', 'tipo'],
        where: {
          ...where,
          banco: {
            not: null
          }
        },
        _count: {
          id: true
        },
        _sum: {
          importe: true
        }
      });

      const bancoMap = new Map<string, {
        cantidad: number;
        importeTotal: number;
        tipos: Set<MedioPagoTipo>;
      }>();

      statsPorBanco.forEach(stat => {
        if (!stat.banco) return;

        if (!bancoMap.has(stat.banco)) {
          bancoMap.set(stat.banco, {
            cantidad: 0,
            importeTotal: 0,
            tipos: new Set()
          });
        }

        const bancoData = bancoMap.get(stat.banco)!;
        bancoData.cantidad += stat._count.id;
        bancoData.importeTotal += Number(stat._sum.importe || 0);
        bancoData.tipos.add(stat.tipo);
      });

      result.porBanco = Array.from(bancoMap.entries()).map(([banco, data]) => ({
        banco,
        cantidad: data.cantidad,
        importeTotal: data.importeTotal,
        tipos: Array.from(data.tipos)
      }));
    }

    return result;
  }

  // Validar si un recibo está completamente pagado
  async validatePayment(reciboId: string, tolerancia: number = 0.01): Promise<{
    importeRecibo: number;
    importeTotalPagos: number;
    diferencia: number;
    esPagoCompleto: boolean;
    estado: 'COMPLETO' | 'PARCIAL' | 'EXCEDIDO';
    mediosPago: Array<{
      id: string;
      tipo: MedioPagoTipo;
      importe: number;
      fecha: Date;
      numero?: string;
      banco?: string;
    }>;
  }> {
    // Obtener recibo con sus medios de pago
    const recibo = await this.prisma.recibo.findUnique({
      where: { id: reciboId },
      include: {
        mediosPago: {
          orderBy: { fecha: 'desc' }
        }
      }
    });

    if (!recibo) {
      throw new Error('Recibo no encontrado');
    }

    const importeRecibo = Number(recibo.importe);
    const importeTotalPagos = recibo.mediosPago.reduce(
      (sum, mp) => sum + Number(mp.importe),
      0
    );

    const diferencia = importeTotalPagos - importeRecibo;
    const esPagoCompleto = Math.abs(diferencia) <= tolerancia;

    let estado: 'COMPLETO' | 'PARCIAL' | 'EXCEDIDO';
    if (esPagoCompleto) {
      estado = 'COMPLETO';
    } else if (diferencia < 0) {
      estado = 'PARCIAL';
    } else {
      estado = 'EXCEDIDO';
    }

    const mediosPago = recibo.mediosPago.map(mp => ({
      id: mp.id,
      tipo: mp.tipo,
      importe: Number(mp.importe),
      fecha: mp.fecha,
      numero: mp.numero || undefined,
      banco: mp.banco || undefined
    }));

    return {
      importeRecibo,
      importeTotalPagos,
      diferencia,
      esPagoCompleto,
      estado,
      mediosPago
    };
  }

  // Conciliación bancaria
  async getConciliacionBancaria(filters: ConciliacionBancariaDto): Promise<{
    operaciones: Array<{
      id: string;
      tipo: MedioPagoTipo;
      numero: string;
      importe: number;
      fecha: Date;
      recibo: {
        numero: string;
        concepto: string;
        receptor: string;
      };
    }>;
    resumen: {
      totalOperaciones: number;
      importeTotal: number;
    };
  }> {
    const { banco, fechaDesde, fechaHasta, tipo } = filters;

    const where: Prisma.MedioPagoWhereInput = {
      banco: {
        contains: banco,
        mode: 'insensitive'
      },
      fecha: {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta)
      }
    };

    if (tipo) {
      where.tipo = tipo;
    }

    const [operaciones, resumen] = await Promise.all([
      this.prisma.medioPago.findMany({
        where,
        include: {
          recibo: {
            include: {
              receptor: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        },
        orderBy: { fecha: 'asc' }
      }),
      this.prisma.medioPago.aggregate({
        where,
        _count: { id: true },
        _sum: { importe: true }
      })
    ]);

    return {
      operaciones: operaciones.map(op => ({
        id: op.id,
        tipo: op.tipo,
        numero: op.numero || '',
        importe: Number(op.importe),
        fecha: op.fecha,
        recibo: {
          numero: op.recibo.numero,
          concepto: op.recibo.concepto,
          receptor: op.recibo.receptor
            ? `${op.recibo.receptor.nombre} ${op.recibo.receptor.apellido}`
            : 'N/A'
        }
      })),
      resumen: {
        totalOperaciones: resumen._count.id,
        importeTotal: Number(resumen._sum.importe || 0)
      }
    };
  }

  // Obtener medios de pago por tipo
  async findByTipo(tipo: MedioPagoTipo, limit?: number): Promise<Array<MedioPago>> {
    return this.prisma.medioPago.findMany({
      where: { tipo },
      include: {
        recibo: {
          include: {
            receptor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
              }
            }
          }
        }
      },
      orderBy: { fecha: 'desc' },
      take: limit
    });
  }

  // Obtener total de pagos por recibo
  async getTotalPagosByRecibo(reciboId: string): Promise<number> {
    const result = await this.prisma.medioPago.aggregate({
      where: { reciboId },
      _sum: { importe: true }
    });

    return Number(result._sum.importe || 0);
  }

  // Verificar si existe un medio de pago con el mismo número
  async checkDuplicateNumber(numero: string, tipo: MedioPagoTipo, excludeId?: string): Promise<boolean> {
    const where: Prisma.MedioPagoWhereInput = {
      numero,
      tipo
    };

    if (excludeId) {
      where.id = {
        not: excludeId
      };
    }

    const count = await this.prisma.medioPago.count({ where });
    return count > 0;
  }

  // Obtener estadísticas rápidas
  async getQuickStats(): Promise<{
    totalHoy: number;
    totalMes: number;
    porTipoHoy: Record<MedioPagoTipo, number>;
  }> {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finDia = new Date(hoy);
    finDia.setHours(23, 59, 59, 999);

    const [totalHoy, totalMes, porTipoHoy] = await Promise.all([
      this.prisma.medioPago.aggregate({
        where: {
          fecha: {
            gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
            lte: finDia
          }
        },
        _sum: { importe: true }
      }),
      this.prisma.medioPago.aggregate({
        where: {
          fecha: {
            gte: inicioMes,
            lte: finDia
          }
        },
        _sum: { importe: true }
      }),
      this.prisma.medioPago.groupBy({
        by: ['tipo'],
        where: {
          fecha: {
            gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
            lte: finDia
          }
        },
        _sum: { importe: true }
      })
    ]);

    const porTipoHoyMap: Record<MedioPagoTipo, number> = {} as any;
    Object.values(MedioPagoTipo).forEach(tipo => {
      porTipoHoyMap[tipo] = 0;
    });

    porTipoHoy.forEach(stat => {
      porTipoHoyMap[stat.tipo] = Number(stat._sum.importe || 0);
    });

    return {
      totalHoy: Number(totalHoy._sum.importe || 0),
      totalMes: Number(totalMes._sum.importe || 0),
      porTipoHoy: porTipoHoyMap
    };
  }
}