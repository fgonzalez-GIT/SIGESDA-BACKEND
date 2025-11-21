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
                            reserva_aulas: true,
                            reservas_aulas_secciones: true
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
                reserva_aulas: {
                    include: {
                        actividades: {
                            select: {
                                id: true,
                                nombre: true,
                                tipoActividadId: true
                            }
                        }
                    },
                    orderBy: {
                        fechaInicio: 'asc'
                    }
                },
                reservas_aulas_secciones: {
                    include: {
                        secciones_actividades: {
                            select: {
                                id: true,
                                nombre: true,
                                codigo: true
                            }
                        }
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
            aula_id: aulaId,
            OR: [
                {
                    fecha_vigencia_desde: {
                        gte: fechaInicio,
                        lt: fechaFin
                    }
                },
                {
                    fecha_vigencia_hasta: {
                        gt: fechaInicio,
                        lte: fechaFin
                    }
                },
                {
                    AND: [
                        { fecha_vigencia_desde: { lte: fechaInicio } },
                        {
                            OR: [
                                { fecha_vigencia_hasta: { gte: fechaFin } },
                                { fecha_vigencia_hasta: null }
                            ]
                        }
                    ]
                }
            ]
        };
        if (excluirReservaId) {
            where.id = { not: parseInt(excluirReservaId) };
        }
        const conflictingReservations = await this.prisma.reserva_aulas.findFirst({
            where: {
                aulaId: parseInt(aulaId),
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
            }
        });
        return !conflictingReservations;
    }
    async getReservasEnPeriodo(aulaId, fechaInicio, fechaFin) {
        return this.prisma.reserva_aulas.findMany({
            where: {
                aulaId: parseInt(aulaId),
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
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        tipoActividadId: true
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
                        reserva_aulas: true,
                        reservas_aulas_secciones: true
                    }
                }
            }
        });
        if (!aula)
            return null;
        const reservasConActividades = await this.prisma.reserva_aulas.findMany({
            where: {
                aulaId: parseInt(aulaId)
            },
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        tipoActividadId: true
                    }
                }
            }
        });
        const actividadMap = new Map();
        reservasConActividades.forEach(reserva => {
            if (reserva.actividades) {
                const actividadId = reserva.actividades.id;
                if (!actividadMap.has(actividadId)) {
                    actividadMap.set(actividadId, {
                        actividad: reserva.actividades,
                        count: 0
                    });
                }
                actividadMap.get(actividadId).count++;
            }
        });
        const reservasPorActividadConNombre = Array.from(actividadMap.values());
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const finMes = new Date(inicioMes);
        finMes.setMonth(finMes.getMonth() + 1);
        finMes.setDate(0);
        finMes.setHours(23, 59, 59, 999);
        const reservasMesActual = await this.prisma.reserva_aulas.count({
            where: {
                aulaId: parseInt(aulaId),
                fechaInicio: {
                    gte: inicioMes,
                    lte: finMes
                }
            }
        });
        return {
            totalReservas: aula._count.reserva_aulas,
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
                        reserva_aulas: true
                    }
                }
            },
            orderBy: {
                reserva_aulas: {
                    _count: 'asc'
                }
            }
        });
        return aulas.map(aula => ({
            id: aula.id,
            nombre: aula.nombre,
            capacidad: aula.capacidad,
            ubicacion: aula.ubicacion,
            totalReservas: aula._count.reserva_aulas
        }));
    }
}
exports.AulaRepository = AulaRepository;
//# sourceMappingURL=aula.repository.js.map