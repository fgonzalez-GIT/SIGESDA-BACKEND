import { PrismaClient } from '@prisma/client';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
export declare class ActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateActividadDto): Promise<{
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
    findAll(query: QueryActividadesDto): Promise<{
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
    findById(id: number): Promise<{
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
    } | null>;
    findByCodigoActividad(codigo: string): Promise<{
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
    } | null>;
    update(id: number, data: UpdateActividadDto): Promise<{
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
    delete(id: number): Promise<{
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
    updateHorario(horarioId: number, horarioData: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
        actividadId: string;
    }>;
    deleteHorario(horarioId: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
        actividadId: string;
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
    findHorarioById(horarioId: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
        actividadId: string;
    } | null>;
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
    findParticipacionByPersonaAndActividad(actividadId: number, personaId: number): Promise<any>;
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
    } | null>;
    getTiposActividades(): Promise<any>;
    getCategoriasActividades(): Promise<any>;
    getEstadosActividades(): Promise<any>;
    getDiasSemana(): Promise<any>;
    getRolesDocentes(): Promise<any>;
    private parseTimeToDate;
    static formatTime(date: Date): string;
    static minutesToTime(minutes: number): string;
    static timeToMinutes(time: string): number;
}
//# sourceMappingURL=actividad.repository.d.ts.map