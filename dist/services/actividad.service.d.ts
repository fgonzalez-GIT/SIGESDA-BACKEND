import { ActividadRepository } from '@/repositories/actividad.repository';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
export declare class ActividadService {
    private actividadRepository;
    constructor(actividadRepository: ActividadRepository);
    createActividad(data: CreateActividadDto): Promise<{
        horarios_actividades: {
            activo: boolean;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            actividadId: number;
            horaInicio: string;
            horaFin: string;
            diaSemana: import(".prisma/client").$Enums.DiaSemana;
        }[];
        docentes_actividades: ({
            personas: {
                nombre: string;
                apellido: string;
                email: string | null;
                id: number;
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
    } & {
        nombre: string;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
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
            tipo: import(".prisma/client").$Enums.TipoActividad;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            descripcion: string | null;
            activa: boolean;
            capacidadMaxima: number | null;
            precio: import("@prisma/client/runtime/library").Decimal;
            duracion: number | null;
        }[];
        total: number;
    }>;
    getActividadById(id: number): Promise<{
        nombre: string;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        activa: boolean;
        capacidadMaxima: number | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
    }>;
    getActividadByCodigo(codigo: string): Promise<{
        nombre: string;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        activa: boolean;
        capacidadMaxima: number | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
    }>;
    updateActividad(id: number, data: UpdateActividadDto): Promise<{
        nombre: string;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        activa: boolean;
        capacidadMaxima: number | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
    }>;
    deleteActividad(id: number): Promise<{
        message: string;
    }>;
    cambiarEstado(id: number, nuevoEstadoId: number, observaciones?: string): Promise<{
        nombre: string;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
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
    getDocentesByActividad(actividadId: number): Promise<{
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
    }[]>;
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
    getParticipantes(actividadId: number): Promise<any>;
    addParticipante(actividadId: number, personaId: number, fechaInicio: string, observaciones?: string): Promise<any>;
    deleteParticipante(actividadId: number, participanteId: number): Promise<any>;
    getEstadisticas(actividadId: number): Promise<{
        totalParticipantes: any;
        totalHorarios: any;
        totalDocentes: any;
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
        horarios_actividades: {
            activo: boolean;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            actividadId: number;
            horaInicio: string;
            horaFin: string;
            diaSemana: import(".prisma/client").$Enums.DiaSemana;
        }[];
        docentes_actividades: ({
            personas: {
                nombre: string;
                apellido: string;
                email: string | null;
                id: number;
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
    } & {
        nombre: string;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
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