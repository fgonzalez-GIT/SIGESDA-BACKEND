"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedioPagoRepository = void 0;
const client_1 = require("@prisma/client");
class MedioPagoRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.medioPago.create({
            data: {
                ...data,
                importe: new client_1.Prisma.Decimal(data.importe),
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
    async findMany(filters) {
        const { page = 1, limit = 10, orderBy = 'fecha', orderDirection = 'desc', ...filterFields } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (filterFields.reciboId) {
            where.reciboId = filterFields.reciboId;
        }
        if (filterFields.tipo) {
            where.tipo = filterFields.tipo;
        }
        if (filterFields.importeMinimo || filterFields.importeMaximo) {
            where.importe = {};
            if (filterFields.importeMinimo) {
                where.importe.gte = new client_1.Prisma.Decimal(filterFields.importeMinimo);
            }
            if (filterFields.importeMaximo) {
                where.importe.lte = new client_1.Prisma.Decimal(filterFields.importeMaximo);
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
        const orderByClause = {};
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
    async findById(id) {
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
    async findByReciboId(reciboId) {
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
    async update(id, data) {
        const updateData = { ...data };
        if (updateData.importe !== undefined) {
            updateData.importe = new client_1.Prisma.Decimal(updateData.importe);
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
    async delete(id) {
        return this.prisma.medioPago.delete({
            where: { id }
        });
    }
    async deleteMany(ids) {
        return this.prisma.medioPago.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }
    async search(filters) {
        const { search, searchBy = 'all', ...filterFields } = filters;
        const where = {};
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
        const searchConditions = [];
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
            take: 50
        });
    }
    async getStats(filters) {
        const { fechaDesde, fechaHasta, agruparPor = 'tipo', reciboId } = filters;
        const where = {
            fecha: {
                gte: new Date(fechaDesde),
                lte: new Date(fechaHasta)
            }
        };
        if (reciboId) {
            where.reciboId = reciboId;
        }
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
        const result = {
            totalMediosPago,
            importeTotal,
            porTipo
        };
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
            const bancoMap = new Map();
            statsPorBanco.forEach(stat => {
                if (!stat.banco)
                    return;
                if (!bancoMap.has(stat.banco)) {
                    bancoMap.set(stat.banco, {
                        cantidad: 0,
                        importeTotal: 0,
                        tipos: new Set()
                    });
                }
                const bancoData = bancoMap.get(stat.banco);
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
    async validatePayment(reciboId, tolerancia = 0.01) {
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
        const importeTotalPagos = recibo.mediosPago.reduce((sum, mp) => sum + Number(mp.importe), 0);
        const diferencia = importeTotalPagos - importeRecibo;
        const esPagoCompleto = Math.abs(diferencia) <= tolerancia;
        let estado;
        if (esPagoCompleto) {
            estado = 'COMPLETO';
        }
        else if (diferencia < 0) {
            estado = 'PARCIAL';
        }
        else {
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
    async getConciliacionBancaria(filters) {
        const { banco, fechaDesde, fechaHasta, tipo } = filters;
        const where = {
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
    async findByTipo(tipo, limit) {
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
    async getTotalPagosByRecibo(reciboId) {
        const result = await this.prisma.medioPago.aggregate({
            where: { reciboId },
            _sum: { importe: true }
        });
        return Number(result._sum.importe || 0);
    }
    async checkDuplicateNumber(numero, tipo, excludeId) {
        const where = {
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
    async getQuickStats() {
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
        const porTipoHoyMap = {};
        Object.values(client_1.MedioPagoTipo).forEach(tipo => {
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
exports.MedioPagoRepository = MedioPagoRepository;
//# sourceMappingURL=medio-pago.repository.js.map