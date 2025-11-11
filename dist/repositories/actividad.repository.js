"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadRepository = void 0;
class ActividadRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const { horarios, docentes, reservasAulas, ...actividadData } = data;
        return this.prisma.actividades.create({
            data: {
                nombre: actividadData.nombre,
                tipo: actividadData.tipo || 'CORO',
                descripcion: actividadData.descripcion ?? undefined,
                precio: actividadData.precio ?? 0,
                duracion: actividadData.duracion ?? undefined,
                capacidadMaxima: actividadData.cupoMaximo ?? undefined,
                activa: true,
                horarios_actividades: horarios && horarios.length > 0 ? {
                    create: horarios.map(h => ({
                        diaSemana: h.diaSemanaId,
                        horaInicio: h.horaInicio,
                        horaFin: h.horaFin,
                        activo: h.activo
                    }))
                } : undefined,
                docentes_actividades: docentes && docentes.length > 0 ? {
                    create: docentes.map(d => ({
                        personas: { connect: { id: d.docenteId } },
                        roles_docentes: { connect: { id: d.rolDocenteId } },
                        observaciones: d.observaciones ?? undefined,
                        activo: true
                    }))
                } : undefined
            },
            include: {
                horarios_actividades: {
                    orderBy: [
                        { diaSemana: 'asc' },
                        { horaInicio: 'asc' }
                    ]
                },
                docentes_actividades: {
                    include: {
                        personas: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                email: true
                            }
                        }
                    },
                    where: { activo: true }
                }
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.tipoActividadId) {
            where.tipo_actividad_id = query.tipoActividadId;
        }
        if (query.categoriaId) {
            where.categoria_id = query.categoriaId;
        }
        if (query.estadoId) {
            where.estado_id = query.estadoId;
        }
        if (query.diaSemanaId) {
            where.horarios_actividades = {
                some: {
                    dia_semana_id: query.diaSemanaId,
                    activo: true
                }
            };
        }
        if (query.docenteId) {
            where.docentes_actividades = {
                some: {
                    docente_id: query.docenteId,
                    activo: true
                }
            };
        }
        if (query.aulaId) {
            where.horarios_actividades = {
                ...where.horarios_actividades,
                some: {
                    ...(where.horarios_actividades?.some || {}),
                    reservas_aulas_actividades: {
                        some: {
                            aula_id: query.aulaId
                        }
                    }
                }
            };
        }
        if (query.costoDesde !== undefined || query.costoHasta !== undefined) {
            where.costo = {};
            if (query.costoDesde !== undefined) {
                where.costo.gte = query.costoDesde;
            }
            if (query.costoHasta !== undefined) {
                where.costo.lte = query.costoHasta;
            }
        }
        if (query.search) {
            where.OR = [
                { nombre: { contains: query.search, mode: 'insensitive' } },
                { descripcion: { contains: query.search, mode: 'insensitive' } },
                { codigo_actividad: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        if (query.vigentes) {
            const hoy = new Date();
            where.fecha_desde = { lte: hoy };
            where.OR = [
                { fecha_hasta: null },
                { fecha_hasta: { gte: hoy } }
            ];
        }
        const skip = (query.page - 1) * query.limit;
        const orderBy = {};
        if (query.orderBy === 'codigo') {
            orderBy.codigo_actividad = query.orderDir;
        }
        else if (query.orderBy === 'fechaDesde') {
            orderBy.fecha_desde = query.orderDir;
        }
        else if (query.orderBy === 'cupoMaximo') {
            orderBy.capacidadMaxima = query.orderDir;
        }
        else if (query.orderBy === 'created_at') {
            orderBy.created_at = query.orderDir;
        }
        else {
            orderBy.nombre = query.orderDir;
        }
        const [data, total] = await Promise.all([
            this.prisma.actividades.findMany({
                where,
                skip,
                take: query.limit,
                orderBy,
                include: query.incluirRelaciones ? {
                    tipos_actividades: true,
                    categorias_actividades: true,
                    estados_actividades: true,
                    horarios_actividades: {
                        include: {
                            dias_semana: true
                        },
                        orderBy: [
                            { dia_semana_id: 'asc' },
                            { hora_inicio: 'asc' }
                        ],
                        where: { activo: true }
                    },
                    docentes_actividades: {
                        include: {
                            personas: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellido: true,
                                    especialidad: true
                                }
                            },
                            roles_docentes: true
                        },
                        where: { activo: true }
                    },
                    _count: {
                        select: {
                            participaciones_actividades: {
                                where: { activo: true }
                            }
                        }
                    }
                } : undefined
            }),
            this.prisma.actividades.count({ where })
        ]);
        if (query.conCupo) {
            const dataConCupo = data.filter(act => {
                if (!act.capacidadMaxima)
                    return true;
                const inscritos = act._count?.participaciones_actividades || 0;
                return inscritos < act.capacidadMaxima;
            });
            return {
                data: dataConCupo,
                total: dataConCupo.length
            };
        }
        return { data, total };
    }
    async findById(id) {
        return this.prisma.actividades.findUnique({
            where: { id },
            include: {
                tipos_actividades: true,
                categorias_actividades: true,
                estados_actividades: true,
                horarios_actividades: {
                    include: {
                        dias_semana: true,
                        reservas_aulas_actividades: {
                            include: {
                                aulas: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        capacidad: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: [
                        { dia_semana_id: 'asc' },
                        { hora_inicio: 'asc' }
                    ]
                },
                docentes_actividades: {
                    include: {
                        personas: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                especialidad: true,
                                email: true,
                                telefono: true,
                                honorariosPorHora: true
                            }
                        },
                        roles_docentes: true
                    },
                    where: { activo: true }
                },
                participaciones_actividades: {
                    include: {
                        personas: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                tipo: true,
                                email: true,
                                telefono: true
                            }
                        }
                    },
                    where: { activo: true }
                },
                _count: {
                    select: {
                        participaciones_actividades: {
                            where: { activo: true }
                        }
                    }
                }
            }
        });
    }
    async findByCodigoActividad(codigo) {
        return this.prisma.actividades.findUnique({
            where: { codigo_actividad: codigo },
            include: {
                tipos_actividades: true,
                categorias_actividades: true,
                estados_actividades: true
            }
        });
    }
    async update(id, data) {
        const updateData = {};
        if (data.codigoActividad)
            updateData.codigo_actividad = data.codigoActividad;
        if (data.nombre)
            updateData.nombre = data.nombre;
        if (data.tipoActividadId)
            updateData.tipo_actividad_id = data.tipoActividadId;
        if (data.categoriaId)
            updateData.categoria_id = data.categoriaId;
        if (data.estadoId)
            updateData.estado_id = data.estadoId;
        if (data.descripcion !== undefined)
            updateData.descripcion = data.descripcion;
        if (data.fechaDesde)
            updateData.fecha_desde = new Date(data.fechaDesde);
        if (data.fechaHasta !== undefined) {
            updateData.fecha_hasta = data.fechaHasta ? new Date(data.fechaHasta) : null;
        }
        if (data.cupoMaximo !== undefined)
            updateData.capacidadMaxima = data.cupoMaximo;
        if (data.costo !== undefined)
            updateData.costo = data.costo;
        if (data.observaciones !== undefined)
            updateData.observaciones = data.observaciones;
        return this.prisma.actividades.update({
            where: { id },
            data: updateData,
            include: {
                tipos_actividades: true,
                categorias_actividades: true,
                estados_actividades: true,
                horarios_actividades: {
                    include: { dias_semana: true },
                    orderBy: [
                        { dia_semana_id: 'asc' },
                        { hora_inicio: 'asc' }
                    ]
                },
                docentes_actividades: {
                    include: {
                        personas: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                especialidad: true
                            }
                        },
                        roles_docentes: true
                    },
                    where: { activo: true }
                }
            }
        });
    }
    async delete(id) {
        return this.prisma.actividades.delete({
            where: { id }
        });
    }
    async cambiarEstado(id, nuevoEstadoId, observaciones) {
        return this.prisma.actividades.update({
            where: { id },
            data: {
                estado_id: nuevoEstadoId,
                observaciones: observaciones || undefined
            },
            include: {
                estados_actividades: true
            }
        });
    }
    async agregarHorario(actividadId, horarioData) {
        return this.prisma.horarios_actividades.create({
            data: {
                actividad_id: actividadId,
                dia_semana_id: horarioData.diaSemanaId,
                hora_inicio: this.parseTimeToDate(horarioData.horaInicio),
                hora_fin: this.parseTimeToDate(horarioData.horaFin),
                activo: horarioData.activo !== false
            },
            include: {
                dias_semana: true,
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo_actividad: true
                    }
                }
            }
        });
    }
    async updateHorario(horarioId, horarioData) {
        const updateData = {};
        if (horarioData.diaSemanaId)
            updateData.dia_semana_id = horarioData.diaSemanaId;
        if (horarioData.horaInicio)
            updateData.hora_inicio = this.parseTimeToDate(horarioData.horaInicio);
        if (horarioData.horaFin)
            updateData.hora_fin = this.parseTimeToDate(horarioData.horaFin);
        if (horarioData.activo !== undefined)
            updateData.activo = horarioData.activo;
        return this.prisma.horarios_actividades.update({
            where: { id: horarioId },
            data: updateData,
            include: {
                dias_semana: true,
                actividades: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            }
        });
    }
    async deleteHorario(horarioId) {
        return this.prisma.horarios_actividades.delete({
            where: { id: horarioId }
        });
    }
    async getHorariosByActividad(actividadId) {
        return this.prisma.horarios_actividades.findMany({
            where: { actividad_id: actividadId },
            include: {
                dias_semana: true,
                reservas_aulas_actividades: {
                    include: {
                        aulas: true
                    }
                }
            },
            orderBy: [
                { dia_semana_id: 'asc' },
                { hora_inicio: 'asc' }
            ]
        });
    }
    async findHorarioById(horarioId) {
        return this.prisma.horarios_actividades.findUnique({
            where: { id: horarioId },
            include: {
                dias_semana: true,
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo_actividad: true
                    }
                }
            }
        });
    }
    async asignarDocente(actividadId, docenteId, rolDocenteId, observaciones) {
        return this.prisma.docentes_actividades.create({
            data: {
                actividad_id: actividadId,
                docente_id: docenteId,
                rol_docente_id: rolDocenteId,
                observaciones,
                activo: true
            },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        especialidad: true,
                        email: true
                    }
                },
                roles_docentes: true,
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo_actividad: true
                    }
                }
            }
        });
    }
    async desasignarDocente(actividadId, docenteId, rolDocenteId) {
        const asignacion = await this.prisma.docentes_actividades.findFirst({
            where: {
                actividad_id: actividadId,
                docente_id: docenteId,
                rol_docente_id: rolDocenteId,
                activo: true
            }
        });
        if (!asignacion) {
            throw new Error('Asignación de docente no encontrada');
        }
        return this.prisma.docentes_actividades.update({
            where: { id: asignacion.id },
            data: {
                activo: false,
                fecha_desasignacion: new Date()
            },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                },
                roles_docentes: true
            }
        });
    }
    async getDocentesByActividad(actividadId) {
        return this.prisma.docentes_actividades.findMany({
            where: {
                actividad_id: actividadId,
                activo: true
            },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        especialidad: true,
                        email: true,
                        telefono: true,
                        honorariosPorHora: true
                    }
                },
                roles_docentes: true
            }
        });
    }
    async getDocentesDisponibles() {
        return this.prisma.persona.findMany({
            where: {
                tipo: 'DOCENTE',
                fechaBaja: null
            },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                especialidad: true,
                email: true,
                telefono: true,
                honorariosPorHora: true
            },
            orderBy: [
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });
    }
    async getParticipantes(actividadId) {
        return this.prisma.participaciones_actividades.findMany({
            where: {
                actividad_id: actividadId,
                activo: true
            },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        tipo: true,
                        email: true,
                        telefono: true,
                        categoriaId: true,
                        categoria: true
                    }
                }
            },
            orderBy: [
                { personas: { apellido: 'asc' } },
                { personas: { nombre: 'asc' } }
            ]
        });
    }
    async findParticipacionByPersonaAndActividad(actividadId, personaId) {
        return this.prisma.participaciones_actividades.findFirst({
            where: {
                actividad_id: actividadId,
                persona_id: personaId
            },
            select: {
                id: true,
                activo: true,
                fecha_inicio: true,
                fecha_fin: true
            }
        });
    }
    async addParticipante(actividadId, personaId, fechaInicio, observaciones) {
        const actividad = await this.prisma.actividades.findUnique({
            where: { id: actividadId },
            select: {
                id: true,
                nombre: true,
                capacidadMaxima: true
            }
        });
        if (!actividad) {
            throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
        if (actividad.capacidadMaxima !== null && actividad.capacidadMaxima !== undefined) {
            const participantesActivos = await this.prisma.participacion_actividades.count({
                where: {
                    actividadId: actividadId,
                    activa: true
                }
            });
            if (participantesActivos >= actividad.capacidadMaxima) {
                throw new Error(`No se puede inscribir: La actividad "${actividad.nombre}" ha alcanzado su capacidad máxima de ${actividad.capacidadMaxima} participantes (actualmente: ${participantesActivos} inscriptos)`);
            }
        }
        const participacionExistente = await this.findParticipacionByPersonaAndActividad(actividadId, personaId);
        if (participacionExistente && participacionExistente.activo) {
            throw new Error(`La persona ya está inscripta activamente en la actividad "${actividad.nombre}"`);
        }
        return this.prisma.participaciones_actividades.create({
            data: {
                actividad_id: actividadId,
                persona_id: personaId,
                fecha_inicio: new Date(fechaInicio),
                observaciones: observaciones || null,
                activo: true
            },
            include: {
                personas: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        tipo: true,
                        email: true
                    }
                },
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo_actividad: true
                    }
                }
            }
        });
    }
    async deleteParticipante(actividadId, participanteId) {
        return this.prisma.participaciones_actividades.update({
            where: {
                id: participanteId,
                actividad_id: actividadId
            },
            data: {
                activo: false,
                fecha_fin: new Date()
            }
        });
    }
    async getEstadisticas(actividadId) {
        const actividad = await this.prisma.actividades.findUnique({
            where: { id: actividadId },
            include: {
                _count: {
                    select: {
                        participaciones_actividades: {
                            where: { activo: true }
                        },
                        horarios_actividades: {
                            where: { activo: true }
                        },
                        docentes_actividades: {
                            where: { activo: true }
                        }
                    }
                }
            }
        });
        if (!actividad)
            return null;
        const participantesActivos = actividad._count.participaciones_actividades;
        const porcentajeOcupacion = actividad.capacidadMaxima
            ? Math.round((participantesActivos / actividad.capacidadMaxima) * 100)
            : null;
        return {
            totalParticipantes: participantesActivos,
            totalHorarios: actividad._count.horarios_actividades,
            totalDocentes: actividad._count.docentes_actividades,
            cupoMaximo: actividad.capacidadMaxima,
            cupoDisponible: actividad.capacidadMaxima ? actividad.capacidadMaxima - participantesActivos : null,
            porcentajeOcupacion,
            estaLlena: actividad.capacidadMaxima ? participantesActivos >= actividad.capacidadMaxima : false
        };
    }
    async getTiposActividades() {
        return this.prisma.tipos_actividades.findMany({
            where: { activo: true },
            orderBy: { orden: 'asc' }
        });
    }
    async getCategoriasActividades() {
        return this.prisma.categorias_actividades.findMany({
            where: { activo: true },
            orderBy: { orden: 'asc' }
        });
    }
    async getEstadosActividades() {
        return this.prisma.estados_actividades.findMany({
            where: { activo: true },
            orderBy: { orden: 'asc' }
        });
    }
    async getDiasSemana() {
        return this.prisma.dias_semana.findMany({
            orderBy: { orden: 'asc' }
        });
    }
    async getRolesDocentes() {
        return this.prisma.roles_docentes.findMany({
            where: { activo: true },
            orderBy: { orden: 'asc' }
        });
    }
    parseTimeToDate(time) {
        const [hours, minutes, seconds = '00'] = time.split(':');
        const date = new Date();
        date.setUTCHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
        return date;
    }
    static formatTime(date) {
        return date.toISOString().substring(11, 19);
    }
    static minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    static timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
}
exports.ActividadRepository = ActividadRepository;
//# sourceMappingURL=actividad.repository.js.map