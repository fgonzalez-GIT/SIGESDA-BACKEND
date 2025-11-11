import { PrismaClient } from '@prisma/client';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
export declare class ActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateActividadDto): Promise<{
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
    findAll(query: QueryActividadesDto): Promise<{
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
    findById(id: number): Promise<{
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
    } | null>;
    findByCodigoActividad(codigo: string): Promise<{
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
    } | null>;
    update(id: number, data: UpdateActividadDto): Promise<{
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
    delete(id: number): Promise<{
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
    updateHorario(horarioId: number, horarioData: any): Promise<{
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
    }>;
    deleteHorario(horarioId: number): Promise<{
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
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
    findHorarioById(horarioId: number): Promise<{
        activo: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        actividadId: number;
        horaInicio: string;
        horaFin: string;
        diaSemana: import(".prisma/client").$Enums.DiaSemana;
    } | null>;
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
        honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
        nombre: string;
        apellido: string;
        email: string | null;
        telefono: string | null;
        especialidad: string | null;
        id: number;
    }[]>;
    getParticipantes(actividadId: number): Promise<any>;
    findParticipacionByPersonaAndActividad(actividadId: number, personaId: number): Promise<any>;
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
    } | null>;
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
    private parseTimeToDate;
    static formatTime(date: Date): string;
    static minutesToTime(minutes: number): string;
    static timeToMinutes(time: string): number;
}
//# sourceMappingURL=actividad.repository.d.ts.map