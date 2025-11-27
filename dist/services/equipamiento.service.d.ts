import { Equipamiento } from '@prisma/client';
import { EquipamientoRepository } from '@/repositories/equipamiento.repository';
import { CreateEquipamientoDto, UpdateEquipamientoDto, EquipamientoQueryDto } from '@/dto/equipamiento.dto';
export declare class EquipamientoService {
    private equipamientoRepository;
    constructor(equipamientoRepository: EquipamientoRepository);
    private generateCodigoEquipamiento;
    createEquipamiento(data: CreateEquipamientoDto): Promise<Equipamiento>;
    getEquipamientos(query: EquipamientoQueryDto): Promise<{
        data: Equipamiento[];
        total: number;
        pages: number;
    }>;
    getEquipamientoById(id: number): Promise<Equipamiento | null>;
    updateEquipamiento(id: number, data: UpdateEquipamientoDto): Promise<Equipamiento>;
    deleteEquipamiento(id: number, hard?: boolean): Promise<Equipamiento>;
    reactivateEquipamiento(id: number): Promise<Equipamiento>;
    getEquipamientoStats(id: number): Promise<any>;
}
//# sourceMappingURL=equipamiento.service.d.ts.map