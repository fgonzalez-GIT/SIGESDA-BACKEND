import { EstadosEquipamientoRepository } from '@/repositories/estados-equipamiento.repository';
import { CreateEstadoEquipamientoDto, UpdateEstadoEquipamientoDto, ReorderEstadoEquipamientoDto } from '@/dto/estados-equipamiento.dto';
export declare class EstadosEquipamientoService {
    private repository;
    constructor(repository: EstadosEquipamientoRepository);
    create(data: CreateEstadoEquipamientoDto): Promise<any>;
    findAll(options?: {
        includeInactive?: boolean;
        search?: string;
        orderBy?: string;
        orderDir?: 'asc' | 'desc';
    }): Promise<any>;
    findById(id: number): Promise<any>;
    update(id: number, data: UpdateEstadoEquipamientoDto): Promise<any>;
    delete(id: number): Promise<any>;
    reorder(data: ReorderEstadoEquipamientoDto): Promise<{
        message: string;
        count: number;
    }>;
    getActivos(): Promise<any>;
}
//# sourceMappingURL=estados-equipamiento.service.d.ts.map