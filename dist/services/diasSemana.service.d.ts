import { DiasSemanaRepository } from '@/repositories/diasSemana.repository';
export declare class DiasSemanaService {
    private repository;
    constructor(repository: DiasSemanaRepository);
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
//# sourceMappingURL=diasSemana.service.d.ts.map