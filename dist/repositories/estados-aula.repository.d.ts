import { PrismaClient } from '@prisma/client';
import { CreateEstadoAulaDto, UpdateEstadoAulaDto, ReorderEstadoAulaDto } from '@/dto/estados-aula.dto';
export declare class EstadosAulaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateEstadoAulaDto): Promise<{
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
            aulas: number;
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
            aulas: number;
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
    update(id: number, data: UpdateEstadoAulaDto): Promise<{
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
    reorder(data: ReorderEstadoAulaDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=estados-aula.repository.d.ts.map