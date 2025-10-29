import { CategoriasActividadRepository } from '@/repositories/categoriasActividad.repository';
import { CreateCategoriaActividadDto, UpdateCategoriaActividadDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class CategoriasActividadService {
    private repository;
    constructor(repository: CategoriasActividadRepository);
    create(data: CreateCategoriaActividadDto): Promise<any>;
    findAll(query: QueryTiposCatalogoDto): Promise<any>;
    findById(id: number): Promise<any>;
    update(id: number, data: UpdateCategoriaActividadDto): Promise<any>;
    delete(id: number): Promise<any>;
    reorder(data: ReorderCatalogoDto): Promise<{
        message: string;
        count: number;
    }>;
    getActivas(): Promise<any>;
}
//# sourceMappingURL=categoriasActividad.service.d.ts.map