import { PrismaClient } from '@prisma/client';
import { CreateParticipacionDto, ParticipacionQueryDto, EstadisticasParticipacionDto, ReporteInasistenciasDto } from '@/dto/participacion.dto';
type ParticipacionConRelaciones = {
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
};
export declare class ParticipacionRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    private mapDtoToPrisma;
    create(data: CreateParticipacionDto): Promise<ParticipacionConRelaciones>;
    findAll(query: ParticipacionQueryDto): Promise<{
        data: ParticipacionConRelaciones[];
        total: number;
    }>;
    findById(id: number): Promise<ParticipacionConRelaciones | null>;
    findByPersonaId(personaId: number): Promise<ParticipacionConRelaciones[]>;
    findByActividadId(actividadId: number): Promise<ParticipacionConRelaciones[]>;
    findByPersonaAndActividad(personaId: number, actividadId: number): Promise<ParticipacionConRelaciones | null>;
    findParticipacionesActivas(personaId?: number): Promise<ParticipacionConRelaciones[]>;
    update(id: number, data: Partial<CreateParticipacionDto>): Promise<ParticipacionConRelaciones>;
    delete(id: number): Promise<ParticipacionConRelaciones>;
    finalizarParticipacion(id: number, fechaFin?: Date, motivo?: string): Promise<ParticipacionConRelaciones>;
    reactivarParticipacion(id: number): Promise<ParticipacionConRelaciones>;
    verificarConflictosHorarios(personaId: number, fechaInicio: Date, fechaFin?: Date, excluirId?: number): Promise<ParticipacionConRelaciones[]>;
    contarParticipantesPorActividad(actividadId: number): Promise<{
        total: number;
        activos: number;
        inactivos: number;
    }>;
    getEstadisticasParticipacion(params: EstadisticasParticipacionDto): Promise<any[]>;
    getParticipacionesPorVencer(diasAnticipacion?: number): Promise<ParticipacionConRelaciones[]>;
    bulkCreate(participaciones: CreateParticipacionDto[]): Promise<number>;
    transferirParticipacion(id: number, nuevaActividadId: number, fechaTransferencia: Date, conservarFechaInicio?: boolean): Promise<ParticipacionConRelaciones>;
    getReporteInasistencias(params: ReporteInasistenciasDto): Promise<any[]>;
}
export {};
//# sourceMappingURL=participacion.repository.d.ts.map