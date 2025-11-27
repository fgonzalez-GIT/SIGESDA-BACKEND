import { PrismaClient, Equipamiento } from '@prisma/client';
import { CreateEquipamientoDto, UpdateEquipamientoDto, EquipamientoQueryDto } from '@/dto/equipamiento.dto';
export declare class EquipamientoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateEquipamientoDto): Promise<Equipamiento>;
    findAll(query: EquipamientoQueryDto): Promise<{
        data: Equipamiento[];
        total: number;
    }>;
    findById(id: number): Promise<Equipamiento | null>;
    findByNombre(nombre: string): Promise<Equipamiento | null>;
    findByCodigo(codigo: string): Promise<Equipamiento | null>;
    findMaxCodigoByCategoriaPrefix(prefix: string): Promise<string | null>;
    update(id: number, data: UpdateEquipamientoDto): Promise<Equipamiento>;
    delete(id: number): Promise<Equipamiento>;
    softDelete(id: number): Promise<Equipamiento>;
    checkUsageInAulas(id: number): Promise<number>;
}
//# sourceMappingURL=equipamiento.repository.d.ts.map