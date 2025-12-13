// @ts-nocheck
import { PrismaClient, Cuota, CategoriaSocio, EstadoRecibo, Prisma } from '@prisma/client';
import {
  CreateCuotaDto,
  CuotaQueryDto,
  CuotaSearchDto,
  CuotaStatsDto,
  DeleteBulkCuotasDto,
  CalcularCuotaDto
} from '@/dto/cuota.dto';

export class CuotaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCuotaDto): Promise<Cuota> {
    return this.prisma.cuota.create({
      data: {
        ...data,
        montoBase: new Prisma.Decimal(data.montoBase),
        montoActividades: new Prisma.Decimal(data.montoActividades),
        montoTotal: new Prisma.Decimal(data.montoTotal)
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
                numeroSocio: true,
                categoria: true
              }
            },
            mediosPago: {
              orderBy: { fecha: 'desc' }
            }
          }
        }
      }
    });
  }

  async findAll(query: CuotaQueryDto): Promise<{ data: Cuota[]; total: number }> {
    const where: Prisma.CuotaWhereInput = {};

    if (query.categoria) {
      where.categoria = query.categoria;
    }

    if (query.mes) {
      where.mes = query.mes;
    }

    if (query.anio) {
      where.anio = query.anio;
    }

    if (query.reciboId) {
      where.reciboId = query.reciboId;
    }

    // Filtros por fecha
    if (query.fechaDesde || query.fechaHasta) {
      where.recibo = {
        fecha: {}
      };
      if (query.fechaDesde) {
        where.recibo.fecha.gte = new Date(query.fechaDesde);
      }
      if (query.fechaHasta) {
        where.recibo.fecha.lte = new Date(query.fechaHasta);
      }
    }

    // Filtro por cuotas impagas
    if (query.soloImpagas) {
      where.recibo = {
        ...where.recibo,
        estado: {
          in: [EstadoRecibo.PENDIENTE, EstadoRecibo.VENCIDO]
        }
      };
    }

    // Filtro por cuotas vencidas
    if (query.soloVencidas) {
      const now = new Date();
      where.recibo = {
        ...where.recibo,
        fechaVencimiento: {
          not: null,
          lt: now
        },
        estado: {
          in: [EstadoRecibo.PENDIENTE, EstadoRecibo.VENCIDO]
        }
      };
    }

    const skip = (query.page - 1) * query.limit;

    // Configurar ordenamiento
    let orderBy: Prisma.CuotaOrderByWithRelationInput[] = [];

    switch (query.ordenarPor) {
      case 'fecha':
        orderBy = [{ recibo: { fecha: query.orden } }];
        break;
      case 'monto':
        orderBy = [{ montoTotal: query.orden }];
        break;
      case 'categoria':
        orderBy = [{ categoria: query.orden }];
        break;
      case 'vencimiento':
        orderBy = [{ recibo: { fechaVencimiento: query.orden } }];
        break;
      default:
        orderBy = [{ anio: query.orden }, { mes: query.orden }];
    }

    const [data, total] = await Promise.all([
      this.prisma.cuota.findMany({
        where,
        skip,
        take: query.limit,
        include: {
          recibo: {
            include: {
              receptor: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  dni: true,
                  numeroSocio: true,
                  categoria: true
                }
              },
              mediosPago: {
                orderBy: { fecha: 'desc' }
              }
            }
          }
        },
        orderBy
      }),
      this.prisma.cuota.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<Cuota | null> {
    return this.prisma.cuota.findUnique({
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
                numeroSocio: true,
                categoria: true,
                email: true,
                telefono: true
              }
            },
            emisor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true
              }
            },
            mediosPago: {
              orderBy: { fecha: 'desc' }
            }
          }
        }
      }
    });
  }

  async findByReciboId(reciboId: string): Promise<Cuota | null> {
    return this.prisma.cuota.findUnique({
      where: { reciboId },
      include: {
        recibo: {
          include: {
            receptor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
                numeroSocio: true,
                categoria: true
              }
            },
            mediosPago: true
          }
        }
      }
    });
  }

  async findByPeriodo(mes: number, anio: number, categoria?: CategoriaSocio): Promise<Cuota[]> {
    const where: Prisma.CuotaWhereInput = {
      mes,
      anio
    };

    if (categoria) {
      where.categoria = categoria;
    }

    return this.prisma.cuota.findMany({
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
                numeroSocio: true
              }
            }
          }
        }
      },
      orderBy: [
        { categoriaId: 'asc' },
        { recibo: { receptor: { numeroSocio: 'asc' } } }
      ]
    });
  }

  async findBySocio(socioId: string, limit?: number): Promise<Cuota[]> {
    return this.prisma.cuota.findMany({
      where: {
        recibo: {
          receptorId: socioId
        }
      },
      include: {
        recibo: {
          include: {
            mediosPago: true
          }
        }
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' }
      ],
      take: limit
    });
  }

  async update(id: string, data: Partial<CreateCuotaDto>): Promise<Cuota> {
    const updateData: any = { ...data };

    if (updateData.montoBase !== undefined) {
      updateData.montoBase = new Prisma.Decimal(updateData.montoBase);
    }
    if (updateData.montoActividades !== undefined) {
      updateData.montoActividades = new Prisma.Decimal(updateData.montoActividades);
    }
    if (updateData.montoTotal !== undefined) {
      updateData.montoTotal = new Prisma.Decimal(updateData.montoTotal);
    }

    return this.prisma.cuota.update({
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
                numeroSocio: true,
                categoria: true
              }
            },
            mediosPago: true
          }
        }
      }
    });
  }

  async delete(id: string): Promise<Cuota> {
    return this.prisma.cuota.delete({
      where: { id }
    });
  }

  async deleteBulk(ids: string[]): Promise<{ count: number }> {
    return this.prisma.cuota.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  async search(searchData: CuotaSearchDto): Promise<Cuota[]> {
    const { search, searchBy, categoria, mes, anio, estado } = searchData;

    let searchConditions: Prisma.CuotaWhereInput[] = [];

    if (searchBy === 'all' || searchBy === 'socio') {
      searchConditions.push({
        recibo: {
          receptor: {
            OR: [
              { nombre: { contains: search, mode: 'insensitive' } },
              { apellido: { contains: search, mode: 'insensitive' } },
              { dni: { contains: search } },
              { numeroSocio: isNaN(parseInt(search)) ? undefined : parseInt(search) }
            ]
          }
        }
      });
    }

    if (searchBy === 'all' || searchBy === 'numero_recibo') {
      searchConditions.push({
        recibo: {
          numero: { contains: search, mode: 'insensitive' }
        }
      });
    }

    const where: Prisma.CuotaWhereInput = {
      OR: searchConditions
    };

    if (categoria) {
      where.categoria = categoria;
    }

    if (mes) {
      where.mes = mes;
    }

    if (anio) {
      where.anio = anio;
    }

    if (estado) {
      where.recibo = {
        ...where.recibo,
        estado: estado as EstadoRecibo
      };
    }

    return this.prisma.cuota.findMany({
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
                numeroSocio: true,
                categoria: true
              }
            },
            mediosPago: true
          }
        }
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' },
        { recibo: { receptor: { numeroSocio: 'asc' } } }
      ]
    });
  }

  async getStatistics(statsData: CuotaStatsDto): Promise<any> {
    const { fechaDesde, fechaHasta, agruparPor } = statsData;

    const where: Prisma.CuotaWhereInput = {
      recibo: {
        fecha: {
          gte: new Date(fechaDesde),
          lte: new Date(fechaHasta)
        }
      }
    };

    switch (agruparPor) {
      case 'categoria':
        return this.prisma.cuota.groupBy({
          by: ['categoriaId'],
          where,
          _count: {
            id: true
          },
          _sum: {
            montoTotal: true
          },
          _avg: {
            montoTotal: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        });

      case 'mes':
        return this.prisma.$queryRaw`
          SELECT
            EXTRACT(YEAR FROM r.fecha) as year,
            EXTRACT(MONTH FROM r.fecha) as month,
            c."categoriaId",
            COUNT(c.id)::int as count,
            SUM(c."montoTotal") as total_amount,
            AVG(c."montoTotal") as avg_amount
          FROM cuotas c
          JOIN recibos r ON c."reciboId" = r.id
          WHERE r.fecha >= ${new Date(fechaDesde)} AND r.fecha <= ${new Date(fechaHasta)}
          GROUP BY EXTRACT(YEAR FROM r.fecha), EXTRACT(MONTH FROM r.fecha), c."categoriaId"
          ORDER BY year DESC, month DESC, c."categoriaId" ASC
        `;

      case 'estado':
        return this.prisma.$queryRaw`
          SELECT
            r.estado,
            c."categoriaId",
            COUNT(c.id)::int as count,
            SUM(c."montoTotal") as total_amount,
            AVG(c."montoTotal") as avg_amount
          FROM cuotas c
          JOIN recibos r ON c."reciboId" = r.id
          WHERE r.fecha >= ${new Date(fechaDesde)} AND r.fecha <= ${new Date(fechaHasta)}
          GROUP BY r.estado, c."categoriaId"
          ORDER BY r.estado ASC, c."categoriaId" ASC
        `;

      default:
        // Estadísticas generales
        const aggregate = await this.prisma.cuota.aggregate({
          where,
          _count: {
            id: true
          },
          _sum: {
            montoTotal: true
          },
          _avg: {
            montoTotal: true
          }
        });

        // Formatear el resultado para que tenga la propiedad 'total' que espera el test
        return {
          total: aggregate._count.id,
          montoTotal: aggregate._sum.montoTotal ? parseFloat(aggregate._sum.montoTotal.toString()) : 0,
          montoPromedio: aggregate._avg.montoTotal ? parseFloat(aggregate._avg.montoTotal.toString()) : 0
        };
    }
  }

  async getVencidas(): Promise<Cuota[]> {
    const now = new Date();

    return this.prisma.cuota.findMany({
      where: {
        recibo: {
          fechaVencimiento: {
            not: null,
            lt: now
          },
          estado: {
            in: [EstadoRecibo.PENDIENTE, EstadoRecibo.VENCIDO]
          }
        }
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
                numeroSocio: true,
                categoria: true
              }
            }
          }
        }
      },
      orderBy: [
        { recibo: { fechaVencimiento: 'asc' } },
        { recibo: { receptor: { numeroSocio: 'asc' } } }
      ]
    });
  }

  async getPendientes(): Promise<Cuota[]> {
    return this.prisma.cuota.findMany({
      where: {
        recibo: {
          estado: EstadoRecibo.PENDIENTE
        }
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
                numeroSocio: true,
                categoria: true
              }
            }
          }
        }
      },
      orderBy: [
        { recibo: { fechaVencimiento: 'asc' } },
        { mes: 'asc' },
        { recibo: { receptor: { numeroSocio: 'asc' } } }
      ]
    });
  }

  async getMontoBasePorCategoria(categoriaId: number): Promise<number> {
    // Obtener el último monto base usado para esta categoría
    const ultimaCuota = await this.prisma.cuota.findFirst({
      where: { categoriaId },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' }
      ],
      select: {
        montoBase: true
      }
    });

    if (ultimaCuota) {
      return parseFloat(ultimaCuota.montoBase.toString());
    }

    // Si no hay cuotas previas, consultar el monto configurado en la categoría
    const categoria = await this.prisma.categoriaSocio.findUnique({
      where: { id: categoriaId },
      select: { montoCuota: true }
    });

    if (categoria) {
      return parseFloat(categoria.montoCuota.toString());
    }

    // Valor por defecto si no se encuentra la categoría
    return 5000;
  }

  async checkExistePeriodo(mes: number, anio: number, categoria: CategoriaSocio): Promise<boolean> {
    const count = await this.prisma.cuota.count({
      where: {
        mes,
        anio,
        categoria
      }
    });

    return count > 0;
  }

  async getCuotasPorGenerar(mes: number, anio: number, categorias?: CategoriaSocio[]): Promise<any[]> {
    // ✅ ARCHITECTURE V2: Usar tabla persona_tipo con relaciones many-to-many

    // 1. Construir filtro de categorías si se especifica
    const whereCategoria = categorias && categorias.length > 0
      ? { id: { in: categorias.map(c => typeof c === 'object' ? (c as any).id : c) } }
      : {};

    // 2. Obtener socios activos usando Architecture V2
    const sociosActivos = await this.prisma.persona.findMany({
      where: {
        activo: true,  // Persona activa
        tipos: {
          some: {
            activo: true,  // Tipo activo
            tipoPersona: {
              codigo: 'SOCIO'  // Es SOCIO
            },
            categoria: whereCategoria  // Filtro de categoría (si aplica)
          }
        }
      },
      include: {
        tipos: {
          where: {
            activo: true,
            tipoPersona: { codigo: 'SOCIO' }
          },
          include: {
            categoria: true,
            tipoPersona: true
          }
        }
      }
    });

    // 3. Si no hay socios, retornar vacío
    if (sociosActivos.length === 0) {
      return [];
    }

    // 4. Obtener cuotas ya generadas para este período
    const cuotasExistentes = await this.prisma.cuota.findMany({
      where: {
        mes,
        anio,
        recibo: {
          receptor: {
            id: {
              in: sociosActivos.map(s => s.id)
            }
          }
        }
      },
      select: {
        recibo: {
          select: {
            receptorId: true
          }
        }
      }
    });

    // 5. Crear set de socios que ya tienen cuota
    const sociosConCuota = new Set(cuotasExistentes.map(c => c.recibo.receptorId));

    // 6. Filtrar socios sin cuota y mapear a formato esperado
    return sociosActivos
      .filter(socio => !sociosConCuota.has(socio.id))
      .map(socio => {
        // Obtener el primer tipo SOCIO activo (puede haber múltiples categorías, usamos la primera)
        const tipoSocio = socio.tipos[0];

        return {
          id: socio.id,
          nombre: socio.nombre,
          apellido: socio.apellido,
          dni: socio.dni,
          numeroSocio: socio.numeroSocio,
          categoria: tipoSocio?.categoria || null,
          categoriaId: tipoSocio?.categoriaId || null
        };
      });
  }

  async getResumenMensual(mes: number, anio: number): Promise<any> {
    return this.prisma.$queryRaw`
      SELECT
        c."categoriaId",
        COUNT(c.id)::int as total_cuotas,
        COUNT(CASE WHEN r.estado = 'PENDIENTE' THEN 1 END)::int as pendientes,
        COUNT(CASE WHEN r.estado = 'PAGADO' THEN 1 END)::int as pagadas,
        COUNT(CASE WHEN r.estado = 'VENCIDO' THEN 1 END)::int as vencidas,
        COUNT(CASE WHEN r.estado = 'CANCELADO' THEN 1 END)::int as canceladas,
        SUM(c."montoTotal") as monto_total,
        SUM(CASE WHEN r.estado = 'PAGADO' THEN c."montoTotal" ELSE 0 END) as monto_cobrado,
        SUM(CASE WHEN r.estado IN ('PENDIENTE', 'VENCIDO') THEN c."montoTotal" ELSE 0 END) as monto_pendiente
      FROM cuotas c
      JOIN recibos r ON c."reciboId" = r.id
      WHERE c.mes = ${mes} AND c.anio = ${anio}
      GROUP BY c."categoriaId"
      ORDER BY c."categoriaId" ASC
    `;
  }
}