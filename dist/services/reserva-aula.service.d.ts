import { ReservaAula, PrismaClient } from '@prisma/client';
import { ReservaAulaRepository } from '@/repositories/reserva-aula.repository';
import { AulaRepository } from '@/repositories/aula.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { CreateReservaAulaDto, UpdateReservaAulaDto, ReservaAulaQueryDto, ConflictDetectionDto, CreateBulkReservasDto, DeleteBulkReservasDto, CreateRecurringReservaDto, ReservaSearchDto, ReservaStatsDto, AprobarReservaDto, RechazarReservaDto, CancelarReservaDto } from '@/dto/reserva-aula.dto';
export declare class ReservaAulaService {
    private reservaAulaRepository;
    private aulaRepository;
    private personaRepository;
    private actividadRepository;
    private prisma;
    private estadoReservaService;
    constructor(reservaAulaRepository: ReservaAulaRepository, aulaRepository: AulaRepository, personaRepository: PersonaRepository, actividadRepository: ActividadRepository, prisma: PrismaClient);
    createReserva(data: CreateReservaAulaDto): Promise<ReservaAula>;
    getReservas(query: ReservaAulaQueryDto): Promise<{
        data: ReservaAula[];
        total: number;
        pages: number;
    }>;
    getReservaById(id: number): Promise<ReservaAula | null>;
    getReservasByAula(aulaId: string, incluirPasadas?: boolean): Promise<ReservaAula[]>;
    getReservasByDocente(docenteId: string, incluirPasadas?: boolean): Promise<ReservaAula[]>;
    getReservasByActividad(actividadId: string, incluirPasadas?: boolean): Promise<ReservaAula[]>;
    updateReserva(id: number, data: UpdateReservaAulaDto): Promise<ReservaAula>;
    deleteReserva(id: number): Promise<ReservaAula>;
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
    aprobarReserva(id: number, data: AprobarReservaDto): Promise<ReservaAula>;
    rechazarReserva(id: number, data: RechazarReservaDto): Promise<ReservaAula>;
    cancelarReserva(id: number, data: CancelarReservaDto): Promise<ReservaAula>;
    completarReserva(id: number): Promise<ReservaAula>;
    detectAllConflicts(conflictData: ConflictDetectionDto): Promise<{
        puntuales: ReservaAula[];
        recurrentes: any[];
        total: number;
    }>;
    validateCapacidadAula(aulaId: number, actividadId?: number): Promise<boolean>;
    validateEquipamientoRequerido(aulaId: number, actividadId?: number): Promise<boolean>;
    validateHorarioOperacion(aulaId: number, fechaInicio: string, fechaFin: string): Promise<boolean>;
}
//# sourceMappingURL=reserva-aula.service.d.ts.map