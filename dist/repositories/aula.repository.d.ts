import { PrismaClient, Aula } from '@prisma/client';
import { CreateAulaDto, AulaQueryDto } from '@/dto/aula.dto';
export declare class AulaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateAulaDto): Promise<Aula>;
    findAll(query: AulaQueryDto): Promise<{
        data: Aula[];
        total: number;
    }>;
    findById(id: string): Promise<Aula | null>;
    findByNombre(nombre: string): Promise<Aula | null>;
    update(id: string, data: Partial<CreateAulaDto>): Promise<Aula>;
    delete(id: string): Promise<Aula>;
    softDelete(id: string): Promise<Aula>;
    getDisponibles(): Promise<Aula[]>;
    verificarDisponibilidad(aulaId: string, fechaInicio: Date, fechaFin: Date, excluirReservaId?: string): Promise<boolean>;
    getReservasEnPeriodo(aulaId: string, fechaInicio: Date, fechaFin: Date): Promise<any[]>;
    getEstadisticas(aulaId: string): Promise<any>;
    getAulasConMenorUso(): Promise<any[]>;
}
//# sourceMappingURL=aula.repository.d.ts.map