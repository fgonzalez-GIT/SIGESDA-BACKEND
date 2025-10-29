import { PrismaClient } from '@prisma/client';
import { CreateCategoriaActividadDto, UpdateCategoriaActividadDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class CategoriasActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateCategoriaActividadDto): Promise<any>;
    findAll(query: QueryTiposCatalogoDto): Promise<any>;
    findById(id: number): Promise<any>;
    update(id: number, data: UpdateCategoriaActividadDto): Promise<any>;
    delete(id: number): Promise<any>;
    reorder(data: ReorderCatalogoDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=categoriasActividad.repository.d.ts.map