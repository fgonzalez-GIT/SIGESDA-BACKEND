import { PrismaClient } from '@prisma/client';
import { CreateCategoriaActividadDto, UpdateCategoriaActividadDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class CategoriasActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateCategoriaActividadDto): Promise<{
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
    update(id: number, data: UpdateCategoriaActividadDto): Promise<{
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
}
//# sourceMappingURL=categoriasActividad.repository.d.ts.map