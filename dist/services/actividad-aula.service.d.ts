import { PrismaClient, actividades_aulas } from '@prisma/client';
import { ActividadAulaRepository } from '@/repositories/actividad-aula.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { AulaRepository } from '@/repositories/aula.repository';
import { CreateActividadAulaDto, UpdateActividadAulaDto, QueryActividadesAulasDto, DesasignarAulaDto, VerificarDisponibilidadDto, DisponibilidadResponse, AsignarMultiplesAulasDto, CambiarAulaDto } from '@/dto/actividad-aula.dto';
export declare class ActividadAulaService {
    private actividadAulaRepository;
    private actividadRepository;
    private aulaRepository;
    private prisma;
    constructor(actividadAulaRepository: ActividadAulaRepository, actividadRepository: ActividadRepository, aulaRepository: AulaRepository, prisma: PrismaClient);
    asignarAula(data: CreateActividadAulaDto): Promise<actividades_aulas>;
    findAll(query: QueryActividadesAulasDto): Promise<{
        data: {
            id: number;
            actividadId: number;
            aulaId: number;
            fechaAsignacion: Date;
            fechaDesasignacion: Date | null;
            activa: boolean;
            prioridad: number | null;
            observaciones: string | null;
            createdAt: Date;
            updatedAt: Date;
            actividades: {
                id: number;
                nombre: string;
                codigoActividad: string;
                capacidadMaxima: number | null;
                activa: boolean;
            };
            aulas: {
                id: number;
                nombre: string;
                capacidad: number;
                ubicacion: string | null;
                activa: boolean;
            };
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findById(id: number): Promise<{
        id: number;
        actividadId: number;
        aulaId: number;
        fechaAsignacion: Date;
        fechaDesasignacion: Date | null;
        activa: boolean;
        prioridad: number | null;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            capacidadMaxima: number | null;
            activa: boolean;
        };
        aulas: {
            id: number;
            nombre: string;
            capacidad: number;
            ubicacion: string | null;
            activa: boolean;
        };
    }>;
    getAulasByActividad(actividadId: number, soloActivas?: boolean): Promise<{
        id: number;
        actividadId: number;
        aulaId: number;
        fechaAsignacion: Date;
        fechaDesasignacion: Date | null;
        activa: boolean;
        prioridad: number | null;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            capacidadMaxima: number | null;
            activa: boolean;
        };
        aulas: {
            id: number;
            nombre: string;
            capacidad: number;
            ubicacion: string | null;
            activa: boolean;
        };
    }[]>;
    getActividadesByAula(aulaId: number, soloActivas?: boolean): Promise<{
        id: number;
        actividadId: number;
        aulaId: number;
        fechaAsignacion: Date;
        fechaDesasignacion: Date | null;
        activa: boolean;
        prioridad: number | null;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            capacidadMaxima: number | null;
            activa: boolean;
        };
        aulas: {
            id: number;
            nombre: string;
            capacidad: number;
            ubicacion: string | null;
            activa: boolean;
        };
    }[]>;
    update(id: number, data: UpdateActividadAulaDto): Promise<{
        id: number;
        actividadId: number;
        aulaId: number;
        fechaAsignacion: Date;
        fechaDesasignacion: Date | null;
        activa: boolean;
        prioridad: number | null;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            capacidadMaxima: number | null;
            activa: boolean;
        };
        aulas: {
            id: number;
            nombre: string;
            capacidad: number;
            ubicacion: string | null;
            activa: boolean;
        };
    }>;
    delete(id: number): Promise<{
        id: number;
        actividadId: number;
        aulaId: number;
        fechaAsignacion: Date;
        fechaDesasignacion: Date | null;
        activa: boolean;
        prioridad: number | null;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            capacidadMaxima: number | null;
            activa: boolean;
        };
        aulas: {
            id: number;
            nombre: string;
            capacidad: number;
            ubicacion: string | null;
            activa: boolean;
        };
    }>;
    desasignarAula(id: number, data: DesasignarAulaDto): Promise<{
        id: number;
        actividadId: number;
        aulaId: number;
        fechaAsignacion: Date;
        fechaDesasignacion: Date | null;
        activa: boolean;
        prioridad: number | null;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            capacidadMaxima: number | null;
            activa: boolean;
        };
        aulas: {
            id: number;
            nombre: string;
            capacidad: number;
            ubicacion: string | null;
            activa: boolean;
        };
    }>;
    reactivarAsignacion(id: number): Promise<{
        id: number;
        actividadId: number;
        aulaId: number;
        fechaAsignacion: Date;
        fechaDesasignacion: Date | null;
        activa: boolean;
        prioridad: number | null;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            capacidadMaxima: number | null;
            activa: boolean;
        };
        aulas: {
            id: number;
            nombre: string;
            capacidad: number;
            ubicacion: string | null;
            activa: boolean;
        };
    }>;
    verificarDisponibilidad(data: VerificarDisponibilidadDto): Promise<DisponibilidadResponse>;
    sugerirAulasParaActividad(actividadId: number, criterios?: any): Promise<any[]>;
    asignarMultiplesAulas(data: AsignarMultiplesAulasDto): Promise<{
        asignacionesCreadas: {
            observaciones: string | null;
            fechaDesasignacion: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            fechaAsignacion: Date;
            actividadId: number;
            activa: boolean;
            aulaId: number;
            prioridad: number | null;
        }[];
        errores: {
            aulaId: number;
            error: any;
        }[];
        totalCreadas: number;
        totalErrores: number;
    }>;
    cambiarAula(actividadId: number, aulaIdActual: number, data: CambiarAulaDto): Promise<{
        asignacionAnterior: {
            id: number;
            actividadId: number;
            aulaId: number;
            fechaAsignacion: Date;
            fechaDesasignacion: Date | null;
            activa: boolean;
            prioridad: number | null;
            observaciones: string | null;
            createdAt: Date;
            updatedAt: Date;
            actividades: {
                id: number;
                nombre: string;
                codigoActividad: string;
                capacidadMaxima: number | null;
                activa: boolean;
            };
            aulas: {
                id: number;
                nombre: string;
                capacidad: number;
                ubicacion: string | null;
                activa: boolean;
            };
        };
        nuevaAsignacion: {
            observaciones: string | null;
            fechaDesasignacion: Date | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            fechaAsignacion: Date;
            actividadId: number;
            activa: boolean;
            aulaId: number;
            prioridad: number | null;
        };
    }>;
    getOcupacionAula(aulaId: number): Promise<{
        aula: {
            id: number;
            nombre: string;
            capacidad: number;
            ubicacion: string | null;
        };
        ocupacion: any;
    }>;
}
//# sourceMappingURL=actividad-aula.service.d.ts.map