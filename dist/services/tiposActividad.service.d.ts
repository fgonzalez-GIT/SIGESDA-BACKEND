import { TiposActividadRepository } from '@/repositories/tiposActividad.repository';
import { CreateTipoActividadDto, UpdateTipoActividadDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class TiposActividadService {
    private repository;
    constructor(repository: TiposActividadRepository);
    create(data: CreateTipoActividadDto): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    }>;
    findAll(query: QueryTiposCatalogoDto): Promise<({
        _count: {
            actividades: number;
        };
    } & {
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    })[]>;
    findById(id: number): Promise<{
        _count: {
            actividades: number;
        };
    } & {
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    }>;
    update(id: number, data: UpdateTipoActividadDto): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    }>;
    delete(id: number): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    }>;
    reorder(data: ReorderCatalogoDto): Promise<{
        message: string;
        count: number;
    }>;
    getActivos(): Promise<({
        _count: {
            actividades: number;
        };
    } & {
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    })[]>;
}
//# sourceMappingURL=tiposActividad.service.d.ts.map