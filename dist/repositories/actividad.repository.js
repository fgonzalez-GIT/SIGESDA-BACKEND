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
                codigoActividad: actividadData.codigoActividad,
                nombre: actividadData.nombre,
                tipoActividadId: actividadData.tipoActividadId,
                categoriaId: actividadData.categoriaId,
                estadoId: actividadData.estadoId,
                descripcion: actividadData.descripcion ?? undefined,
                fechaDesde: actividadData.fechaDesde,
                fechaHasta: actividadData.fechaHasta ?? undefined,
                capacidadMaxima: actividadData.cupoMaximo ?? undefined,
                costo: actividadData.costo ?? 0,
                activa: true,
                observaciones: actividadData.observaciones ?? undefined,
                horarios_actividades: horarios && horarios.length > 0 ? {
                    create: horarios.map(h => ({
                        diaSemanaId: h.diaSemanaId,
                        horaInicio: h.horaInicio,
                        horaFin: h.horaFin,
                        activo: h.activo
                    }))
                } : undefined,
                docentes_actividades: docentes && docentes.length > 0 ? {
                    create: docentes.map(d => ({
                        personas: { connect: { id: d.docenteId } },
                        rolesDocentes: { connect: { id: d.rolDocenteId } },
                        observaciones: d.observaciones ?? undefined,
                        activo: true
                    }))
                } : undefined
            },
            include: {
                tiposActividades: true,
                categoriasActividades: true,
                estadosActividades: true,
                horarios_actividades: {
                    include: {
                        diasSemana: true
                    },
                    orderBy: [
                        { diaSemanaId: 'asc' },
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
                        },
                        rolesDocentes: true
                    },
                    where: { activo: true }
                }
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.tipoActividadId) {
            where.tipoActividadId = query.tipoActividadId;
        }
        if (query.categoriaId) {
            where.categoriaId = query.categoriaId;
        }
        if (query.estadoId) {
            where.estadoId = query.estadoId;
        }
        if (query.diaSemanaId) {
            where.horarios_actividades = {
                some: {
                    diaSemanaId: query.diaSemanaId,
                    activo: true
                }
            };
        }
        if (query.docenteId) {
            where.docentes_actividades = {
                some: {
                    docenteId: query.docenteId,
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
                { codigoActividad: { contains: query.search, mode: 'insensitive' } }
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
            orderBy.codigoActividad = query.orderDir;
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
                    tiposActividades: true,
                    categoriasActividades: true,
                    estadosActividades: true,
                    horarios_actividades: {
                        include: {
                            diasSemana: true
                        },
                        orderBy: [
                            { diaSemanaId: 'asc' },
                            { horaInicio: 'asc' }
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
                            rolesDocentes: true
                        },
                        where: { activo: true }
                    },
                    _count: {
                        select: {
                            participacion_actividades: {
                                where: { activa: true }
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
                const inscritos = act._count?.participacion_actividades || 0;
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
                tiposActividades: true,
                categoriasActividades: true,
                estadosActividades: true,
                horarios_actividades: {
                    include: {
                        diasSemana: true
                    },
                    orderBy: [
                        { diaSemanaId: 'asc' },
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
                                especialidad: true,
                                email: true,
                                telefono: true,
                                honorariosPorHora: true
                            }
                        },
                        rolesDocentes: true
                    },
                    where: { activo: true }
                },
                participacion_actividades: {
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
                    where: { activa: true }
                },
                _count: {
                    select: {
                        participacion_actividades: {
                            where: { activa: true }
                        }
                    }
                }
            }
        });
    }
    async findByCodigoActividad(codigo) {
        return this.prisma.actividades.findUnique({
            where: { codigoActividad: codigo },
            include: {
                tiposActividades: true,
                categoriasActividades: true,
                estadosActividades: true
            }
        });
    }
    async update(id, data) {
        const updateData = {};
        if (data.codigoActividad)
            updateData.codigoActividad = data.codigoActividad;
        if (data.nombre)
            updateData.nombre = data.nombre;
        if (data.tipoActividadId)
            updateData.tipoActividadId = data.tipoActividadId;
        if (data.categoriaId)
            updateData.categoriaId = data.categoriaId;
        if (data.estadoId)
            updateData.estadoId = data.estadoId;
        if (data.descripcion !== undefined)
            updateData.descripcion = data.descripcion;
        if (data.fechaDesde)
            updateData.fechaDesde = new Date(data.fechaDesde);
        if (data.fechaHasta !== undefined) {
            updateData.fechaHasta = data.fechaHasta ? new Date(data.fechaHasta) : null;
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
                tiposActividades: true,
                categoriasActividades: true,
                estadosActividades: true,
                horarios_actividades: {
                    include: { diasSemana: true },
                    orderBy: [
                        { diaSemanaId: 'asc' },
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
                                especialidad: true
                            }
                        },
                        rolesDocentes: true
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
                estadosActividades: true
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
                diasSemana: true,
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true
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
                diasSemana: true,
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
                diasSemana: true,
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
                diasSemana: true,
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true
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
                rolesDocentes: true,
                actividades: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoActividad: true
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
                rolesDocentes: true
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
                rolesDocentes: true
            }
        });
    }
    async getDocentesDisponibles() {
        const docentes = await this.prisma.persona.findMany({
            where: {
                tipos: {
                    some: {
                        tipoPersona: {
                            codigo: 'DOCENTE'
                        },
                        activo: true,
                        fechaBaja: null
                    }
                }
            },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true,
                tipos: {
                    where: {
                        tipoPersona: {
                            codigo: 'DOCENTE'
                        },
                        activo: true
                    },
                    include: {
                        especialidad: {
                            select: {
                                id: true,
                                codigo: true,
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });
        return docentes.map(docente => ({
            id: docente.id,
            nombre: docente.nombre,
            apellido: docente.apellido,
            email: docente.email,
            telefono: docente.telefono,
            especialidad: docente.tipos[0]?.especialidad?.nombre || null,
            especialidadId: docente.tipos[0]?.especialidad?.id || null,
            especialidadCodigo: docente.tipos[0]?.especialidad?.codigo || null,
            honorariosPorHora: docente.tipos[0]?.honorariosPorHora || null
        }));
    }
    async validarDocente(docenteId) {
        const persona = await this.prisma.persona.findUnique({
            where: { id: docenteId },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                tipos: {
                    where: {
                        tipoPersona: {
                            codigo: 'DOCENTE'
                        },
                        activo: true,
                        fechaBaja: null
                    },
                    select: {
                        id: true,
                        activo: true,
                        fechaBaja: true
                    }
                }
            }
        });
        if (!persona) {
            return null;
        }
        return {
            id: persona.id,
            nombre: persona.nombre,
            apellido: persona.apellido,
            esDocenteActivo: persona.tipos.length > 0
        };
    }
    async getParticipantes(actividadId) {
        return this.prisma.participacion_actividades.findMany({
            where: {
                actividadId: actividadId,
                activa: true
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
        return this.prisma.participacion_actividades.findFirst({
            where: {
                actividadId: actividadId,
                personaId: personaId
            },
            select: {
                id: true,
                activa: true,
                fechaInicio: true,
                fechaFin: true
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
        return this.prisma.participacion_actividades.create({
            data: {
                actividadId: actividadId,
                personaId: personaId,
                fechaInicio: new Date(fechaInicio),
                observaciones: observaciones || null,
                activa: true
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
                        codigoActividad: true
                    }
                }
            }
        });
    }
    async deleteParticipante(actividadId, participanteId) {
        return this.prisma.participacion_actividades.update({
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
                        participacion_actividades: {
                            where: { activa: true }
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
        const participantesActivos = actividad._count.participacion_actividades;
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