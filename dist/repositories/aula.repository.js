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
                            reservas_aulas_actividades: true
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
                reservas_aulas_actividades: {
                    include: {
                        horarios_actividades: {
                            include: {
                                actividades: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        tipo_actividad_id: true
                                    }
                                },
                                dias_semana: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        codigo: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        fecha_vigencia_desde: 'asc'
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
        const conflictingReservations = await this.prisma.reservas_aulas_actividades.findFirst({
            where
        });
        return !conflictingReservations;
    }
    async getReservasEnPeriodo(aulaId, fechaInicio, fechaFin) {
        return this.prisma.reservas_aulas_actividades.findMany({
            where: {
                aula_id: aulaId,
                OR: [
                    {
                        fecha_vigencia_desde: {
                            gte: fechaInicio,
                            lte: fechaFin
                        }
                    },
                    {
                        fecha_vigencia_hasta: {
                            gte: fechaInicio,
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
            },
            include: {
                horarios_actividades: {
                    include: {
                        actividades: {
                            select: {
                                id: true,
                                nombre: true,
                                tipo_actividad_id: true
                            }
                        },
                        dias_semana: {
                            select: {
                                nombre: true,
                                codigo: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                fecha_vigencia_desde: 'asc'
            }
        });
    }
    async getEstadisticas(aulaId) {
        const aula = await this.prisma.aula.findUnique({
            where: { id: aulaId },
            include: {
                _count: {
                    select: {
                        reservas_aulas_actividades: true
                    }
                }
            }
        });
        if (!aula)
            return null;
        const reservasConActividades = await this.prisma.reservas_aulas_actividades.findMany({
            where: {
                aula_id: aulaId
            },
            include: {
                horarios_actividades: {
                    include: {
                        actividades: {
                            select: {
                                id: true,
                                nombre: true,
                                tipo_actividad_id: true
                            }
                        }
                    }
                }
            }
        });
        const actividadMap = new Map();
        reservasConActividades.forEach(reserva => {
            const actividadId = reserva.horarios_actividades.actividades.id;
            if (!actividadMap.has(actividadId)) {
                actividadMap.set(actividadId, {
                    actividad: reserva.horarios_actividades.actividades,
                    count: 0
                });
            }
            actividadMap.get(actividadId).count++;
        });
        const reservasPorActividadConNombre = Array.from(actividadMap.values());
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const finMes = new Date(inicioMes);
        finMes.setMonth(finMes.getMonth() + 1);
        finMes.setDate(0);
        finMes.setHours(23, 59, 59, 999);
        const reservasMesActual = await this.prisma.reservas_aulas_actividades.count({
            where: {
                aula_id: aulaId,
                fecha_vigencia_desde: {
                    gte: inicioMes,
                    lte: finMes
                }
            }
        });
        return {
            totalReservas: aula._count.reservas_aulas_actividades,
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
                        reservas_aulas_actividades: true
                    }
                }
            },
            orderBy: {
                reservas_aulas_actividades: {
                    _count: 'asc'
                }
            }
        });
        return aulas.map(aula => ({
            id: aula.id,
            nombre: aula.nombre,
            capacidad: aula.capacidad,
            ubicacion: aula.ubicacion,
            totalReservas: aula._count.reservas_aulas_actividades
        }));
    }
}
exports.AulaRepository = AulaRepository;
//# sourceMappingURL=aula.repository.js.map