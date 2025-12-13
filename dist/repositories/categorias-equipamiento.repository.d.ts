import { PrismaClient } from '@prisma/client';
import { CreateCategoriaEquipamientoDto, UpdateCategoriaEquipamientoDto, ReorderCategoriaEquipamientoDto } from '@/dto/categorias-equipamiento.dto';
export declare class CategoriasEquipamientoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateCategoriaEquipamientoDto): Promise<any>;
    findAll(options?: {
        includeInactive?: boolean;
        search?: string;
        orderBy?: string;
        orderDir?: 'asc' | 'desc';
    }): Promise<any>;
    findById(id: number): Promise<any>;
    findByCodigo(codigo: string): Promise<any>;
    update(id: number, data: UpdateCategoriaEquipamientoDto): Promise<any>;
    delete(id: number): Promise<any>;
    reorder(data: ReorderCategoriaEquipamientoDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=categorias-equipamiento.repository.d.ts.map