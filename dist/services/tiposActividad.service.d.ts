import { TiposActividadRepository } from '@/repositories/tiposActividad.repository';
import { CreateTipoActividadDto, UpdateTipoActividadDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class TiposActividadService {
    private repository;
    constructor(repository: TiposActividadRepository);
    create(data: CreateTipoActividadDto): Promise<any>;
    findAll(query: QueryTiposCatalogoDto): Promise<any>;
    findById(id: number): Promise<any>;
    update(id: number, data: UpdateTipoActividadDto): Promise<any>;
    delete(id: number): Promise<any>;
    reorder(data: ReorderCatalogoDto): Promise<{
        message: string;
        count: number;
    }>;
    getActivos(): Promise<any>;
}
//# sourceMappingURL=tiposActividad.service.d.ts.map