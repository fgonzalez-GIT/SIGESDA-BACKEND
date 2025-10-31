import { ActividadRepository } from '@/repositories/actividad.repository';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
export declare class ActividadService {
    private actividadRepository;
    constructor(actividadRepository: ActividadRepository);
    createActividad(data: CreateActividadDto): Promise<{
        id: number;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        descripcion: string | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
        capacidadMaxima: number | null;
    }>;
    private validateHorarios;
    getActividades(query: QueryActividadesDto): Promise<{
        pages: number;
        data: {
            id: number;
            tipo: import(".prisma/client").$Enums.TipoActividad;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            activa: boolean;
            descripcion: string | null;
            precio: import("@prisma/client/runtime/library").Decimal;
            duracion: number | null;
            capacidadMaxima: number | null;
        }[];
        total: number;
    }>;
    getActividadById(id: number): Promise<{
        id: number;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        descripcion: string | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
        capacidadMaxima: number | null;
    }>;
    getActividadByCodigo(codigo: string): Promise<{
        id: number;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        descripcion: string | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
        capacidadMaxima: number | null;
    }>;
    updateActividad(id: number, data: UpdateActividadDto): Promise<{
        id: number;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        descripcion: string | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
        capacidadMaxima: number | null;
    }>;
    deleteActividad(id: number): Promise<{
        message: string;
    }>;
    cambiarEstado(id: number, nuevoEstadoId: number, observaciones?: string): Promise<{
        id: number;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        descripcion: string | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
        capacidadMaxima: number | null;
    }>;
    agregarHorario(actividadId: number, horarioData: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        actividadId: number;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
    }>;
    actualizarHorario(horarioId: number, horarioData: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        actividadId: number;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
    }>;
    eliminarHorario(horarioId: number): Promise<{
        message: string;
    }>;
    getHorariosByActividad(actividadId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        actividadId: number;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
    }[]>;
    asignarDocente(actividadId: number, docenteId: number, rolDocenteId: number, observaciones?: string): Promise<any>;
    desasignarDocente(actividadId: number, docenteId: number, rolDocenteId: number): Promise<any>;
    getDocentesByActividad(actividadId: number): Promise<any>;
    getDocentesDisponibles(): Promise<{
        id: number;
        nombre: string;
        apellido: string;
        email: string | null;
        telefono: string | null;
        especialidad: string | null;
        honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    getParticipantes(actividadId: number): Promise<any>;
    addParticipante(actividadId: number, personaId: number, fechaInicio: string, observaciones?: string): Promise<any>;
    deleteParticipante(actividadId: number, participanteId: number): Promise<any>;
    getEstadisticas(actividadId: number): Promise<{
        totalParticipantes: any;
        totalHorarios: any;
        totalDocentes: any;
        cupoMaximo: any;
        cupoDisponible: number | null;
        porcentajeOcupacion: number | null;
        estaLlena: boolean;
    }>;
    getCatalogos(): Promise<{
        tipos: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            activo: boolean;
            descripcion: string | null;
            codigo: string;
            orden: number;
        }[];
        categorias: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            activo: boolean;
            descripcion: string | null;
            codigo: string;
            orden: number;
        }[];
        estados: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            activo: boolean;
            descripcion: string | null;
            codigo: string;
            orden: number;
        }[];
        diasSemana: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            codigo: string;
            orden: number;
        }[];
        rolesDocentes: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            activo: boolean;
            descripcion: string | null;
            codigo: string;
            orden: number;
        }[];
    }>;
    getTiposActividades(): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }[]>;
    getCategoriasActividades(): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }[]>;
    getEstadosActividades(): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }[]>;
    getDiasSemana(): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        codigo: string;
        orden: number;
    }[]>;
    getRolesDocentes(): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }[]>;
    duplicarActividad(idOriginal: number, nuevoCodigoActividad: string, nuevoNombre: string, nuevaFechaDesde: string | Date, nuevaFechaHasta?: string | Date | null, copiarHorarios?: boolean, copiarDocentes?: boolean): Promise<{
        id: number;
        tipo: import(".prisma/client").$Enums.TipoActividad;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activa: boolean;
        descripcion: string | null;
        precio: import("@prisma/client/runtime/library").Decimal;
        duracion: number | null;
        capacidadMaxima: number | null;
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
            cupoMaximo: any;
            costo: any;
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