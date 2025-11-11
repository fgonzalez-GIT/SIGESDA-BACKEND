import { PrismaClient, CategoriaSocio } from '@prisma/client';
import { CreateCategoriaSocioDto, UpdateCategoriaSocioDto, CategoriaSocioQueryDto } from '@/dto/categoria-socio.dto';
export declare class CategoriaSocioRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findAll(query?: CategoriaSocioQueryDto): Promise<CategoriaSocio[]>;
    findById(id: string): Promise<CategoriaSocio | null>;
    findByCodigo(codigo: string): Promise<CategoriaSocio | null>;
    create(data: CreateCategoriaSocioDto): Promise<CategoriaSocio>;
    update(id: string, data: UpdateCategoriaSocioDto): Promise<CategoriaSocio>;
    delete(id: string): Promise<CategoriaSocio>;
    getStats(id: string): Promise<{
        totalPersonas: number;
        totalCuotas: number;
        totalRecaudado: number;
    }>;
}
//# sourceMappingURL=categoria-socio.repository.d.ts.map