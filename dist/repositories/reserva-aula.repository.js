"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaAulaRepository = void 0;
class ReservaAulaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.reserva_aulas.create({
            data: {
                ...data,
                fechaInicio: new Date(data.fechaInicio),
                fechaFin: new Date(data.fechaFin)
            },
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        descripcion: true
                    }
                },
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        especialidad: true
                    }
                },
                estadoReserva: {
                    select: {
                        id: true,
                        codigo: true,
                        nombre: true
                    }
                },
                canceladoPor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                aprobadoPor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                }
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.aulaId) {
            where.aulaId = query.aulaId;
        }
        if (query.actividadId) {
            where.actividadId = query.actividadId;
        }
        if (query.docenteId) {
            where.docenteId = query.docenteId;
        }
        if (query.estadoReservaId) {
            where.estadoReservaId = query.estadoReservaId;
        }
        if (query.soloActivas) {
            where.activa = true;
        }
        if (query.fechaDesde || query.fechaHasta) {
            where.fechaInicio = {};
            if (query.fechaDesde) {
                where.fechaInicio.gte = new Date(query.fechaDesde);
            }
            if (query.fechaHasta) {
                where.fechaInicio.lte = new Date(query.fechaHasta);
            }
        }
        if (!query.incluirPasadas) {
            const now = new Date();
            if (!where.fechaFin) {
                where.fechaFin = {};
            }
            where.fechaFin.gte = now;
        }
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await Promise.all([
            this.prisma.reserva_aulas.findMany({
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
                            activa: true
                        }
                    },
                    actividad: {
                        select: {
                            id: true,
                            nombre: true,
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
                    },
                    estadoReserva: {
                        select: {
                            id: true,
                            codigo: true,
                            nombre: true
                        }
                    },
                    canceladoPor: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true
                        }
                    },
                    aprobadoPor: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true
                        }
                    }
                },
                orderBy: [
                    { fechaInicio: 'asc' },
                    { aulas: { nombre: 'asc' } }
                ]
            }),
            this.prisma.reserva_aulas.count({ where })
        ]);
        return { data, total };
    }
    async findById(id) {
        return this.prisma.reserva_aulas.findUnique({
            where: { id },
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        equipamiento: true,
                        activa: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        descripcion: true,
                        activa: true
                    }
                },
                personas: {
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
                },
                estadoReserva: {
                    select: {
                        id: true,
                        codigo: true,
                        nombre: true
                    }
                },
                canceladoPor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                aprobadoPor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                }
            }
        });
    }
    async findByAulaId(aulaId, incluirPasadas = false) {
        const where = { aulaId };
        if (!incluirPasadas) {
            const now = new Date();
            where.fechaFin = { gte: now };
        }
        return this.prisma.reserva_aulas.findMany({
            where,
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        especialidad: true
                    }
                },
                estadoReserva: {
                    select: {
                        id: true,
                        codigo: true,
                        nombre: true
                    }
                }
            },
            orderBy: { fechaInicio: 'asc' }
        });
    }
    async findByDocenteId(docenteId, incluirPasadas = false) {
        const where = { docenteId };
        if (!incluirPasadas) {
            const now = new Date();
            where.fechaFin = { gte: now };
        }
        return this.prisma.reserva_aulas.findMany({
            where,
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        ubicacion: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                estadoReserva: {
                    select: {
                        id: true,
                        codigo: true,
                        nombre: true
                    }
                }
            },
            orderBy: { fechaInicio: 'asc' }
        });
    }
    async findByActividadId(actividadId, incluirPasadas = false) {
        const where = { actividadId };
        if (!incluirPasadas) {
            const now = new Date();
            where.fechaFin = { gte: now };
        }
        return this.prisma.reserva_aulas.findMany({
            where,
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        ubicacion: true
                    }
                },
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                estadoReserva: {
                    select: {
                        id: true,
                        codigo: true,
                        nombre: true
                    }
                }
            },
            orderBy: { fechaInicio: 'asc' }
        });
    }
    async detectConflicts(conflictData) {
        const { aulaId, fechaInicio, fechaFin, excludeReservaId } = conflictData;
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const where = {
            aulaId,
            OR: [
                {
                    AND: [
                        { fechaInicio: { lt: fin } },
                        { fechaFin: { gt: inicio } }
                    ]
                }
            ]
        };
        if (excludeReservaId) {
            where.id = { not: excludeReservaId };
        }
        return this.prisma.reserva_aulas.findMany({
            where,
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                personas: {
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
    async update(id, data) {
        const updateData = { ...data };
        if (updateData.fechaInicio) {
            updateData.fechaInicio = new Date(updateData.fechaInicio);
        }
        if (updateData.fechaFin) {
            updateData.fechaFin = new Date(updateData.fechaFin);
        }
        return this.prisma.reserva_aulas.update({
            where: { id },
            data: updateData,
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        especialidad: true
                    }
                },
                estadoReserva: {
                    select: {
                        id: true,
                        codigo: true,
                        nombre: true
                    }
                },
                canceladoPor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                aprobadoPor: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                }
            }
        });
    }
    async delete(id) {
        return this.prisma.reserva_aulas.delete({
            where: { id }
        });
    }
    async deleteBulk(ids) {
        return this.prisma.reserva_aulas.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }
    async createBulk(reservas) {
        const data = reservas.map(reserva => ({
            ...reserva,
            fechaInicio: new Date(reserva.fechaInicio),
            fechaFin: new Date(reserva.fechaFin)
        }));
        return this.prisma.reserva_aulas.createMany({
            data,
            skipDuplicates: false
        });
    }
    async search(searchData) {
        const { search, searchBy, fechaDesde, fechaHasta, incluirPasadas } = searchData;
        let searchConditions = [];
        if (searchBy === 'all' || searchBy === 'aula') {
            searchConditions.push({
                aulas: {
                    nombre: { contains: search, mode: 'insensitive' }
                }
            });
        }
        if (searchBy === 'all' || searchBy === 'docente') {
            searchConditions.push({
                personas: {
                    OR: [
                        { nombre: { contains: search, mode: 'insensitive' } },
                        { apellido: { contains: search, mode: 'insensitive' } }
                    ]
                }
            });
        }
        if (searchBy === 'all' || searchBy === 'actividad') {
            searchConditions.push({
                actividades: {
                    nombre: { contains: search, mode: 'insensitive' }
                }
            });
        }
        if (searchBy === 'all' || searchBy === 'observaciones') {
            searchConditions.push({
                observaciones: { contains: search, mode: 'insensitive' }
            });
        }
        const where = {
            OR: searchConditions
        };
        if (fechaDesde || fechaHasta) {
            where.fechaInicio = {};
            if (fechaDesde) {
                where.fechaInicio.gte = new Date(fechaDesde);
            }
            if (fechaHasta) {
                where.fechaInicio.lte = new Date(fechaHasta);
            }
        }
        if (!incluirPasadas) {
            const now = new Date();
            if (!where.fechaFin) {
                where.fechaFin = {};
            }
            where.fechaFin.gte = now;
        }
        return this.prisma.reserva_aulas.findMany({
            where,
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        ubicacion: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        especialidad: true
                    }
                },
                estadoReserva: {
                    select: {
                        id: true,
                        codigo: true,
                        nombre: true
                    }
                }
            },
            orderBy: { fechaInicio: 'asc' }
        });
    }
    async getStatistics(statsData) {
        const { fechaDesde, fechaHasta, agruparPor } = statsData;
        const where = {
            fechaInicio: {
                gte: new Date(fechaDesde),
                lte: new Date(fechaHasta)
            }
        };
        switch (agruparPor) {
            case 'aula':
                return this.prisma.reserva_aulas.groupBy({
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
                return this.prisma.reserva_aulas.groupBy({
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
                return this.prisma.reserva_aulas.groupBy({
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
                return this.prisma.reserva_aulas.aggregate({
                    where,
                    _count: {
                        id: true
                    }
                });
        }
    }
    async getUpcomingReservations(limit = 10) {
        const now = new Date();
        return this.prisma.reserva_aulas.findMany({
            where: {
                fechaInicio: {
                    gte: now
                }
            },
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        ubicacion: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                estadoReserva: {
                    select: {
                        id: true,
                        codigo: true,
                        nombre: true
                    }
                }
            },
            orderBy: { fechaInicio: 'asc' },
            take: limit
        });
    }
    async getCurrentReservations() {
        const now = new Date();
        return this.prisma.reserva_aulas.findMany({
            where: {
                fechaInicio: {
                    lte: now
                },
                fechaFin: {
                    gte: now
                }
            },
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        ubicacion: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                estadoReserva: {
                    select: {
                        id: true,
                        codigo: true,
                        nombre: true
                    }
                }
            },
            orderBy: { fechaInicio: 'asc' }
        });
    }
    async detectRecurrentConflicts(conflictData) {
        const { aulaId, fechaInicio, fechaFin } = conflictData;
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diaSemana = inicio.getDay();
        const DIAS_MAP = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const diaEnum = DIAS_MAP[diaSemana];
        const recurrentReservations = await this.prisma.reservas_aulas_secciones.findMany({
            where: {
                aulaId,
                diaSemana: diaEnum,
                fechaVigencia: { lte: inicio },
                OR: [
                    { fechaFin: null },
                    { fechaFin: { gte: inicio } }
                ]
            },
            include: {
                secciones_actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        actividades: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        }
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            }
        });
        const conflicts = [];
        const horaInicio = inicio.getHours() * 60 + inicio.getMinutes();
        const horaFin = fin.getHours() * 60 + fin.getMinutes();
        for (const reserva of recurrentReservations) {
            const [reservaHoraInicioH, reservaHoraInicioM] = reserva.horaInicio.split(':').map(Number);
            const [reservaHoraFinH, reservaHoraFinM] = reserva.horaFin.split(':').map(Number);
            const reservaHoraInicioMinutos = reservaHoraInicioH * 60 + reservaHoraInicioM;
            const reservaHoraFinMinutos = reservaHoraFinH * 60 + reservaHoraFinM;
            if (horaInicio < reservaHoraFinMinutos && horaFin > reservaHoraInicioMinutos) {
                conflicts.push({
                    tipo: 'RECURRENTE',
                    seccionId: reserva.seccionId,
                    aulaId: reserva.aulaId,
                    diaSemana: reserva.diaSemana,
                    horaInicio: reserva.horaInicio,
                    horaFin: reserva.horaFin,
                    seccion: reserva.secciones_actividades,
                    aula: reserva.aulas
                });
            }
        }
        return conflicts;
    }
}
exports.ReservaAulaRepository = ReservaAulaRepository;
//# sourceMappingURL=reserva-aula.repository.js.map