import { CategoriaSocio } from '@prisma/client';
import { CategoriaSocioRepository } from '@/repositories/categoria-socio.repository';
import { CreateCategoriaSocioDto, UpdateCategoriaSocioDto, CategoriaSocioQueryDto } from '@/dto/categoria-socio.dto';
export declare class CategoriaSocioService {
    private categoriaSocioRepository;
    constructor(categoriaSocioRepository: CategoriaSocioRepository);
    getCategorias(query?: CategoriaSocioQueryDto): Promise<CategoriaSocio[]>;
    getCategoriaById(id: string): Promise<CategoriaSocio>;
    getCategoriaByCodigo(codigo: string): Promise<CategoriaSocio>;
    createCategoria(data: CreateCategoriaSocioDto): Promise<CategoriaSocio>;
    updateCategoria(id: string, data: UpdateCategoriaSocioDto): Promise<CategoriaSocio>;
    deleteCategoria(id: string): Promise<void>;
    getStats(id: string): Promise<{
        categoria: CategoriaSocio;
        stats: {
            totalPersonas: number;
            totalCuotas: number;
            totalRecaudado: number;
        };
    }>;
    toggleActive(id: string): Promise<CategoriaSocio>;
    reorder(categoriaIds: string[]): Promise<void>;
}
//# sourceMappingURL=categoria-socio.service.d.ts.map