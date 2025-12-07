"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadAulaRepository = void 0;
class ActividadAulaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.actividades_aulas.create({
            data: {
                actividadId: data.actividadId,
                aulaId: data.aulaId,
                fechaAsignacion: data.fechaAsignacion ? new Date(data.fechaAsignacion) : new Date(),
                fechaDesasignacion: data.fechaDesasignacion ? new Date(data.fechaDesasignacion) : null,
                activa: data.activa !== undefined ? data.activa : true,
                prioridad: data.prioridad || 1,
                observaciones: data.observaciones || null
            },
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        capacidadMaxima: true,
                        activa: true,
                        descripcion: true
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true,
                        tipoAulaId: true
                    }
                }
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.actividadId) {
            where.actividadId = query.actividadId;
        }
        if (query.aulaId) {
            where.aulaId = query.aulaId;
        }
        if (query.activa !== undefined) {
            where.activa = query.activa;
        }
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await Promise.all([
            this.prisma.actividades_aulas.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: [
                    { activa: 'desc' },
                    { prioridad: 'asc' },
                    { fechaAsignacion: 'desc' }
                ],
                include: query.incluirRelaciones
                    ? {
                        actividades: {
                            select: {
                                id: true,
                                nombre: true,
                                codigoActividad: true,
                                capacidadMaxima: true,
                                activa: true,
                                descripcion: true
                            }
                        },
                        aulas: {
                            select: {
                                id: true,
                                nombre: true,
                                capacidad: true,
                                ubicacion: true,
                                activa: true,
                                tipoAulaId: true
                            }
                        }
                    }
                    : undefined
            }),
            this.prisma.actividades_aulas.count({ where })
        ]);
        return { data, total };
    }
    async findById(id) {
        return this.prisma.actividades_aulas.findUnique({
            where: { id },
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        capacidadMaxima: true,
                        activa: true,
                        descripcion: true
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true,
                        tipoAulaId: true
                    }
                }
            }
        });
    }
    async findByActividadId(actividadId, soloActivas = true) {
        const where = { actividadId };
        if (soloActivas) {
            where.activa = true;
            where.OR = [
                { fechaDesasignacion: null },
                { fechaDesasignacion: { gt: new Date() } }
            ];
        }
        return this.prisma.actividades_aulas.findMany({
            where,
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        capacidadMaxima: true,
                        activa: true
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true
                    }
                }
            },
            orderBy: [
                { prioridad: 'asc' },
                { fechaAsignacion: 'desc' }
            ]
        });
    }
    async findByAulaId(aulaId, soloActivas = true) {
        const where = { aulaId };
        if (soloActivas) {
            where.activa = true;
            where.OR = [
                { fechaDesasignacion: null },
                { fechaDesasignacion: { gt: new Date() } }
            ];
        }
        return this.prisma.actividades_aulas.findMany({
            where,
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        capacidadMaxima: true,
                        activa: true,
                        descripcion: true
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true
                    }
                }
            },
            orderBy: [
                { fechaAsignacion: 'desc' }
            ]
        });
    }
    async findByActividadAndAula(actividadId, aulaId) {
        return this.prisma.actividades_aulas.findFirst({
            where: {
                actividadId,
                aulaId
            },
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        capacidadMaxima: true,
                        activa: true
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true
                    }
                }
            }
        });
    }
    async update(id, data) {
        const updateData = {};
        if (data.prioridad !== undefined)
            updateData.prioridad = data.prioridad;
        if (data.fechaDesasignacion !== undefined) {
            updateData.fechaDesasignacion = data.fechaDesasignacion ? new Date(data.fechaDesasignacion) : null;
        }
        if (data.activa !== undefined)
            updateData.activa = data.activa;
        if (data.observaciones !== undefined)
            updateData.observaciones = data.observaciones || null;
        return this.prisma.actividades_aulas.update({
            where: { id },
            data: updateData,
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        capacidadMaxima: true,
                        activa: true
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true
                    }
                }
            }
        });
    }
    async delete(id) {
        return this.prisma.actividades_aulas.delete({
            where: { id },
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        capacidadMaxima: true,
                        activa: true
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true
                    }
                }
            }
        });
    }
    async desasignar(id, fechaDesasignacion, observaciones) {
        const updateData = {
            activa: false,
            fechaDesasignacion: fechaDesasignacion || new Date()
        };
        if (observaciones) {
            updateData.observaciones = observaciones;
        }
        return this.prisma.actividades_aulas.update({
            where: { id },
            data: updateData,
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        capacidadMaxima: true,
                        activa: true
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true
                    }
                }
            }
        });
    }
    async reactivar(id) {
        return this.prisma.actividades_aulas.update({
            where: { id },
            data: {
                activa: true,
                fechaDesasignacion: null
            },
            include: {
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true,
                        capacidadMaxima: true,
                        activa: true
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true,
                        capacidad: true,
                        ubicacion: true,
                        activa: true
                    }
                }
            }
        });
    }
    async countAsignacionesActivas(aulaId) {
        return this.prisma.actividades_aulas.count({
            where: {
                aulaId,
                activa: true,
                OR: [
                    { fechaDesasignacion: null },
                    { fechaDesasignacion: { gt: new Date() } }
                ]
            }
        });
    }
    async contarActividadesPorAula(aulaId) {
        const [total, activas] = await Promise.all([
            this.prisma.actividades_aulas.count({
                where: { aulaId }
            }),
            this.prisma.actividades_aulas.count({
                where: { aulaId, activa: true }
            })
        ]);
        return {
            total,
            activas,
            inactivas: total - activas
        };
    }
    async getActividadesEnAulaPorHorarios(aulaId, diaSemanaId, horaInicio, horaFin, excluirActividadId) {
        const asignaciones = await this.prisma.actividades_aulas.findMany({
            where: {
                aulaId,
                activa: true,
                ...(excluirActividadId && {
                    actividadId: { not: excluirActividadId }
                })
            },
            include: {
                actividades: {
                    include: {
                        horarios_actividades: {
                            where: {
                                activo: true,
                                diaSemanaId: diaSemanaId
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
        const conflictos = [];
        const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
        const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
        const inicioMinutos = horaInicioH * 60 + horaInicioM;
        const finMinutos = horaFinH * 60 + horaFinM;
        for (const asignacion of asignaciones) {
            for (const horario of asignacion.actividades.horarios_actividades) {
                const [hInicioH, hInicioM] = horario.horaInicio.split(':').map(Number);
                const [hFinH, hFinM] = horario.horaFin.split(':').map(Number);
                const hInicioMinutos = hInicioH * 60 + hInicioM;
                const hFinMinutos = hFinH * 60 + hFinM;
                if (inicioMinutos < hFinMinutos && finMinutos > hInicioMinutos) {
                    conflictos.push({
                        tipo: 'ACTIVIDAD',
                        asignacionId: asignacion.id,
                        actividadId: asignacion.actividadId,
                        actividadNombre: asignacion.actividades.nombre,
                        aulaId: asignacion.aulaId,
                        aulaNombre: asignacion.aulas.nombre,
                        diaSemanaId: horario.diaSemanaId,
                        horaInicio: horario.horaInicio,
                        horaFin: horario.horaFin
                    });
                }
            }
        }
        return conflictos;
    }
}
exports.ActividadAulaRepository = ActividadAulaRepository;
//# sourceMappingURL=actividad-aula.repository.js.map