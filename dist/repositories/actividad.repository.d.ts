import { PrismaClient } from '@prisma/client';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
export declare class ActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateActividadDto): Promise<{
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
    findAll(query: QueryActividadesDto): Promise<{
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
    findById(id: number): Promise<{
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
    } | null>;
    findByCodigoActividad(codigo: string): Promise<({
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
    }) | null>;
    update(id: number, data: UpdateActividadDto): Promise<{
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
    delete(id: number): Promise<{
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
    updateHorario(horarioId: number, horarioData: any): Promise<{
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
    deleteHorario(horarioId: number): Promise<{
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        diaSemanaId: number;
        horaInicio: Date;
        horaFin: Date;
    }>;
    deleteHorariosByActividad(actividadId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getHorariosByActividad(actividadId: number): Promise<{
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        diaSemanaId: number;
        horaInicio: Date;
        horaFin: Date;
    }[]>;
    findHorarioById(horarioId: number): Promise<({
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
    }) | null>;
    findAsignacionDocente(actividadId: number, docenteId: number, rolDocenteId: number): Promise<({
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
    }) | null>;
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
    validarDocente(docenteId: number): Promise<{
        id: number;
        nombre: string;
        apellido: string;
        esDocenteActivo: boolean;
    } | null>;
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
    findParticipacionByPersonaAndActividad(actividadId: number, personaId: number): Promise<{
        id: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        activa: boolean;
    } | null>;
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
    } | null>;
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
    private parseTimeToDate;
    static formatTime(date: Date): string;
    static minutesToTime(minutes: number): string;
    static timeToMinutes(time: string): number;
}
//# sourceMappingURL=actividad.repository.d.ts.map