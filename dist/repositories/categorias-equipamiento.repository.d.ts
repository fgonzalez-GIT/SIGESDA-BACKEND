import { PrismaClient } from '@prisma/client';
import { CreateCategoriaEquipamientoDto, UpdateCategoriaEquipamientoDto, ReorderCategoriaEquipamientoDto } from '@/dto/categorias-equipamiento.dto';
export declare class CategoriasEquipamientoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateCategoriaEquipamientoDto): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(options?: {
        includeInactive?: boolean;
        search?: string;
        orderBy?: string;
        orderDir?: 'asc' | 'desc';
    }): Promise<({
        _count: {
            equipamientos: number;
        };
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findById(id: number): Promise<{
        _count: {
            equipamientos: number;
        };
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByCodigo(codigo: string): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: number, data: UpdateCategoriaEquipamientoDto): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: number): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reorder(data: ReorderCategoriaEquipamientoDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=categorias-equipamiento.repository.d.ts.map