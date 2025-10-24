import { AsistenciaRepository } from '@/repositories/asistencia.repository';
import { ParticipacionRepository } from '@/repositories/participacion.repository';
import { CreateAsistenciaDto, RegistroAsistenciaMasivaDto, UpdateAsistenciaDto, AsistenciaQueryDto, ReporteAsistenciasDto, TasaAsistenciaDto, AlertasInasistenciasDto } from '@/dto/asistencia.dto';
export declare class AsistenciaService {
    private asistenciaRepository;
    private participacionRepository;
    constructor(asistenciaRepository: AsistenciaRepository, participacionRepository: ParticipacionRepository);
    create(data: CreateAsistenciaDto): Promise<{
        id: number;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        asistio: boolean;
        justificada: boolean;
        participacion_id: number;
        fecha_sesion: Date;
    } & {
        participacion: {
            id: number;
            personaId: string;
            actividadId: number;
            persona: {
                id: string;
                nombre: string;
                apellido: string;
                tipo: string;
            };
            actividad: {
                id: number;
                nombre: string;
                tipo: string;
            };
        };
    }>;
    registroMasivo(data: RegistroAsistenciaMasivaDto): Promise<{
        totalCreadas: number;
        actividadId: number;
        fechaSesion: string;
        mensaje: string;
    }>;
    findAll(query: AsistenciaQueryDto): Promise<{
        data: ({
            id: number;
            observaciones: string | null;
            created_at: Date;
            updated_at: Date;
            asistio: boolean;
            justificada: boolean;
            participacion_id: number;
            fecha_sesion: Date;
        } & {
            participacion: {
                id: number;
                personaId: string;
                actividadId: number;
                persona: {
                    id: string;
                    nombre: string;
                    apellido: string;
                    tipo: string;
                };
                actividad: {
                    id: number;
                    nombre: string;
                    tipo: string;
                };
            };
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: number): Promise<{
        id: number;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        asistio: boolean;
        justificada: boolean;
        participacion_id: number;
        fecha_sesion: Date;
    } & {
        participacion: {
            id: number;
            personaId: string;
            actividadId: number;
            persona: {
                id: string;
                nombre: string;
                apellido: string;
                tipo: string;
            };
            actividad: {
                id: number;
                nombre: string;
                tipo: string;
            };
        };
    }>;
    findByParticipacion(participacionId: number): Promise<({
        id: number;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        asistio: boolean;
        justificada: boolean;
        participacion_id: number;
        fecha_sesion: Date;
    } & {
        participacion: {
            id: number;
            personaId: string;
            actividadId: number;
            persona: {
                id: string;
                nombre: string;
                apellido: string;
                tipo: string;
            };
            actividad: {
                id: number;
                nombre: string;
                tipo: string;
            };
        };
    })[]>;
    findByActividad(actividadId: number, fechaDesde?: Date, fechaHasta?: Date): Promise<({
        id: number;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        asistio: boolean;
        justificada: boolean;
        participacion_id: number;
        fecha_sesion: Date;
    } & {
        participacion: {
            id: number;
            personaId: string;
            actividadId: number;
            persona: {
                id: string;
                nombre: string;
                apellido: string;
                tipo: string;
            };
            actividad: {
                id: number;
                nombre: string;
                tipo: string;
            };
        };
    })[]>;
    findByPersona(personaId: string, fechaDesde?: Date, fechaHasta?: Date): Promise<({
        id: number;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        asistio: boolean;
        justificada: boolean;
        participacion_id: number;
        fecha_sesion: Date;
    } & {
        participacion: {
            id: number;
            personaId: string;
            actividadId: number;
            persona: {
                id: string;
                nombre: string;
                apellido: string;
                tipo: string;
            };
            actividad: {
                id: number;
                nombre: string;
                tipo: string;
            };
        };
    })[]>;
    update(id: number, data: UpdateAsistenciaDto): Promise<{
        id: number;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        asistio: boolean;
        justificada: boolean;
        participacion_id: number;
        fecha_sesion: Date;
    } & {
        participacion: {
            id: number;
            personaId: string;
            actividadId: number;
            persona: {
                id: string;
                nombre: string;
                apellido: string;
                tipo: string;
            };
            actividad: {
                id: number;
                nombre: string;
                tipo: string;
            };
        };
    }>;
    delete(id: number): Promise<{
        id: number;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        asistio: boolean;
        justificada: boolean;
        participacion_id: number;
        fecha_sesion: Date;
    } & {
        participacion: {
            id: number;
            personaId: string;
            actividadId: number;
            persona: {
                id: string;
                nombre: string;
                apellido: string;
                tipo: string;
            };
            actividad: {
                id: number;
                nombre: string;
                tipo: string;
            };
        };
    }>;
    getTasaAsistencia(params: TasaAsistenciaDto): Promise<{
        participacion: {
            id: number;
            persona: string;
            actividad: any;
        };
        participacionId: number;
        totalSesiones: number;
        asistencias: number;
        inasistencias: number;
        inasistenciasJustificadas: number;
        tasaAsistencia: number;
    }>;
    getAlertasInasistencias(params: AlertasInasistenciasDto): Promise<{
        umbral: number;
        totalAlertas: number;
        alertas: {
            participacionId: any;
            personaId: any;
            nombreCompleto: string;
            actividadId: any;
            actividadNombre: any;
            inasistenciasConsecutivas: any;
            periodoInasistencias: {
                desde: any;
                hasta: any;
            };
            severidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
        }[];
    }>;
    getReporteAsistencias(params: ReporteAsistenciasDto): Promise<{
        parametros: {
            fechaDesde: string;
            fechaHasta: string;
            agruparPor: "persona" | "dia" | "actividad" | "mes";
            actividadId: number | undefined;
            personaId: string | undefined;
        };
        totalRegistros: number;
        datos: any[];
    }>;
    getEstadisticasGenerales(actividadId?: number, fechaDesde?: Date, fechaHasta?: Date): Promise<{
        totalSesiones: number;
        totalAsistencias: number;
        totalInasistencias: number;
        totalJustificadas: number;
        tasaAsistenciaGeneral: number;
    }>;
    getDashboardAsistencias(actividadId?: number): Promise<{
        general: {
            totalSesiones: number;
            totalAsistencias: number;
            totalInasistencias: number;
            totalJustificadas: number;
            tasaAsistenciaGeneral: number;
        };
        esteMes: {
            totalSesiones: number;
            totalAsistencias: number;
            totalInasistencias: number;
            totalJustificadas: number;
            tasaAsistenciaGeneral: number;
        };
        estaSemana: {
            totalSesiones: number;
            totalAsistencias: number;
            totalInasistencias: number;
            totalJustificadas: number;
            tasaAsistenciaGeneral: number;
        };
        alertas: {
            total: number;
            criticas: number;
            advertencias: number;
        };
        fecha: Date;
    }>;
    getResumenPersona(personaId: string, fechaDesde?: Date, fechaHasta?: Date): Promise<{
        personaId: string;
        totalSesiones: number;
        asistencias: number;
        inasistencias: number;
        inasistenciasJustificadas: number;
        tasaAsistencia: number;
        actividades: never[];
        nombreCompleto?: undefined;
    } | {
        personaId: string;
        nombreCompleto: string;
        totalSesiones: number;
        asistencias: number;
        inasistencias: number;
        inasistenciasJustificadas: number;
        tasaAsistencia: number;
        actividades: any[];
    }>;
    getResumenActividad(actividadId: number, fechaDesde?: Date, fechaHasta?: Date): Promise<{
        actividadId: number;
        totalSesiones: number;
        totalParticipantes: number;
        asistenciaPromedio: number;
        sesiones: never[];
        actividadNombre?: undefined;
    } | {
        actividadId: number;
        actividadNombre: string;
        totalSesiones: number;
        totalParticipantes: number;
        asistenciaPromedio: number;
        sesiones: any[];
    }>;
    private calcularSeveridad;
    corregirAsistencia(participacionId: number, fechaSesion: Date, asistio: boolean, justificada?: boolean, observaciones?: string): Promise<{
        id: number;
        observaciones: string | null;
        created_at: Date;
        updated_at: Date;
        asistio: boolean;
        justificada: boolean;
        participacion_id: number;
        fecha_sesion: Date;
    } & {
        participacion: {
            id: number;
            personaId: string;
            actividadId: number;
            persona: {
                id: string;
                nombre: string;
                apellido: string;
                tipo: string;
            };
            actividad: {
                id: number;
                nombre: string;
                tipo: string;
            };
        };
    }>;
}
//# sourceMappingURL=asistencia.service.d.ts.map