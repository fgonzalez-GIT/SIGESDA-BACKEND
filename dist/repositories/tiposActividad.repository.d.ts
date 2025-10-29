import { PrismaClient } from '@prisma/client';
import { CreateTipoActividadDto, UpdateTipoActividadDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class TiposActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateTipoActividadDto): Promise<any>;
    findAll(query: QueryTiposCatalogoDto): Promise<any>;
    findById(id: number): Promise<any>;
    update(id: number, data: UpdateTipoActividadDto): Promise<any>;
    delete(id: number): Promise<any>;
    reorder(data: ReorderCatalogoDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=tiposActividad.repository.d.ts.map