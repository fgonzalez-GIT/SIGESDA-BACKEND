import { PrismaClient } from '@prisma/client';
import { CreateCategoriaActividadDto, UpdateCategoriaActividadDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class CategoriasActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateCategoriaActividadDto): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    findAll(query: QueryTiposCatalogoDto): Promise<({
        _count: {
            actividades: number;
        };
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    })[]>;
    findById(id: number): Promise<{
        _count: {
            actividades: number;
        };
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    update(id: number, data: UpdateCategoriaActividadDto): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    delete(id: number): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    reorder(data: ReorderCatalogoDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=categoriasActividad.repository.d.ts.map