import { ActividadRepository } from '@/repositories/actividad.repository';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
import { PrismaClient } from '@prisma/client';
export declare class ActividadService {
    private actividadRepository;
    private prisma;
    constructor(actividadRepository: ActividadRepository, prisma?: PrismaClient);
    private generateCodigoActividad;
    createActividad(data: CreateActividadDto): Promise<{
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        activa: boolean;
        capacidadMaxima: number | null;
        codigoActividad: string;
        tipoActividadId: number;
        estadoId: number;
        fechaDesde: Date;
        fechaHasta: Date | null;
        costo: import("@prisma/client/runtime/library").Decimal;
    }>;
    private validateHorarios;
    getActividades(query: QueryActividadesDto): Promise<{
        pages: number;
        data: {
            observaciones: string | null;
            categoriaId: number;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            activa: boolean;
            capacidadMaxima: number | null;
            codigoActividad: string;
            tipoActividadId: number;
            estadoId: number;
            fechaDesde: Date;
            fechaHasta: Date | null;
            costo: import("@prisma/client/runtime/library").Decimal;
        }[];
        total: number;
    }>;
    getActividadById(id: number): Promise<{
        horarios_actividades: ({
            diasSemana: {
                nombre: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                codigo: string;
                orden: number;
            };
        } & {
            activo: boolean;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            actividadId: number;
            diaSemanaId: number;
            horaInicio: string;
            horaFin: string;
        })[];
        docentes_actividades: ({
            personas: {
                nombre: string;
                apellido: string;
                email: string | null;
                telefono: string | null;
                tipos: ({
                    especialidad: {
                        activo: boolean;
                        nombre: string;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
                        descripcion: string | null;
                        codigo: string;
                        orden: number;
                    } | null;
                    tipoPersona: {
                        activo: boolean;
                        nombre: string;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
                        descripcion: string | null;
                        codigo: string;
                        orden: number;
                        requiresCategoria: boolean;
                        requiresEspecialidad: boolean;
                        requiresCuit: boolean;
                    };
                } & {
                    tipoPersonaId: number;
                    observaciones: string | null;
                    activo: boolean;
                    categoriaId: number | null;
                    numeroSocio: number | null;
                    fechaIngreso: Date | null;
                    fechaBaja: Date | null;
                    motivoBaja: string | null;
                    especialidadId: number | null;
                    honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
                    cuit: string | null;
                    razonSocialId: number | null;
                    fechaDesasignacion: Date | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    fechaAsignacion: Date;
                    personaId: number;
                })[];
                id: number;
            };
            rolesDocentes: {
                activo: boolean;
                nombre: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                descripcion: string | null;
                codigo: string;
                orden: number;
            };
        } & {
            observaciones: string | null;
            activo: boolean;
            fechaDesasignacion: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            fechaAsignacion: Date;
            actividadId: number;
            docenteId: number;
            rolDocenteId: number;
        })[];
        participacion_actividades: ({
            personas: {
                nombre: string;
                apellido: string;
                email: string | null;
                telefono: string | null;
                tipos: ({
                    tipoPersona: {
                        activo: boolean;
                        nombre: string;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
                        descripcion: string | null;
                        codigo: string;
                        orden: number;
                        requiresCategoria: boolean;
                        requiresEspecialidad: boolean;
                        requiresCuit: boolean;
                    };
                } & {
                    tipoPersonaId: number;
                    observaciones: string | null;
                    activo: boolean;
                    categoriaId: number | null;
                    numeroSocio: number | null;
                    fechaIngreso: Date | null;
                    fechaBaja: Date | null;
                    motivoBaja: string | null;
                    especialidadId: number | null;
                    honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
                    cuit: string | null;
                    razonSocialId: number | null;
                    fechaDesasignacion: Date | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    fechaAsignacion: Date;
                    personaId: number;
                })[];
                id: number;
            };
        } & {
            observaciones: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            personaId: number;
            actividadId: number;
            fechaInicio: Date;
            fechaFin: Date | null;
            precioEspecial: import("@prisma/client/runtime/library").Decimal | null;
            activa: boolean;
        })[];
        _count: {
            participacion_actividades: number;
        };
        tiposActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
        categoriasActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
        estadosActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
    } & {
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        activa: boolean;
        capacidadMaxima: number | null;
        codigoActividad: string;
        tipoActividadId: number;
        estadoId: number;
        fechaDesde: Date;
        fechaHasta: Date | null;
        costo: import("@prisma/client/runtime/library").Decimal;
    }>;
    getActividadByCodigo(codigo: string): Promise<{
        tiposActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
        categoriasActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
        estadosActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
    } & {
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        activa: boolean;
        capacidadMaxima: number | null;
        codigoActividad: string;
        tipoActividadId: number;
        estadoId: number;
        fechaDesde: Date;
        fechaHasta: Date | null;
        costo: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateActividad(id: number, data: UpdateActividadDto): Promise<({
        horarios_actividades: ({
            diasSemana: {
                nombre: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                codigo: string;
                orden: number;
            };
        } & {
            activo: boolean;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            actividadId: number;
            diaSemanaId: number;
            horaInicio: string;
            horaFin: string;
        })[];
        docentes_actividades: ({
            personas: {
                nombre: string;
                apellido: string;
                email: string | null;
                telefono: string | null;
                tipos: ({
                    especialidad: {
                        activo: boolean;
                        nombre: string;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
                        descripcion: string | null;
                        codigo: string;
                        orden: number;
                    } | null;
                    tipoPersona: {
                        activo: boolean;
                        nombre: string;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
                        descripcion: string | null;
                        codigo: string;
                        orden: number;
                        requiresCategoria: boolean;
                        requiresEspecialidad: boolean;
                        requiresCuit: boolean;
                    };
                } & {
                    tipoPersonaId: number;
                    observaciones: string | null;
                    activo: boolean;
                    categoriaId: number | null;
                    numeroSocio: number | null;
                    fechaIngreso: Date | null;
                    fechaBaja: Date | null;
                    motivoBaja: string | null;
                    especialidadId: number | null;
                    honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
                    cuit: string | null;
                    razonSocialId: number | null;
                    fechaDesasignacion: Date | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    fechaAsignacion: Date;
                    personaId: number;
                })[];
                id: number;
            };
            rolesDocentes: {
                activo: boolean;
                nombre: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                descripcion: string | null;
                codigo: string;
                orden: number;
            };
        } & {
            observaciones: string | null;
            activo: boolean;
            fechaDesasignacion: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            fechaAsignacion: Date;
            actividadId: number;
            docenteId: number;
            rolDocenteId: number;
        })[];
        participacion_actividades: ({
            personas: {
                nombre: string;
                apellido: string;
                email: string | null;
                telefono: string | null;
                tipos: ({
                    tipoPersona: {
                        activo: boolean;
                        nombre: string;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
                        descripcion: string | null;
                        codigo: string;
                        orden: number;
                        requiresCategoria: boolean;
                        requiresEspecialidad: boolean;
                        requiresCuit: boolean;
                    };
                } & {
                    tipoPersonaId: number;
                    observaciones: string | null;
                    activo: boolean;
                    categoriaId: number | null;
                    numeroSocio: number | null;
                    fechaIngreso: Date | null;
                    fechaBaja: Date | null;
                    motivoBaja: string | null;
                    especialidadId: number | null;
                    honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
                    cuit: string | null;
                    razonSocialId: number | null;
                    fechaDesasignacion: Date | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    fechaAsignacion: Date;
                    personaId: number;
                })[];
                id: number;
            };
        } & {
            observaciones: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            personaId: number;
            actividadId: number;
            fechaInicio: Date;
            fechaFin: Date | null;
            precioEspecial: import("@prisma/client/runtime/library").Decimal | null;
            activa: boolean;
        })[];
        _count: {
            participacion_actividades: number;
        };
        tiposActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
        categoriasActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
        estadosActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
    } & {
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        activa: boolean;
        capacidadMaxima: number | null;
        codigoActividad: string;
        tipoActividadId: number;
        estadoId: number;
        fechaDesde: Date;
        fechaHasta: Date | null;
        costo: import("@prisma/client/runtime/library").Decimal;
    }) | null>;
    deleteActividad(id: number): Promise<{
        message: string;
    }>;
    cambiarEstado(id: number, nuevoEstadoId: number, observaciones?: string): Promise<{
        estadosActividades: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
    } & {
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        activa: boolean;
        capacidadMaxima: number | null;
        codigoActividad: string;
        tipoActividadId: number;
        estadoId: number;
        fechaDesde: Date;
        fechaHasta: Date | null;
        costo: import("@prisma/client/runtime/library").Decimal;
    }>;
    agregarHorario(actividadId: number, horarioData: any): Promise<{
        actividades: {
            nombre: string;
            id: number;
            codigoActividad: string;
        };
        diasSemana: {
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            codigo: string;
            orden: number;
        };
    } & {
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    }>;
    actualizarHorario(horarioId: number, horarioData: any): Promise<{
        actividades: {
            nombre: string;
            id: number;
        };
        diasSemana: {
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            codigo: string;
            orden: number;
        };
    } & {
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    }>;
    eliminarHorario(horarioId: number): Promise<{
        message: string;
    }>;
    getHorariosByActividad(actividadId: number): Promise<{
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    }[]>;
    asignarDocente(actividadId: number, docenteId: number, rolDocenteId: number, observaciones?: string): Promise<{
        actividades: {
            nombre: string;
            id: number;
            codigoActividad: string;
        };
        personas: {
            nombre: string;
            apellido: string;
            email: string | null;
            tipos: ({
                especialidad: {
                    activo: boolean;
                    nombre: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string;
                    orden: number;
                } | null;
                tipoPersona: {
                    activo: boolean;
                    nombre: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string;
                    orden: number;
                    requiresCategoria: boolean;
                    requiresEspecialidad: boolean;
                    requiresCuit: boolean;
                };
            } & {
                tipoPersonaId: number;
                observaciones: string | null;
                activo: boolean;
                categoriaId: number | null;
                numeroSocio: number | null;
                fechaIngreso: Date | null;
                fechaBaja: Date | null;
                motivoBaja: string | null;
                especialidadId: number | null;
                honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
                cuit: string | null;
                razonSocialId: number | null;
                fechaDesasignacion: Date | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                fechaAsignacion: Date;
                personaId: number;
            })[];
            id: number;
        };
        rolesDocentes: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
    } & {
        observaciones: string | null;
        activo: boolean;
        fechaDesasignacion: Date | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        fechaAsignacion: Date;
        actividadId: number;
        docenteId: number;
        rolDocenteId: number;
    }>;
    desasignarDocente(actividadId: number, docenteId: number, rolDocenteId: number): Promise<{
        personas: {
            nombre: string;
            apellido: string;
            id: number;
        };
        rolesDocentes: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
    } & {
        observaciones: string | null;
        activo: boolean;
        fechaDesasignacion: Date | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        fechaAsignacion: Date;
        actividadId: number;
        docenteId: number;
        rolDocenteId: number;
    }>;
    desasignarDocenteById(asignacionId: number): Promise<{
        actividades: {
            nombre: string;
            id: number;
        };
        personas: {
            nombre: string;
            apellido: string;
            id: number;
        };
        rolesDocentes: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
    } & {
        observaciones: string | null;
        activo: boolean;
        fechaDesasignacion: Date | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        fechaAsignacion: Date;
        actividadId: number;
        docenteId: number;
        rolDocenteId: number;
    }>;
    getDocentesByActividad(actividadId: number): Promise<({
        personas: {
            nombre: string;
            apellido: string;
            email: string | null;
            telefono: string | null;
            tipos: ({
                especialidad: {
                    activo: boolean;
                    nombre: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string;
                    orden: number;
                } | null;
                tipoPersona: {
                    activo: boolean;
                    nombre: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string;
                    orden: number;
                    requiresCategoria: boolean;
                    requiresEspecialidad: boolean;
                    requiresCuit: boolean;
                };
            } & {
                tipoPersonaId: number;
                observaciones: string | null;
                activo: boolean;
                categoriaId: number | null;
                numeroSocio: number | null;
                fechaIngreso: Date | null;
                fechaBaja: Date | null;
                motivoBaja: string | null;
                especialidadId: number | null;
                honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
                cuit: string | null;
                razonSocialId: number | null;
                fechaDesasignacion: Date | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                fechaAsignacion: Date;
                personaId: number;
            })[];
            id: number;
        };
        rolesDocentes: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        };
    } & {
        observaciones: string | null;
        activo: boolean;
        fechaDesasignacion: Date | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        fechaAsignacion: Date;
        actividadId: number;
        docenteId: number;
        rolDocenteId: number;
    })[]>;
    getDocentesDisponibles(): Promise<{
        id: number;
        nombre: string;
        apellido: string;
        email: string | null;
        telefono: string | null;
        especialidad: string | null;
        especialidadId: number | null;
        especialidadCodigo: string | null;
        honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    getParticipantes(actividadId: number): Promise<({
        personas: {
            nombre: string;
            apellido: string;
            email: string | null;
            telefono: string | null;
            tipos: ({
                categoria: {
                    nombre: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    descuento: import("@prisma/client/runtime/library").Decimal;
                    activa: boolean;
                    codigo: string;
                    orden: number;
                    montoCuota: import("@prisma/client/runtime/library").Decimal;
                } | null;
                tipoPersona: {
                    activo: boolean;
                    nombre: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string;
                    orden: number;
                    requiresCategoria: boolean;
                    requiresEspecialidad: boolean;
                    requiresCuit: boolean;
                };
            } & {
                tipoPersonaId: number;
                observaciones: string | null;
                activo: boolean;
                categoriaId: number | null;
                numeroSocio: number | null;
                fechaIngreso: Date | null;
                fechaBaja: Date | null;
                motivoBaja: string | null;
                especialidadId: number | null;
                honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
                cuit: string | null;
                razonSocialId: number | null;
                fechaDesasignacion: Date | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                fechaAsignacion: Date;
                personaId: number;
            })[];
            id: number;
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: import("@prisma/client/runtime/library").Decimal | null;
        activa: boolean;
    })[]>;
    addParticipante(actividadId: number, personaId: number, fechaInicio: string, observaciones?: string): Promise<{
        actividades: {
            nombre: string;
            id: number;
            codigoActividad: string;
        };
        personas: {
            nombre: string;
            apellido: string;
            email: string | null;
            tipos: ({
                tipoPersona: {
                    activo: boolean;
                    nombre: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string;
                    orden: number;
                    requiresCategoria: boolean;
                    requiresEspecialidad: boolean;
                    requiresCuit: boolean;
                };
            } & {
                tipoPersonaId: number;
                observaciones: string | null;
                activo: boolean;
                categoriaId: number | null;
                numeroSocio: number | null;
                fechaIngreso: Date | null;
                fechaBaja: Date | null;
                motivoBaja: string | null;
                especialidadId: number | null;
                honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
                cuit: string | null;
                razonSocialId: number | null;
                fechaDesasignacion: Date | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                fechaAsignacion: Date;
                personaId: number;
            })[];
            id: number;
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: import("@prisma/client/runtime/library").Decimal | null;
        activa: boolean;
    }>;
    deleteParticipante(actividadId: number, participanteId: number): Promise<{
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: import("@prisma/client/runtime/library").Decimal | null;
        activa: boolean;
    }>;
    getEstadisticas(actividadId: number): Promise<{
        totalParticipantes: number;
        totalHorarios: number;
        totalDocentes: number;
        cupoMaximo: number | null;
        cupoDisponible: number | null;
        porcentajeOcupacion: number | null;
        estaLlena: boolean;
    }>;
    getCatalogos(): Promise<{
        tipos: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        }[];
        categorias: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        }[];
        estados: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        }[];
        diasSemana: {
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            codigo: string;
            orden: number;
        }[];
        rolesDocentes: {
            activo: boolean;
            nombre: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            codigo: string;
            orden: number;
        }[];
    }>;
    getTiposActividades(): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }[]>;
    getCategoriasActividades(): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }[]>;
    getEstadosActividades(): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }[]>;
    getDiasSemana(): Promise<{
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        codigo: string;
        orden: number;
    }[]>;
    getRolesDocentes(): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }[]>;
    duplicarActividad(idOriginal: number, nuevoCodigoActividad: string, nuevoNombre: string, nuevaFechaDesde: string | Date, nuevaFechaHasta?: string | Date | null, copiarHorarios?: boolean, copiarDocentes?: boolean): Promise<{
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        activa: boolean;
        capacidadMaxima: number | null;
        codigoActividad: string;
        tipoActividadId: number;
        estadoId: number;
        fechaDesde: Date;
        fechaHasta: Date | null;
        costo: import("@prisma/client/runtime/library").Decimal;
    }>;
    getResumenPorTipo(): Promise<{
        tipo: {
            id: number;
            codigo: string;
            nombre: string;
        };
        totalActividades: number;
        actividades: {
            id: number;
            codigo: any;
            nombre: string;
            cupoMaximo: number | null;
            costo: number;
        }[];
    }[]>;
    getHorarioSemanal(): Promise<{
        horarioSemanal: {
            dia: {
                id: number;
                codigo: string;
                nombre: string;
                orden: number;
            };
            actividades: {
                id: number;
                codigo: any;
                nombre: string;
                tipo: any;
                horarios: any;
                docentes: any;
            }[];
        }[];
        generadoEn: Date;
    }>;
}
//# sourceMappingURL=actividad.service.d.ts.map