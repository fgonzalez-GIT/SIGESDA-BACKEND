import { CategoriasEquipamientoRepository } from '@/repositories/categorias-equipamiento.repository';
import { CreateCategoriaEquipamientoDto, UpdateCategoriaEquipamientoDto, ReorderCategoriaEquipamientoDto } from '@/dto/categorias-equipamiento.dto';
export declare class CategoriasEquipamientoService {
    private repository;
    constructor(repository: CategoriasEquipamientoRepository);
    create(data: CreateCategoriaEquipamientoDto): Promise<any>;
    findAll(options?: {
        includeInactive?: boolean;
        search?: string;
        orderBy?: string;
        orderDir?: 'asc' | 'desc';
    }): Promise<any>;
    findById(id: number): Promise<any>;
    update(id: number, data: UpdateCategoriaEquipamientoDto): Promise<any>;
    delete(id: number): Promise<any>;
    reorder(data: ReorderCategoriaEquipamientoDto): Promise<{
        message: string;
        count: number;
    }>;
    getActivos(): Promise<any>;
}
//# sourceMappingURL=categorias-equipamiento.service.d.ts.map