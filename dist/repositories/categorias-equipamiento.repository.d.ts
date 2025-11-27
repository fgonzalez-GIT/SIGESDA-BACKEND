import { PrismaClient } from '@prisma/client';
import { CreateCategoriaEquipamientoDto, UpdateCategoriaEquipamientoDto, ReorderCategoriaEquipamientoDto } from '@/dto/categorias-equipamiento.dto';
export declare class CategoriasEquipamientoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateCategoriaEquipamientoDto): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
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
            equipamientos: number;
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
    findByCodigo(codigo: string): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    } | null>;
    update(id: number, data: UpdateCategoriaEquipamientoDto): Promise<{
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
    reorder(data: ReorderCategoriaEquipamientoDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=categorias-equipamiento.repository.d.ts.map