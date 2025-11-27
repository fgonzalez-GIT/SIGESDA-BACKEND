import { PrismaClient } from '@prisma/client';
import { CreateEstadoReservaDto, UpdateEstadoReservaDto, QueryEstadosReservasDto, ReorderEstadosReservasDto } from '@/dto/estados-reserva.dto';
export declare class EstadoReservaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateEstadoReservaDto): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    findAll(query: QueryEstadosReservasDto): Promise<({
        _count: {
            reservas: number;
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
            reservas: number;
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
    }>;
    update(id: number, data: UpdateEstadoReservaDto): Promise<{
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
    reorder(data: ReorderEstadosReservasDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=estado-reserva.repository.d.ts.map