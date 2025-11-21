import { PrismaClient } from '@prisma/client';
export declare class DiasSemanaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findAll(): Promise<{
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        codigo: string;
        orden: number;
    }[]>;
    findById(id: number): Promise<{
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        codigo: string;
        orden: number;
    }>;
    findByCodigo(codigo: string): Promise<{
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        codigo: string;
        orden: number;
    }>;
}
//# sourceMappingURL=diasSemana.repository.d.ts.map