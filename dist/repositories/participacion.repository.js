"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipacionRepository = void 0;
class ParticipacionRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.participacion_actividades.create({
            data: {
                personaId: data.personaId,
                actividadId: data.actividadId,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin || null,
                precioEspecial: data.precioEspecial ? Number(data.precioEspecial) : null,
                activa: data.activa !== undefined ? data.activa : true,
                observaciones: data.observaciones || null
            },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        email: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        descripcion: true,
                        capacidadMaxima: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.personaId) {
            where.personaId = query.personaId;
        }
        if (query.actividadId) {
            where.actividadId = query.actividadId;
        }
        if (query.activa !== undefined) {
            where.activa = query.activa;
        }
        if (query.fechaDesde || query.fechaHasta) {
            where.fechaInicio = {};
            if (query.fechaDesde) {
                where.fechaInicio.gte = query.fechaDesde;
            }
            if (query.fechaHasta) {
                where.fechaInicio.lte = query.fechaHasta;
            }
        }
        if (query.conPrecioEspecial !== undefined) {
            if (query.conPrecioEspecial) {
                where.precioEspecial = { not: null };
            }
            else {
                where.precioEspecial = null;
            }
        }
        if (query.search) {
            where.OR = [
                {
                    personas: {
                        OR: [
                            { nombre: { contains: query.search, mode: 'insensitive' } },
                            { apellido: { contains: query.search, mode: 'insensitive' } }
                        ]
                    }
                },
                {
                    actividades: {
                        nombre: { contains: query.search, mode: 'insensitive' }
                    }
                }
            ];
        }
        const orderBy = {};
        switch (query.sortBy) {
            case 'persona':
                orderBy.personas = { apellido: query.sortOrder };
                break;
            case 'actividad':
                orderBy.actividades = { nombre: query.sortOrder };
                break;
            default:
                orderBy[query.sortBy] = query.sortOrder;
                break;
        }
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await Promise.all([
            this.prisma.participacion_actividades.findMany({
                where,
                skip,
                take: query.limit,
                orderBy,
                include: {
                    personas: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            tipo: true,
                            dni: true,
                            email: true
                        }
                    },
                    actividades: {
                        select: {
                            id: true,
                            nombre: true,
                            codigo_actividad: true,
                            descripcion: true,
                            capacidadMaxima: true,
                            costo: true
                        }
                    }
                }
            }),
            this.prisma.participacion_actividades.count({ where })
        ]);
        return { data, total };
    }
    async findById(id) {
        return this.prisma.participacion_actividades.findUnique({
            where: { id },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        email: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo_actividad: true,
                        costo: true,
                        descripcion: true,
                        cupo_maximo: true
                    }
                }
            }
        });
    }
    async findByPersonaId(personaId) {
        return this.prisma.participacion_actividades.findMany({
            where: { personaId: personaId },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            },
            orderBy: { fechaInicio: 'desc' }
        });
    }
    async findByActividadId(actividadId) {
        return this.prisma.participacion_actividades.findMany({
            where: { actividadId: actividadId },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            },
            orderBy: { fechaInicio: 'desc' }
        });
    }
    async findByPersonaAndActividad(personaId, actividadId) {
        return this.prisma.participacion_actividades.findFirst({
            where: {
                personaId: personaId,
                actividadId: actividadId
            },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            }
        });
    }
    async findParticipacionesActivas(personaId) {
        const where = {
            activa: true,
            OR: [
                { fechaFin: null },
                { fechaFin: { gt: new Date() } }
            ]
        };
        if (personaId) {
            where.personaId = personaId;
        }
        return this.prisma.participacion_actividades.findMany({
            where,
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            },
            orderBy: { fechaInicio: 'desc' }
        });
    }
    async update(id, data) {
        const updateData = {};
        if (data.personaId !== undefined)
            updateData.personaId = data.personaId;
        if (data.actividadId !== undefined)
            updateData.actividadId = data.actividadId;
        if (data.fechaInicio !== undefined)
            updateData.fechaInicio = data.fechaInicio;
        if (data.fechaFin !== undefined)
            updateData.fechaFin = data.fechaFin || null;
        if (data.precioEspecial !== undefined)
            updateData.precioEspecial = data.precioEspecial ? Number(data.precioEspecial) : null;
        if (data.activa !== undefined)
            updateData.activa = data.activa;
        if (data.observaciones !== undefined)
            updateData.observaciones = data.observaciones || null;
        return this.prisma.participacion_actividades.update({
            where: { id },
            data: updateData,
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            }
        });
    }
    async delete(id) {
        return this.prisma.participacion_actividades.delete({
            where: { id },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            }
        });
    }
    async finalizarParticipacion(id, fechaFin, motivo) {
        const updateData = {
            activa: false,
            fechaFin: fechaFin || new Date()
        };
        if (motivo) {
            updateData.observaciones = motivo;
        }
        return this.prisma.participacion_actividades.update({
            where: { id },
            data: updateData,
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            }
        });
    }
    async reactivarParticipacion(id) {
        return this.prisma.participacion_actividades.update({
            where: { id },
            data: {
                activa: true,
                fechaFin: null
            },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            }
        });
    }
    async verificarConflictosHorarios(personaId, fechaInicio, fechaFin, excluirId) {
        const where = {
            personaId: personaId,
            activa: true,
            OR: [
                {
                    AND: [
                        { fechaInicio: { lte: fechaInicio } },
                        {
                            OR: [
                                { fechaFin: null },
                                { fechaFin: { gte: fechaInicio } }
                            ]
                        }
                    ]
                }
            ]
        };
        if (fechaFin) {
            where.OR.push({
                AND: [
                    { fechaInicio: { lte: fechaFin } },
                    {
                        OR: [
                            { fechaFin: null },
                            { fechaFin: { gte: fechaInicio } }
                        ]
                    }
                ]
            });
        }
        if (excluirId) {
            where.id = { not: excluirId };
        }
        return this.prisma.participacion_actividades.findMany({
            where,
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            }
        });
    }
    async contarParticipantesPorActividad(actividadId) {
        const [total, activos] = await Promise.all([
            this.prisma.participacion_actividades.count({
                where: { actividadId: actividadId }
            }),
            this.prisma.participacion_actividades.count({
                where: { actividadId: actividadId, activa: true }
            })
        ]);
        return {
            total,
            activos,
            inactivos: total - activos
        };
    }
    async getEstadisticasParticipacion(params) {
        const where = {};
        if (params.fechaDesde || params.fechaHasta) {
            where.fechaInicio = {};
            if (params.fechaDesde)
                where.fechaInicio.gte = params.fechaDesde;
            if (params.fechaHasta)
                where.fechaInicio.lte = params.fechaHasta;
        }
        if (params.soloActivas) {
            where.activa = true;
        }
        switch (params.agruparPor) {
            case 'actividad':
                return this.prisma.participacion_actividades.groupBy({
                    by: ['actividadId'],
                    where,
                    _count: {
                        actividadId: true
                    },
                    orderBy: {
                        _count: {
                            actividadId: 'desc'
                        }
                    }
                });
            case 'persona':
                return this.prisma.participacion_actividades.groupBy({
                    by: ['personaId'],
                    where,
                    _count: {
                        personaId: true
                    },
                    orderBy: {
                        _count: {
                            personaId: 'desc'
                        }
                    }
                });
            case 'tipo_actividad':
                return this.prisma.$queryRaw `
          SELECT a.tipo, COUNT(pa.id)::int as count
          FROM "participacion_actividades" pa
          JOIN "actividades" a ON pa."actividadId" = a.id
          WHERE ($1::timestamp IS NULL OR pa."fechaInicio" >= $1::timestamp)
            AND ($2::timestamp IS NULL OR pa."fechaInicio" <= $2::timestamp)
            AND ($3::boolean IS NULL OR pa.activa = $3::boolean)
          GROUP BY a.tipo
          ORDER BY count DESC
        `;
            case 'mes':
            default:
                return this.prisma.$queryRaw `
          SELECT
            DATE_TRUNC('month', "fechaInicio") as mes,
            COUNT(*)::int as count
          FROM "participacion_actividades"
          WHERE ($1::timestamp IS NULL OR "fechaInicio" >= $1::timestamp)
            AND ($2::timestamp IS NULL OR "fechaInicio" <= $2::timestamp)
            AND ($3::boolean IS NULL OR activa = $3::boolean)
          GROUP BY DATE_TRUNC('month', "fechaInicio")
          ORDER BY mes DESC
        `;
        }
    }
    async getParticipacionesPorVencer(diasAnticipacion = 30) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);
        return this.prisma.participacion_actividades.findMany({
            where: {
                activa: true,
                fechaFin: {
                    not: null,
                    lte: fechaLimite
                }
            },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        email: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            },
            orderBy: { fechaFin: 'asc' }
        });
    }
    async bulkCreate(participaciones) {
        const result = await this.prisma.$transaction(participaciones.map(participacion => this.prisma.participacion_actividades.create({
            data: {
                ...participacion,
                precioEspecial: participacion.precioEspecial ? Number(participacion.precioEspecial) : null
            }
        })));
        return result.length;
    }
    async transferirParticipacion(id, nuevaActividadId, fechaTransferencia, conservarFechaInicio = false) {
        const updateData = {
            actividadId: nuevaActividadId
        };
        if (!conservarFechaInicio) {
            updateData.fechaInicio = fechaTransferencia;
        }
        return this.prisma.participacion_actividades.update({
            where: { id },
            data: updateData,
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            }
        });
    }
    async getReporteInasistencias(params) {
        const where = {
            fechaInicio: {
                gte: params.fechaDesde,
                lte: params.fechaHasta
            },
            activa: true
        };
        if (params.actividadId) {
            where.actividadId = params.actividadId;
        }
        return this.prisma.participacion_actividades.findMany({
            where,
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        email: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        descripcion: true,
                        capacidadMaxima: true,
                        costo: true,
                        tipoActividadId: true
                    }
                }
            }
        });
    }
}
exports.ParticipacionRepository = ParticipacionRepository;
//# sourceMappingURL=participacion.repository.js.map