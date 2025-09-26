import { PrismaClient, Actividad, TipoActividad } from '@prisma/client';
import { CreateActividadDto, ActividadQueryDto } from '@/dto/actividad.dto';
export declare class ActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateActividadDto): Promise<Actividad>;
    findAll(query: ActividadQueryDto): Promise<{
        data: Actividad[];
        total: number;
    }>;
    findById(id: string): Promise<Actividad | null>;
    findByTipo(tipo: TipoActividad): Promise<Actividad[]>;
    update(id: string, data: Partial<CreateActividadDto>): Promise<Actividad>;
    delete(id: string): Promise<Actividad>;
    softDelete(id: string): Promise<Actividad>;
    asignarDocente(actividadId: string, docenteId: string): Promise<Actividad>;
    desasignarDocente(actividadId: string, docenteId: string): Promise<Actividad>;
    getParticipantes(actividadId: string): Promise<any[]>;
    getEstadisticas(actividadId: string): Promise<any>;
    getDocentesDisponibles(): Promise<any[]>;
}
//# sourceMappingURL=actividad.repository.d.ts.map