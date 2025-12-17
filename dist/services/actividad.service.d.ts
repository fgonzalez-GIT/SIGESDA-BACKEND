import { ActividadRepository } from '@/repositories/actividad.repository';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
import { PrismaClient } from '@prisma/client';
export declare class ActividadService {
    private actividadRepository;
    private prisma;
    constructor(actividadRepository: ActividadRepository, prisma?: PrismaClient);
    private generateCodigoActividad;
    createActividad(data: CreateActividadDto): Promise<{
        nombre: string;
        descripcion: string | null;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        capacidadMaxima: number | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
    }>;
    private validateHorarios;
    getActividades(query: QueryActividadesDto): Promise<{
        pages: number;
        data: {
            nombre: string;
            descripcion: string | null;
            tipo: import(".prisma/client").$Enums.TipoActividad;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            activa: boolean;
            capacidadMaxima: number | null;
            precio: import("@prisma/client/runtime/library").Decimal;
            duracion: number | null;
        }[];
        total: number;
    }>;
    getActividadById(id: number): Promise<{
        nombre: string;
        descripcion: string | null;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        capacidadMaxima: number | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
    }>;
    getActividadByCodigo(codigo: string): Promise<{
        nombre: string;
        descripcion: string | null;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        capacidadMaxima: number | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
    }>;
    updateActividad(id: number, data: UpdateActividadDto): Promise<{
        nombre: string;
        descripcion: string | null;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        capacidadMaxima: number | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
    } | null>;
    deleteActividad(id: number): Promise<{
        message: string;
    }>;
    cambiarEstado(id: number, nuevoEstadoId: number, observaciones?: string): Promise<{
        nombre: string;
        descripcion: string | null;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        capacidadMaxima: number | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
    }>;
    agregarHorario(actividadId: number, horarioData: any): Promise<{
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
    }>;
    actualizarHorario(horarioId: number, horarioData: any): Promise<{
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
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
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
    }[]>;
    asignarDocente(actividadId: number, docenteId: number, rolDocenteId: number, observaciones?: string): Promise<{
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
        nombre: string;
        descripcion: string | null;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        capacidadMaxima: number | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
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