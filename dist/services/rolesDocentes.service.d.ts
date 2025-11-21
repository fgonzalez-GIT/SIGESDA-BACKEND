import { RolesDocentesRepository } from '@/repositories/rolesDocentes.repository';
import { CreateRolDocenteDto, UpdateRolDocenteDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class RolesDocentesService {
    private repository;
    constructor(repository: RolesDocentesRepository);
    create(data: CreateRolDocenteDto): Promise<{
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
            docentes_actividades: number;
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
            docentes_actividades: number;
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
    update(id: number, data: UpdateRolDocenteDto): Promise<{
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
    getActivos(): Promise<({
        _count: {
            docentes_actividades: number;
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
//# sourceMappingURL=rolesDocentes.service.d.ts.map