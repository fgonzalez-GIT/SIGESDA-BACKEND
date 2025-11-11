import { PrismaClient, Recibo, EstadoRecibo } from '@prisma/client';
import { CreateReciboDto, ReciboQueryDto, ReciboSearchDto, ReciboStatsDto } from '@/dto/recibo.dto';
export declare class ReciboRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateReciboDto & {
        numero: string;
    }): Promise<Recibo>;
    findAll(query: ReciboQueryDto): Promise<{
        data: Recibo[];
        total: number;
    }>;
    findById(id: string): Promise<Recibo | null>;
    findByNumero(numero: string): Promise<Recibo | null>;
    findByPersonaId(personaId: string, tipo?: 'emisor' | 'receptor'): Promise<Recibo[]>;
    update(id: string, data: Partial<CreateReciboDto>): Promise<Recibo>;
    updateEstado(id: string, nuevoEstado: EstadoRecibo, observaciones?: string): Promise<Recibo>;
    delete(id: string): Promise<Recibo>;
    deleteBulk(ids: string[]): Promise<{
        count: number;
    }>;
    createBulk(recibos: (CreateReciboDto & {
        numero: string;
    })[]): Promise<{
        count: number;
    }>;
    updateBulkEstados(ids: string[], nuevoEstado: EstadoRecibo, observaciones?: string): Promise<{
        count: number;
    }>;
    search(searchData: ReciboSearchDto): Promise<Recibo[]>;
    getStatistics(statsData: ReciboStatsDto): Promise<any>;
    getNextNumero(): Promise<string>;
    getVencidos(): Promise<Recibo[]>;
    getPendientes(): Promise<Recibo[]>;
    markVencidosAsVencido(): Promise<{
        count: number;
    }>;
}
//# sourceMappingURL=recibo.repository.d.ts.map