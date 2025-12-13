import { PrismaClient } from '@prisma/client';
import { CreateEstadoEquipamientoDto, UpdateEstadoEquipamientoDto, ReorderEstadoEquipamientoDto } from '@/dto/estados-equipamiento.dto';
export declare class EstadosEquipamientoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateEstadoEquipamientoDto): Promise<any>;
    findAll(options?: {
        includeInactive?: boolean;
        search?: string;
        orderBy?: string;
        orderDir?: 'asc' | 'desc';
    }): Promise<any>;
    findById(id: number): Promise<any>;
    findByCodigo(codigo: string): Promise<any>;
    update(id: number, data: UpdateEstadoEquipamientoDto): Promise<any>;
    delete(id: number): Promise<any>;
    reorder(data: ReorderEstadoEquipamientoDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=estados-equipamiento.repository.d.ts.map