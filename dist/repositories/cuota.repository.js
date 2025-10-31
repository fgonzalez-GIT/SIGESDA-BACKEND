"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CuotaRepository = void 0;
const client_1 = require("@prisma/client");
class CuotaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.cuota.create({
            data: {
                ...data,
                montoBase: new client_1.Prisma.Decimal(data.montoBase),
                montoActividades: new client_1.Prisma.Decimal(data.montoActividades),
                montoTotal: new client_1.Prisma.Decimal(data.montoTotal)
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
    async findAll(query) {
        const where = {};
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
        if (query.soloImpagas) {
            where.recibo = {
                ...where.recibo,
                estado: {
                    in: [client_1.EstadoRecibo.PENDIENTE, client_1.EstadoRecibo.VENCIDO]
                }
            };
        }
        if (query.soloVencidas) {
            const now = new Date();
            where.recibo = {
                ...where.recibo,
                fechaVencimiento: {
                    not: null,
                    lt: now
                },
                estado: {
                    in: [client_1.EstadoRecibo.PENDIENTE, client_1.EstadoRecibo.VENCIDO]
                }
            };
        }
        const skip = (query.page - 1) * query.limit;
        let orderBy = [];
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
    async findById(id) {
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
    async findByReciboId(reciboId) {
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
    async findByPeriodo(mes, anio, categoria) {
        const where = {
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
                { categoria: 'asc' },
                { recibo: { receptor: { numeroSocio: 'asc' } } }
            ]
        });
    }
    async findBySocio(socioId, limit) {
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
    async update(id, data) {
        const updateData = { ...data };
        if (updateData.montoBase !== undefined) {
            updateData.montoBase = new client_1.Prisma.Decimal(updateData.montoBase);
        }
        if (updateData.montoActividades !== undefined) {
            updateData.montoActividades = new client_1.Prisma.Decimal(updateData.montoActividades);
        }
        if (updateData.montoTotal !== undefined) {
            updateData.montoTotal = new client_1.Prisma.Decimal(updateData.montoTotal);
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
    async delete(id) {
        return this.prisma.cuota.delete({
            where: { id }
        });
    }
    async deleteBulk(ids) {
        return this.prisma.cuota.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }
    async search(searchData) {
        const { search, searchBy, categoria, mes, anio, estado } = searchData;
        let searchConditions = [];
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
        const where = {
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
                estado: estado
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
    async getStatistics(statsData) {
        const { fechaDesde, fechaHasta, agruparPor } = statsData;
        const where = {
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
                    by: ['categoria'],
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
                return this.prisma.$queryRaw `
          SELECT
            EXTRACT(YEAR FROM r.fecha) as year,
            EXTRACT(MONTH FROM r.fecha) as month,
            c.categoria,
            COUNT(c.id)::int as count,
            SUM(c."montoTotal") as total_amount,
            AVG(c."montoTotal") as avg_amount
          FROM cuotas c
          JOIN recibos r ON c."reciboId" = r.id
          WHERE r.fecha >= ${new Date(fechaDesde)} AND r.fecha <= ${new Date(fechaHasta)}
          GROUP BY EXTRACT(YEAR FROM r.fecha), EXTRACT(MONTH FROM r.fecha), c.categoria
          ORDER BY year DESC, month DESC, c.categoria ASC
        `;
            case 'estado':
                return this.prisma.$queryRaw `
          SELECT
            r.estado,
            c.categoria,
            COUNT(c.id)::int as count,
            SUM(c."montoTotal") as total_amount,
            AVG(c."montoTotal") as avg_amount
          FROM cuotas c
          JOIN recibos r ON c."reciboId" = r.id
          WHERE r.fecha >= ${new Date(fechaDesde)} AND r.fecha <= ${new Date(fechaHasta)}
          GROUP BY r.estado, c.categoria
          ORDER BY r.estado ASC, c.categoria ASC
        `;
            default:
                return this.prisma.cuota.aggregate({
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
        }
    }
    async getVencidas() {
        const now = new Date();
        return this.prisma.cuota.findMany({
            where: {
                recibo: {
                    fechaVencimiento: {
                        not: null,
                        lt: now
                    },
                    estado: {
                        in: [client_1.EstadoRecibo.PENDIENTE, client_1.EstadoRecibo.VENCIDO]
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
    async getPendientes() {
        return this.prisma.cuota.findMany({
            where: {
                recibo: {
                    estado: client_1.EstadoRecibo.PENDIENTE
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
    async getMontoBasePorCategoria(categoria) {
        const ultimaCuota = await this.prisma.cuota.findFirst({
            where: { categoria },
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
        const montosBase = {
            [client_1.CategoriaSocio.ACTIVO]: 25000,
            [client_1.CategoriaSocio.ESTUDIANTE]: 15000,
            [client_1.CategoriaSocio.FAMILIAR]: 12000,
            [client_1.CategoriaSocio.JUBILADO]: 18000
        };
        return montosBase[categoria];
    }
    async checkExistePeriodo(mes, anio, categoria) {
        const count = await this.prisma.cuota.count({
            where: {
                mes,
                anio,
                categoria
            }
        });
        return count > 0;
    }
    async getCuotasPorGenerar(mes, anio, categorias) {
        const wherePersona = {
            tipo: 'SOCIO',
            fechaBaja: null
        };
        if (categorias && categorias.length > 0) {
            wherePersona.categoria = {
                in: categorias
            };
        }
        const sociosActivos = await this.prisma.persona.findMany({
            where: wherePersona,
            select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
                numeroSocio: true,
                categoria: true
            }
        });
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
        const sociosConCuota = new Set(cuotasExistentes.map(c => c.recibo.receptorId));
        return sociosActivos.filter(socio => !sociosConCuota.has(socio.id));
    }
    async getResumenMensual(mes, anio) {
        return this.prisma.$queryRaw `
      SELECT
        c.categoria,
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
      GROUP BY c.categoria
      ORDER BY c.categoria ASC
    `;
    }
}
exports.CuotaRepository = CuotaRepository;
//# sourceMappingURL=cuota.repository.js.map