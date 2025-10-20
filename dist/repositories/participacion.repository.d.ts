import { PrismaClient, ParticipacionActividad } from '@prisma/client';
import { CreateParticipacionDto, ParticipacionQueryDto, EstadisticasParticipacionDto, ReporteInasistenciasDto } from '@/dto/participacion.dto';
type ParticipacionConRelaciones = ParticipacionActividad & {
    persona: {
        id: string;
        nombre: string;
        apellido: string;
        tipo: string;
    };
    actividad: {
        id: string;
        nombre: string;
        tipo: string;
        precio: number;
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
    findById(id: string): Promise<ParticipacionConRelaciones | null>;
    findByPersonaId(personaId: string): Promise<ParticipacionConRelaciones[]>;
    findByActividadId(actividadId: string): Promise<ParticipacionConRelaciones[]>;
    findParticipacionesActivas(personaId?: string): Promise<ParticipacionConRelaciones[]>;
    update(id: string, data: Partial<CreateParticipacionDto>): Promise<ParticipacionConRelaciones>;
    delete(id: string): Promise<ParticipacionConRelaciones>;
    finalizarParticipacion(id: string, fechaFin?: Date, motivo?: string): Promise<ParticipacionConRelaciones>;
    reactivarParticipacion(id: string): Promise<ParticipacionConRelaciones>;
    verificarConflictosHorarios(personaId: string, fechaInicio: Date, fechaFin?: Date, excluirId?: string): Promise<ParticipacionConRelaciones[]>;
    contarParticipantesPorActividad(actividadId: string): Promise<{
        total: number;
        activos: number;
        inactivos: number;
    }>;
    getEstadisticasParticipacion(params: EstadisticasParticipacionDto): Promise<any[]>;
    getParticipacionesPorVencer(diasAnticipacion?: number): Promise<ParticipacionConRelaciones[]>;
    bulkCreate(participaciones: CreateParticipacionDto[]): Promise<number>;
    transferirParticipacion(id: string, nuevaActividadId: string, fechaTransferencia: Date, conservarFechaInicio?: boolean): Promise<ParticipacionConRelaciones>;
    getReporteInasistencias(params: ReporteInasistenciasDto): Promise<any[]>;
}
export {};
//# sourceMappingURL=participacion.repository.d.ts.map