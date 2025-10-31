import { Recibo } from '@prisma/client';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreateReciboDto, UpdateReciboDto, ChangeEstadoReciboDto, ReciboQueryDto, CreateBulkRecibosDto, DeleteBulkRecibosDto, UpdateBulkEstadosDto, ReciboSearchDto, ReciboStatsDto } from '@/dto/recibo.dto';
export declare class ReciboService {
    private reciboRepository;
    private personaRepository;
    constructor(reciboRepository: ReciboRepository, personaRepository: PersonaRepository);
    createRecibo(data: CreateReciboDto): Promise<Recibo>;
    getRecibos(query: ReciboQueryDto): Promise<{
        data: Recibo[];
        total: number;
        pages: number;
    }>;
    getReciboById(id: string): Promise<Recibo | null>;
    getReciboByNumero(numero: string): Promise<Recibo | null>;
    getRecibosByPersona(personaId: string, tipo?: 'emisor' | 'receptor'): Promise<Recibo[]>;
    updateRecibo(id: string, data: UpdateReciboDto): Promise<Recibo>;
    changeEstado(id: string, data: ChangeEstadoReciboDto): Promise<Recibo>;
    deleteRecibo(id: string): Promise<Recibo>;
    createBulkRecibos(data: CreateBulkRecibosDto): Promise<{
        count: number;
        errors: string[];
    }>;
    deleteBulkRecibos(data: DeleteBulkRecibosDto): Promise<{
        count: number;
    }>;
    updateBulkEstados(data: UpdateBulkEstadosDto): Promise<{
        count: number;
    }>;
    searchRecibos(searchData: ReciboSearchDto): Promise<Recibo[]>;
    getStatistics(statsData: ReciboStatsDto): Promise<any>;
    getVencidos(): Promise<Recibo[]>;
    getPendientes(): Promise<Recibo[]>;
    processVencidos(): Promise<{
        count: number;
    }>;
    private validateReceptorByTipo;
    private validateStateTransition;
    private validateBusinessRules;
}
//# sourceMappingURL=recibo.service.d.ts.map