import { PrismaClient, asistencias } from '@prisma/client';
import { CreateAsistenciaDto, RegistroAsistenciaMasivaDto, UpdateAsistenciaDto, AsistenciaQueryDto, ReporteAsistenciasDto, TasaAsistenciaDto, AlertasInasistenciasDto } from '@/dto/asistencia.dto';
type AsistenciaConRelaciones = asistencias & {
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
};
export declare class AsistenciaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateAsistenciaDto): Promise<AsistenciaConRelaciones>;
    bulkCreate(data: RegistroAsistenciaMasivaDto): Promise<number>;
    findAll(query: AsistenciaQueryDto): Promise<{
        data: AsistenciaConRelaciones[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: number): Promise<AsistenciaConRelaciones | null>;
    findByParticipacion(participacionId: number): Promise<AsistenciaConRelaciones[]>;
    findByActividad(actividadId: number, fechaDesde?: Date, fechaHasta?: Date): Promise<AsistenciaConRelaciones[]>;
    findByPersona(personaId: string, fechaDesde?: Date, fechaHasta?: Date): Promise<AsistenciaConRelaciones[]>;
    update(id: number, data: UpdateAsistenciaDto): Promise<AsistenciaConRelaciones>;
    delete(id: number): Promise<AsistenciaConRelaciones>;
    getTasaAsistencia(params: TasaAsistenciaDto): Promise<{
        participacionId: number;
        totalSesiones: number;
        asistencias: number;
        inasistencias: number;
        inasistenciasJustificadas: number;
        tasaAsistencia: number;
    }>;
    getAlertasInasistencias(params: AlertasInasistenciasDto): Promise<any[]>;
    getReporteAsistencias(params: ReporteAsistenciasDto): Promise<any[]>;
    existeAsistencia(participacionId: number, fechaSesion: Date): Promise<boolean>;
    getEstadisticasGenerales(actividadId?: number, fechaDesde?: Date, fechaHasta?: Date): Promise<{
        totalSesiones: number;
        totalAsistencias: number;
        totalInasistencias: number;
        totalJustificadas: number;
        tasaAsistenciaGeneral: number;
    }>;
}
export {};
//# sourceMappingURL=asistencia.repository.d.ts.map