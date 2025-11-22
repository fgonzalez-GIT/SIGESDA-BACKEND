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
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
        };
    }>;
    findAll(query: ParticipacionQueryDto): Promise<{
        data: {
            estado: EstadoParticipacion;
            diasTranscurridos: number;
            id: number;
            persona_id: number;
            actividad_id: number;
            fecha_inicio: Date;
            fecha_fin: Date | null;
            precio_especial: any;
            activo: boolean;
            observaciones: string | null;
            created_at: Date;
            updated_at: Date;
            personas: {
                id: number;
                nombre: string;
                apellido: string;
                tipo: string;
                dni?: string;
                email?: string | null;
            };
            actividades: {
                id: number;
                nombre: string;
                codigo_actividad: string;
                costo: any;
                descripcion?: string | null;
                capacidadMaxima?: number | null;
                tipo_actividad_id: number;
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
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
        };
    }>;
    findByPersonaId(personaId: number): Promise<{
        estado: EstadoParticipacion;
        diasTranscurridos: number;
        id: number;
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
        };
    }[]>;
    findByActividadId(actividadId: number): Promise<{
        estado: EstadoParticipacion;
        diasTranscurridos: number;
        id: number;
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
        };
    }[]>;
    update(id: number, data: UpdateParticipacionDto): Promise<{
        estado: EstadoParticipacion;
        diasTranscurridos: number;
        id: number;
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
        };
    }>;
    delete(id: number): Promise<{
        id: number;
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
        };
    }>;
    inscripcionMasiva(data: InscripcionMasivaDto): Promise<{
        participacionesCreadas: {
            id: number;
            persona_id: number;
            actividad_id: number;
            fecha_inicio: Date;
            fecha_fin: Date | null;
            precio_especial: any;
            activo: boolean;
            observaciones: string | null;
            created_at: Date;
            updated_at: Date;
            personas: {
                id: number;
                nombre: string;
                apellido: string;
                tipo: string;
                dni?: string;
                email?: string | null;
            };
            actividades: {
                id: number;
                nombre: string;
                codigo_actividad: string;
                costo: any;
                descripcion?: string | null;
                capacidadMaxima?: number | null;
                tipo_actividad_id: number;
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
            persona_id: number;
            actividad_id: number;
            fecha_inicio: Date;
            fecha_fin: Date | null;
            precio_especial: any;
            activo: boolean;
            observaciones: string | null;
            created_at: Date;
            updated_at: Date;
            personas: {
                id: number;
                nombre: string;
                apellido: string;
                tipo: string;
                dni?: string;
                email?: string | null;
            };
            actividades: {
                id: number;
                nombre: string;
                codigo_actividad: string;
                costo: any;
                descripcion?: string | null;
                capacidadMaxima?: number | null;
                tipo_actividad_id: number;
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
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
        };
    }>;
    reactivar(id: number): Promise<{
        id: number;
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
        };
    }>;
    transferir(id: number, data: TransferirParticipacionDto): Promise<{
        id: number;
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
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
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
        };
    }[]>;
    getParticipacionesPorVencer(dias?: number): Promise<{
        estado: EstadoParticipacion;
        diasRestantes: number | null;
        id: number;
        persona_id: number;
        actividad_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: any;
        activo: boolean;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            tipo: string;
            dni?: string;
            email?: string | null;
        };
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
            costo: any;
            descripcion?: string | null;
            capacidadMaxima?: number | null;
            tipo_actividad_id: number;
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