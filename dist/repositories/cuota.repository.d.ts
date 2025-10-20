import { PrismaClient, Cuota, CategoriaSocio } from '@prisma/client';
import { CreateCuotaDto, CuotaQueryDto, CuotaSearchDto, CuotaStatsDto } from '@/dto/cuota.dto';
export declare class CuotaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateCuotaDto): Promise<Cuota>;
    findAll(query: CuotaQueryDto): Promise<{
        data: Cuota[];
        total: number;
    }>;
    findById(id: string): Promise<Cuota | null>;
    findByReciboId(reciboId: string): Promise<Cuota | null>;
    findByPeriodo(mes: number, anio: number, categoria?: CategoriaSocio): Promise<Cuota[]>;
    findBySocio(socioId: string, limit?: number): Promise<Cuota[]>;
    update(id: string, data: Partial<CreateCuotaDto>): Promise<Cuota>;
    delete(id: string): Promise<Cuota>;
    deleteBulk(ids: string[]): Promise<{
        count: number;
    }>;
    search(searchData: CuotaSearchDto): Promise<Cuota[]>;
    getStatistics(statsData: CuotaStatsDto): Promise<any>;
    getVencidas(): Promise<Cuota[]>;
    getPendientes(): Promise<Cuota[]>;
    getMontoBasePorCategoria(categoria: CategoriaSocio): Promise<number>;
    checkExistePeriodo(mes: number, anio: number, categoria: CategoriaSocio): Promise<boolean>;
    getCuotasPorGenerar(mes: number, anio: number, categorias?: CategoriaSocio[]): Promise<any[]>;
    getResumenMensual(mes: number, anio: number): Promise<any>;
}
//# sourceMappingURL=cuota.repository.d.ts.map