import { DiasSemanaRepository } from '@/repositories/diasSemana.repository';
export declare class DiasSemanaService {
    private repository;
    constructor(repository: DiasSemanaRepository);
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
//# sourceMappingURL=diasSemana.service.d.ts.map