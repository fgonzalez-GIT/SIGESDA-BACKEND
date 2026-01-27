"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReciboRepository = void 0;
const client_1 = require("@prisma/client");
class ReciboRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
                receptor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
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
                mediosPago: {
                    orderBy: { fecha: 'desc' }
                }
            }
        });
    }
    async findAll(query) {
        const where = {};
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
        if (query.fechaDesde || query.fechaHasta) {
            where.fecha = {};
            if (query.fechaDesde) {
                where.fecha.gte = new Date(query.fechaDesde);
            }
            if (query.fechaHasta) {
                where.fecha.lte = new Date(query.fechaHasta);
            }
        }
        if (query.importeMinimo || query.importeMaximo) {
            where.importe = {};
            if (query.importeMinimo) {
                where.importe.gte = query.importeMinimo;
            }
            if (query.importeMaximo) {
                where.importe.lte = query.importeMaximo;
            }
        }
        if (query.vencidosOnly) {
            const now = new Date();
            where.AND = [
                { fechaVencimiento: { not: null } },
                { fechaVencimiento: { lt: now } },
                { estado: { in: [client_1.EstadoRecibo.PENDIENTE, client_1.EstadoRecibo.VENCIDO] } }
            ];
        }
        if (query.pendientesOnly) {
            where.estado = client_1.EstadoRecibo.PENDIENTE;
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
                    receptor: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            dni: true,
                            numeroSocio: true,
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
    async findById(id) {
        return this.prisma.recibo.findUnique({
            where: { id },
            include: {
                emisor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        email: true,
                        telefono: true,
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
                receptor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
                        email: true,
                        telefono: true,
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
                mediosPago: {
                    orderBy: { fecha: 'desc' }
                },
                cuota: {
                    include: {
                        recibo: false
                    }
                }
            }
        });
    }
    async findByNumero(numero) {
        return this.prisma.recibo.findUnique({
            where: { numero },
            include: {
                emisor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
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
                receptor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
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
                mediosPago: true
            }
        });
    }
    async findByPersonaId(personaId, tipo) {
        const where = {};
        if (tipo === 'emisor') {
            where.emisorId = personaId;
        }
        else if (tipo === 'receptor') {
            where.receptorId = personaId;
        }
        else {
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
                receptor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
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
                mediosPago: true
            },
            orderBy: { fecha: 'desc' }
        });
    }
    async update(id, data) {
        const updateData = { ...data };
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
                receptor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
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
                mediosPago: true
            }
        });
    }
    async updateEstado(id, nuevoEstado, observaciones) {
        const updateData = { estado: nuevoEstado };
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
                receptor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
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
                mediosPago: true
            }
        });
    }
    async delete(id) {
        return this.prisma.recibo.delete({
            where: { id }
        });
    }
    async deleteBulk(ids) {
        return this.prisma.recibo.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }
    async createBulk(recibos) {
        const data = recibos.map(recibo => ({
            ...recibo,
            fecha: recibo.fecha ? new Date(recibo.fecha) : new Date(),
            fechaVencimiento: recibo.fechaVencimiento ? new Date(recibo.fechaVencimiento) : null
        }));
        return this.prisma.recibo.createMany({
            data,
            skipDuplicates: false
        });
    }
    async updateBulkEstados(ids, nuevoEstado, observaciones) {
        const updateData = { estado: nuevoEstado };
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
    async search(searchData) {
        const { search, searchBy, tipo, estado, fechaDesde, fechaHasta } = searchData;
        let searchConditions = [];
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
        const where = {
            OR: searchConditions
        };
        if (tipo) {
            where.tipo = tipo;
        }
        if (estado) {
            where.estado = estado;
        }
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
                receptor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
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
                mediosPago: true
            },
            orderBy: { fecha: 'desc' }
        });
    }
    async getStatistics(statsData) {
        const { fechaDesde, fechaHasta, agruparPor } = statsData;
        const where = {
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
                return this.prisma.$queryRaw `
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
    async getVencidos() {
        const now = new Date();
        return this.prisma.recibo.findMany({
            where: {
                fechaVencimiento: {
                    not: null,
                    lt: now
                },
                estado: {
                    in: [client_1.EstadoRecibo.PENDIENTE, client_1.EstadoRecibo.VENCIDO]
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
    async getPendientes() {
        return this.prisma.recibo.findMany({
            where: {
                estado: client_1.EstadoRecibo.PENDIENTE
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
    async markVencidosAsVencido() {
        const now = new Date();
        return this.prisma.recibo.updateMany({
            where: {
                fechaVencimiento: {
                    not: null,
                    lt: now
                },
                estado: client_1.EstadoRecibo.PENDIENTE
            },
            data: {
                estado: client_1.EstadoRecibo.VENCIDO
            }
        });
    }
}
exports.ReciboRepository = ReciboRepository;
//# sourceMappingURL=recibo.repository.js.map