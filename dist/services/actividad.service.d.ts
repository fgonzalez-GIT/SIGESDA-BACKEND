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
        descripcion: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
            descripcion: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
            diaSemana: {
                codigo: string;
                nombre: string;
                orden: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            activo: boolean;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            actividadId: number;
            diaSemanaId: number;
            horaInicio: Date;
            horaFin: Date;
        })[];
        docentes_actividades: ({
            personas: {
                email: string | null;
                nombre: string;
                apellido: string;
                telefono: string | null;
                tipos: ({
                    especialidad: {
                        activo: boolean;
                        codigo: string;
                        nombre: string;
                        descripcion: string | null;
                        orden: number;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
                    } | null;
                    tipoPersona: {
                        activo: boolean;
                        codigo: string;
                        nombre: string;
                        descripcion: string | null;
                        orden: number;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
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
                codigo: string;
                nombre: string;
                descripcion: string | null;
                orden: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
                email: string | null;
                nombre: string;
                apellido: string;
                telefono: string | null;
                tipos: ({
                    tipoPersona: {
                        activo: boolean;
                        codigo: string;
                        nombre: string;
                        descripcion: string | null;
                        orden: number;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
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
    } & {
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        descripcion: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
        horarios_actividades: ({
            diaSemana: {
                codigo: string;
                nombre: string;
                orden: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            activo: boolean;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            actividadId: number;
            diaSemanaId: number;
            horaInicio: Date;
            horaFin: Date;
        })[];
        docentes_actividades: ({
            personas: {
                razonSocial: string | null;
                email: string | null;
                activo: boolean;
                categoriaId: number | null;
                numeroSocio: number | null;
                fechaIngreso: Date | null;
                fechaBaja: Date | null;
                motivoBaja: string | null;
                honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
                cuit: string | null;
                nombre: string;
                apellido: string;
                dni: string;
                telefono: string | null;
                direccion: string | null;
                fechaNacimiento: Date | null;
                genero: import(".prisma/client").$Enums.Genero | null;
                especialidad: string | null;
                id: number;
                categoria: import(".prisma/client").$Enums.CategoriaSocioLegacy | null;
                createdAt: Date;
                updatedAt: Date;
            };
            rolesDocentes: {
                activo: boolean;
                codigo: string;
                nombre: string;
                descripcion: string | null;
                orden: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
        categoria: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
        estado: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
        tipoActividad: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        descripcion: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
            diaSemana: {
                codigo: string;
                nombre: string;
                orden: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            activo: boolean;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            actividadId: number;
            diaSemanaId: number;
            horaInicio: Date;
            horaFin: Date;
        })[];
        docentes_actividades: ({
            personas: {
                email: string | null;
                nombre: string;
                apellido: string;
                telefono: string | null;
                tipos: ({
                    especialidad: {
                        activo: boolean;
                        codigo: string;
                        nombre: string;
                        descripcion: string | null;
                        orden: number;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
                    } | null;
                    tipoPersona: {
                        activo: boolean;
                        codigo: string;
                        nombre: string;
                        descripcion: string | null;
                        orden: number;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
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
                codigo: string;
                nombre: string;
                descripcion: string | null;
                orden: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
                email: string | null;
                nombre: string;
                apellido: string;
                telefono: string | null;
                tipos: ({
                    tipoPersona: {
                        activo: boolean;
                        codigo: string;
                        nombre: string;
                        descripcion: string | null;
                        orden: number;
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
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
    } & {
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        descripcion: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
        categoria: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
        estado: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
        tipoActividad: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        descripcion: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
    } & {
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        diaSemanaId: number;
        horaInicio: Date;
        horaFin: Date;
    }>;
    actualizarHorario(horarioId: number, horarioData: any): Promise<{
        actividades: {
            nombre: string;
            id: number;
        };
    } & {
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        diaSemanaId: number;
        horaInicio: Date;
        horaFin: Date;
    }>;
    eliminarHorario(horarioId: number): Promise<{
        message: string;
    }>;
    getHorariosByActividad(actividadId: number): Promise<({
        diaSemana: {
            codigo: string;
            nombre: string;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        diaSemanaId: number;
        horaInicio: Date;
        horaFin: Date;
    })[]>;
    asignarDocente(actividadId: number, docenteId: number, rolDocenteId: number, observaciones?: string): Promise<{
        actividades: {
            nombre: string;
            id: number;
            codigoActividad: string;
        };
        personas: {
            email: string | null;
            nombre: string;
            apellido: string;
            tipos: ({
                especialidad: {
                    activo: boolean;
                    codigo: string;
                    nombre: string;
                    descripcion: string | null;
                    orden: number;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                } | null;
                tipoPersona: {
                    activo: boolean;
                    codigo: string;
                    nombre: string;
                    descripcion: string | null;
                    orden: number;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
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
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
            email: string | null;
            nombre: string;
            apellido: string;
            telefono: string | null;
            tipos: ({
                especialidad: {
                    activo: boolean;
                    codigo: string;
                    nombre: string;
                    descripcion: string | null;
                    orden: number;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                } | null;
                tipoPersona: {
                    activo: boolean;
                    codigo: string;
                    nombre: string;
                    descripcion: string | null;
                    orden: number;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
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
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
            email: string | null;
            nombre: string;
            apellido: string;
            telefono: string | null;
            tipos: ({
                categoria: {
                    codigo: string;
                    nombre: string;
                    descripcion: string | null;
                    orden: number;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    descuento: import("@prisma/client/runtime/library").Decimal;
                    activa: boolean;
                    montoCuota: import("@prisma/client/runtime/library").Decimal;
                } | null;
                tipoPersona: {
                    activo: boolean;
                    codigo: string;
                    nombre: string;
                    descripcion: string | null;
                    orden: number;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
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
            email: string | null;
            nombre: string;
            apellido: string;
            tipos: ({
                tipoPersona: {
                    activo: boolean;
                    codigo: string;
                    nombre: string;
                    descripcion: string | null;
                    orden: number;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
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
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        categorias: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        estados: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        diasSemana: {
            codigo: string;
            nombre: string;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        rolesDocentes: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    getTiposActividades(): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getCategoriasActividades(): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getEstadosActividades(): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getDiasSemana(): Promise<{
        codigo: string;
        nombre: string;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getRolesDocentes(): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    duplicarActividad(idOriginal: number, nuevoCodigoActividad: string, nuevoNombre: string, nuevaFechaDesde: string | Date, nuevaFechaHasta?: string | Date | null, copiarHorarios?: boolean, copiarDocentes?: boolean): Promise<{
        observaciones: string | null;
        categoriaId: number;
        nombre: string;
        descripcion: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
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