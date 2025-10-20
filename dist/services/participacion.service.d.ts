import { ParticipacionRepository } from '@/repositories/participacion.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { AsistenciaRepository } from '@/repositories/asistencia.repository';
import { CreateParticipacionDto, UpdateParticipacionDto, ParticipacionQueryDto, InscripcionMasivaDto, DesincripcionDto, EstadisticasParticipacionDto, ReporteInasistenciasDto, VerificarCuposDto, TransferirParticipacionDto } from '@/dto/participacion.dto';
export declare class ParticipacionService {
    private participacionRepository;
    private personaRepository;
    private actividadRepository;
    private asistenciaRepository?;
    constructor(participacionRepository: ParticipacionRepository, personaRepository: PersonaRepository, actividadRepository: ActividadRepository, asistenciaRepository?: AsistenciaRepository | undefined);
    create(data: CreateParticipacionDto): Promise<any>;
    findAll(query: ParticipacionQueryDto): Promise<{
        data: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<any>;
    findByPersonaId(personaId: string): Promise<any[]>;
    findByActividadId(actividadId: string): Promise<any[]>;
    update(id: string, data: UpdateParticipacionDto): Promise<any>;
    delete(id: string): Promise<any>;
    inscripcionMasiva(data: InscripcionMasivaDto): Promise<{
        participacionesCreadas: any[];
        errores: string[];
        totalCreadas: number;
        totalErrores: number;
    }>;
    desinscribir(id: string, data: DesincripcionDto): Promise<any>;
    reactivar(id: string): Promise<any>;
    transferir(id: string, data: TransferirParticipacionDto): Promise<any>;
    verificarCupos(data: VerificarCuposDto): Promise<{
        actividad: {
            id: number;
            nombre: string;
            capacidadMaxima: any;
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
    getParticipacionesActivas(personaId?: string): Promise<any[]>;
    getParticipacionesPorVencer(dias?: number): Promise<any[]>;
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