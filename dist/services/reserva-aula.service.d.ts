import { ReservaAula } from '@prisma/client';
import { ReservaAulaRepository } from '@/repositories/reserva-aula.repository';
import { AulaRepository } from '@/repositories/aula.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { CreateReservaAulaDto, UpdateReservaAulaDto, ReservaAulaQueryDto, ConflictDetectionDto, CreateBulkReservasDto, DeleteBulkReservasDto, CreateRecurringReservaDto, ReservaSearchDto, ReservaStatsDto } from '@/dto/reserva-aula.dto';
export declare class ReservaAulaService {
    private reservaAulaRepository;
    private aulaRepository;
    private personaRepository;
    private actividadRepository;
    constructor(reservaAulaRepository: ReservaAulaRepository, aulaRepository: AulaRepository, personaRepository: PersonaRepository, actividadRepository: ActividadRepository);
    createReserva(data: CreateReservaAulaDto): Promise<ReservaAula>;
    getReservas(query: ReservaAulaQueryDto): Promise<{
        data: ReservaAula[];
        total: number;
        pages: number;
    }>;
    getReservaById(id: string): Promise<ReservaAula | null>;
    getReservasByAula(aulaId: string, incluirPasadas?: boolean): Promise<ReservaAula[]>;
    getReservasByDocente(docenteId: string, incluirPasadas?: boolean): Promise<ReservaAula[]>;
    getReservasByActividad(actividadId: string, incluirPasadas?: boolean): Promise<ReservaAula[]>;
    updateReserva(id: string, data: UpdateReservaAulaDto): Promise<ReservaAula>;
    deleteReserva(id: string): Promise<ReservaAula>;
    detectConflicts(conflictData: ConflictDetectionDto): Promise<ReservaAula[]>;
    createBulkReservas(data: CreateBulkReservasDto): Promise<{
        count: number;
        errors: string[];
    }>;
    deleteBulkReservas(data: DeleteBulkReservasDto): Promise<{
        count: number;
    }>;
    createRecurringReserva(data: CreateRecurringReservaDto): Promise<{
        count: number;
        errors: string[];
    }>;
    searchReservas(searchData: ReservaSearchDto): Promise<ReservaAula[]>;
    getStatistics(statsData: ReservaStatsDto): Promise<any>;
    getUpcomingReservations(limit?: number): Promise<ReservaAula[]>;
    getCurrentReservations(): Promise<ReservaAula[]>;
    private validateDocenteAvailability;
}
//# sourceMappingURL=reserva-aula.service.d.ts.map