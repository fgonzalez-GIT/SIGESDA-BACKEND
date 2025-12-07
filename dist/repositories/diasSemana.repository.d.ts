import { PrismaClient } from '@prisma/client';
export declare class DiasSemanaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findAll(): Promise<{
        codigo: string;
        nombre: string;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: number): Promise<{
        codigo: string;
        nombre: string;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByCodigo(codigo: string): Promise<{
        codigo: string;
        nombre: string;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=diasSemana.repository.d.ts.map