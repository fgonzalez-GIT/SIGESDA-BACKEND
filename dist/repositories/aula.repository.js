"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AulaRepository = void 0;
class AulaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.aula.create({
            data
        });
    }
    async findAll(query) {
        const where = {};
        if (query.activa !== undefined) {
            where.activa = query.activa;
        }
        if (query.capacidadMinima !== undefined || query.capacidadMaxima !== undefined) {
            where.capacidad = {};
            if (query.capacidadMinima !== undefined) {
                where.capacidad.gte = query.capacidadMinima;
            }
            if (query.capacidadMaxima !== undefined) {
                where.capacidad.lte = query.capacidadMaxima;
            }
        }
        if (query.conEquipamiento !== undefined) {
            if (query.conEquipamiento) {
                where.equipamiento = {
                    not: null
                };
            }
            else {
                where.equipamiento = null;
            }
        }
        if (query.search) {
            where.OR = [
                { nombre: { contains: query.search, mode: 'insensitive' } },
                { ubicacion: { contains: query.search, mode: 'insensitive' } },
                { equipamiento: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await Promise.all([
            this.prisma.aula.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: [
                    { activa: 'desc' },
                    { nombre: 'asc' }
                ],
                include: {
                    _count: {
                        select: {
                            reservas: true
                        }
                    }
                }
            }),
            this.prisma.aula.count({ where })
        ]);
        return { data, total };
    }
    async findById(id) {
        return this.prisma.aula.findUnique({
            where: { id },
            include: {
                reservas: {
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
                    orderBy: {
                        fechaInicio: 'asc'
                    }
                }
            }
        });
    }
    async findByNombre(nombre) {
        return this.prisma.aula.findUnique({
            where: { nombre }
        });
    }
    async update(id, data) {
        return this.prisma.aula.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return this.prisma.aula.delete({
            where: { id }
        });
    }
    async softDelete(id) {
        return this.prisma.aula.update({
            where: { id },
            data: { activa: false }
        });
    }
    async getDisponibles() {
        return this.prisma.aula.findMany({
            where: { activa: true },
            orderBy: [
                { capacidad: 'asc' },
                { nombre: 'asc' }
            ]
        });
    }
    async verificarDisponibilidad(aulaId, fechaInicio, fechaFin, excluirReservaId) {
        const where = {
            aulaId,
            OR: [
                {
                    fechaInicio: {
                        gte: fechaInicio,
                        lt: fechaFin
                    }
                },
                {
                    fechaFin: {
                        gt: fechaInicio,
                        lte: fechaFin
                    }
                },
                {
                    AND: [
                        { fechaInicio: { lte: fechaInicio } },
                        { fechaFin: { gte: fechaFin } }
                    ]
                }
            ]
        };
        if (excluirReservaId) {
            where.id = { not: excluirReservaId };
        }
        const conflictingReservations = await this.prisma.reservaAula.findFirst({
            where
        });
        return !conflictingReservations;
    }
    async getReservasEnPeriodo(aulaId, fechaInicio, fechaFin) {
        return this.prisma.reservaAula.findMany({
            where: {
                aulaId,
                OR: [
                    {
                        fechaInicio: {
                            gte: fechaInicio,
                            lte: fechaFin
                        }
                    },
                    {
                        fechaFin: {
                            gte: fechaInicio,
                            lte: fechaFin
                        }
                    },
                    {
                        AND: [
                            { fechaInicio: { lte: fechaInicio } },
                            { fechaFin: { gte: fechaFin } }
                        ]
                    }
                ]
            },
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
                        apellido: true
                    }
                }
            },
            orderBy: {
                fechaInicio: 'asc'
            }
        });
    }
    async getEstadisticas(aulaId) {
        const aula = await this.prisma.aula.findUnique({
            where: { id: aulaId },
            include: {
                _count: {
                    select: {
                        reservas: true
                    }
                }
            }
        });
        if (!aula)
            return null;
        const reservasPorActividad = await this.prisma.reservaAula.groupBy({
            by: ['actividadId'],
            where: {
                aulaId,
                actividadId: { not: null }
            },
            _count: true
        });
        const actividadIds = reservasPorActividad
            .map(r => r.actividadId)
            .filter(id => id !== null);
        const actividades = await this.prisma.actividad.findMany({
            where: { id: { in: actividadIds } },
            select: { id: true, nombre: true, tipo: true }
        });
        const reservasPorActividadConNombre = reservasPorActividad.map(reserva => {
            const actividad = actividades.find(a => a.id === reserva.actividadId);
            return {
                actividad: actividad || { nombre: 'Sin actividad', tipo: null },
                count: reserva._count
            };
        });
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const finMes = new Date(inicioMes);
        finMes.setMonth(finMes.getMonth() + 1);
        finMes.setDate(0);
        finMes.setHours(23, 59, 59, 999);
        const reservasMesActual = await this.prisma.reservaAula.count({
            where: {
                aulaId,
                fechaInicio: {
                    gte: inicioMes,
                    lte: finMes
                }
            }
        });
        return {
            totalReservas: aula._count.reservas,
            capacidad: aula.capacidad,
            reservasPorActividad: reservasPorActividadConNombre,
            reservasMesActual,
            aulaInfo: {
                nombre: aula.nombre,
                ubicacion: aula.ubicacion,
                equipamiento: aula.equipamiento
            }
        };
    }
    async getAulasConMenorUso() {
        const aulas = await this.prisma.aula.findMany({
            where: { activa: true },
            include: {
                _count: {
                    select: {
                        reservas: true
                    }
                }
            },
            orderBy: {
                reservas: {
                    _count: 'asc'
                }
            }
        });
        return aulas.map(aula => ({
            id: aula.id,
            nombre: aula.nombre,
            capacidad: aula.capacidad,
            ubicacion: aula.ubicacion,
            totalReservas: aula._count.reservas
        }));
    }
}
exports.AulaRepository = AulaRepository;
//# sourceMappingURL=aula.repository.js.map