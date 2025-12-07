import { PrismaClient } from '@prisma/client';
import { CreateEstadoReservaDto, UpdateEstadoReservaDto, QueryEstadosReservasDto, ReorderEstadosReservasDto } from '@/dto/estados-reserva.dto';
export declare class EstadoReservaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateEstadoReservaDto): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: QueryEstadosReservasDto): Promise<({
        _count: {
            reservas: number;
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
            reservas: number;
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
    }>;
    update(id: number, data: UpdateEstadoReservaDto): Promise<{
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
    reorder(data: ReorderEstadosReservasDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=estado-reserva.repository.d.ts.map