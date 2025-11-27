import { PrismaClient } from '@prisma/client';
import { CreateParticipacionDto, ParticipacionQueryDto, EstadisticasParticipacionDto, ReporteInasistenciasDto } from '@/dto/participacion.dto';
type ParticipacionConRelaciones = {
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
};
export declare class ParticipacionRepository {
    private prisma;
    constructor(prisma: PrismaClient);
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