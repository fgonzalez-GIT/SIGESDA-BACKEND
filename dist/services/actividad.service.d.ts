import { ActividadRepository } from '@/repositories/actividad.repository';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
export declare class ActividadService {
    private actividadRepository;
    constructor(actividadRepository: ActividadRepository);
    createActividad(data: CreateActividadDto): Promise<{
        id: string;
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
            id: string;
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
        id: string;
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
        id: string;
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
        id: string;
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
        id: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
        actividadId: string;
    }>;
    actualizarHorario(horarioId: number, horarioData: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
        actividadId: string;
    }>;
    eliminarHorario(horarioId: number): Promise<{
        message: string;
    }>;
    getHorariosByActividad(actividadId: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
        actividadId: string;
    }[]>;
    asignarDocente(actividadId: number, docenteId: number, rolDocenteId: number, observaciones?: string): Promise<any>;
    desasignarDocente(actividadId: number, docenteId: number, rolDocenteId: number): Promise<any>;
    getDocentesByActividad(actividadId: number): Promise<any>;
    getDocentesDisponibles(): Promise<{
        id: string;
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
        tipos: any;
        categorias: any;
        estados: any;
        diasSemana: any;
        rolesDocentes: any;
    }>;
    getTiposActividades(): Promise<any>;
    getCategoriasActividades(): Promise<any>;
    getEstadosActividades(): Promise<any>;
    getDiasSemana(): Promise<any>;
    getRolesDocentes(): Promise<any>;
    duplicarActividad(idOriginal: number, nuevoCodigoActividad: string, nuevoNombre: string, nuevaFechaDesde: string | Date, nuevaFechaHasta?: string | Date | null, copiarHorarios?: boolean, copiarDocentes?: boolean): Promise<{
        id: string;
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
    getResumenPorTipo(): Promise<any>;
    getHorarioSemanal(): Promise<{
        horarioSemanal: any;
        generadoEn: Date;
    }>;
}
//# sourceMappingURL=actividad.service.d.ts.map