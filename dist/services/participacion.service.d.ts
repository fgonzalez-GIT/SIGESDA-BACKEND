import { ParticipacionRepository } from '@/repositories/participacion.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { AsistenciaRepository } from '@/repositories/asistencia.repository';
import { CreateParticipacionDto, UpdateParticipacionDto, ParticipacionQueryDto, InscripcionMasivaDto, InscripcionMultiplePersonasDto, DesincripcionDto, EstadisticasParticipacionDto, ReporteInasistenciasDto, VerificarCuposDto, TransferirParticipacionDto, EstadoParticipacion } from '@/dto/participacion.dto';
export declare class ParticipacionService {
    private participacionRepository;
    private personaRepository;
    private actividadRepository;
    private asistenciaRepository?;
    constructor(participacionRepository: ParticipacionRepository, personaRepository: PersonaRepository, actividadRepository: ActividadRepository, asistenciaRepository?: AsistenciaRepository | undefined);
    create(data: CreateParticipacionDto): Promise<{
        estado: EstadoParticipacion;
        diasTranscurridos: number;
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }>;
    findAll(query: ParticipacionQueryDto): Promise<{
        data: {
            estado: EstadoParticipacion;
            diasTranscurridos: number;
            id: number;
            personaId: number;
            actividadId: number;
            fechaInicio: Date;
            fechaFin: Date | null;
            precioEspecial: any;
            activa: boolean;
            observaciones: string | null;
            createdAt: Date;
            updatedAt: Date;
            personas: {
                id: number;
                nombre: string;
                apellido: string;
                dni?: string;
                email?: string | null;
            };
            actividades: {
                id: number;
                nombre: string;
                codigoActividad: string;
                costo: any;
                descripcion?: string | null;
                capacidadMaxima?: number | null;
                tipoActividadId: number;
            };
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findById(id: number): Promise<{
        estado: EstadoParticipacion;
        diasTranscurridos: number;
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }>;
    findByPersonaId(personaId: number): Promise<{
        estado: EstadoParticipacion;
        diasTranscurridos: number;
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }[]>;
    findByActividadId(actividadId: number): Promise<{
        estado: EstadoParticipacion;
        diasTranscurridos: number;
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }[]>;
    update(id: number, data: UpdateParticipacionDto): Promise<{
        estado: EstadoParticipacion;
        diasTranscurridos: number;
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }>;
    delete(id: number): Promise<{
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }>;
    inscripcionMasiva(data: InscripcionMasivaDto): Promise<{
        participacionesCreadas: {
            id: number;
            personaId: number;
            actividadId: number;
            fechaInicio: Date;
            fechaFin: Date | null;
            precioEspecial: any;
            activa: boolean;
            observaciones: string | null;
            createdAt: Date;
            updatedAt: Date;
            personas: {
                id: number;
                nombre: string;
                apellido: string;
                dni?: string;
                email?: string | null;
            };
            actividades: {
                id: number;
                nombre: string;
                codigoActividad: string;
                costo: any;
                descripcion?: string | null;
                capacidadMaxima?: number | null;
                tipoActividadId: number;
            };
        }[];
        errores: string[];
        totalCreadas: number;
        totalErrores: number;
    }>;
    inscripcionMultiplePersonas(data: InscripcionMultiplePersonasDto): Promise<{
        participacionesCreadas: {
            personaNombre: string;
            id: number;
            personaId: number;
            actividadId: number;
            fechaInicio: Date;
            fechaFin: Date | null;
            precioEspecial: any;
            activa: boolean;
            observaciones: string | null;
            createdAt: Date;
            updatedAt: Date;
            personas: {
                id: number;
                nombre: string;
                apellido: string;
                dni?: string;
                email?: string | null;
            };
            actividades: {
                id: number;
                nombre: string;
                codigoActividad: string;
                costo: any;
                descripcion?: string | null;
                capacidadMaxima?: number | null;
                tipoActividadId: number;
            };
        }[];
        errores: {
            personaId: number;
            error: string;
        }[];
        totalCreadas: number;
        totalErrores: number;
        actividadNombre: string;
    }>;
    desinscribir(id: number, data: DesincripcionDto): Promise<{
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }>;
    reactivar(id: number): Promise<{
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }>;
    transferir(id: number, data: TransferirParticipacionDto): Promise<{
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }>;
    verificarCupos(data: VerificarCuposDto): Promise<{
        actividad: {
            id: number;
            nombre: string;
            cupoMaximo: number | null;
        };
        participantes: {
            total: number;
            activos: number;
            inactivos: number;
        };
        cuposDisponibles: number | null;
        disponible: boolean;
    }>;
    getEstadisticas(params: EstadisticasParticipacionDto): Promise<any[]>;
    getParticipacionesActivas(personaId?: number): Promise<{
        estado: EstadoParticipacion;
        diasTranscurridos: number;
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }[]>;
    getParticipacionesPorVencer(dias?: number): Promise<{
        estado: EstadoParticipacion;
        diasRestantes: number | null;
        id: number;
        personaId: number;
        actividadId: number;
        fechaInicio: Date;
        fechaFin: Date | null;
        precioEspecial: any;
        activa: boolean;
        observaciones: string | null;
        createdAt: Date;
        updatedAt: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigoActividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipoActividadId: number;
        };
    }[]>;
    getReporteInasistencias(params: ReporteInasistenciasDto): Promise<any[]>;
    getDashboardParticipacion(): Promise<{
        resumen: {
            totalActivas: number;
            nuevasEsteMes: number;
            nuevasEsteAno: number;
            porVencer: number;
        };
        topActividades: any[];
        fecha: Date;
    }>;
}
//# sourceMappingURL=participacion.service.d.ts.map