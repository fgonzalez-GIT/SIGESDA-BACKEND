import { CategoriasActividadRepository } from '@/repositories/categoriasActividad.repository';
import { CreateCategoriaActividadDto, UpdateCategoriaActividadDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class CategoriasActividadService {
    private repository;
    constructor(repository: CategoriasActividadRepository);
    create(data: CreateCategoriaActividadDto): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    findAll(query: QueryTiposCatalogoDto): Promise<({
        _count: {
            actividades: number;
        };
    } & {
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    })[]>;
    findById(id: number): Promise<{
        _count: {
            actividades: number;
        };
    } & {
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    update(id: number, data: UpdateCategoriaActividadDto): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    delete(id: number): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    reorder(data: ReorderCatalogoDto): Promise<{
        message: string;
        count: number;
    }>;
    getActivas(): Promise<({
        _count: {
            actividades: number;
        };
    } & {
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    })[]>;
}
//# sourceMappingURL=categoriasActividad.service.d.ts.map