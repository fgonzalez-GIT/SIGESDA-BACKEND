import { PrismaClient, ReservaAula } from '@prisma/client';
import { CreateReservaAulaDto, ReservaAulaQueryDto, ConflictDetectionDto, ReservaSearchDto, ReservaStatsDto } from '@/dto/reserva-aula.dto';
export declare class ReservaAulaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateReservaAulaDto): Promise<ReservaAula>;
    findAll(query: ReservaAulaQueryDto): Promise<{
        data: ReservaAula[];
        total: number;
    }>;
    findById(id: string): Promise<ReservaAula | null>;
    findByAulaId(aulaId: string, incluirPasadas?: boolean): Promise<ReservaAula[]>;
    findByDocenteId(docenteId: string, incluirPasadas?: boolean): Promise<ReservaAula[]>;
    findByActividadId(actividadId: string, incluirPasadas?: boolean): Promise<ReservaAula[]>;
    detectConflicts(conflictData: ConflictDetectionDto): Promise<ReservaAula[]>;
    update(id: string, data: Partial<CreateReservaAulaDto>): Promise<ReservaAula>;
    delete(id: string): Promise<ReservaAula>;
    deleteBulk(ids: string[]): Promise<{
        count: number;
    }>;
    createBulk(reservas: CreateReservaAulaDto[]): Promise<{
        count: number;
    }>;
    search(searchData: ReservaSearchDto): Promise<ReservaAula[]>;
    getStatistics(statsData: ReservaStatsDto): Promise<any>;
    getUpcomingReservations(limit?: number): Promise<ReservaAula[]>;
    getCurrentReservations(): Promise<ReservaAula[]>;
}
//# sourceMappingURL=reserva-aula.repository.d.ts.map