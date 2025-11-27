import { Aula } from '@prisma/client';
import { AulaRepository } from '@/repositories/aula.repository';
import { CreateAulaDto, UpdateAulaDto, AulaQueryDto, DisponibilidadAulaDto } from '@/dto/aula.dto';
export declare class AulaService {
    private aulaRepository;
    constructor(aulaRepository: AulaRepository);
    createAula(data: CreateAulaDto): Promise<Aula>;
    getAulas(query: AulaQueryDto): Promise<{
        data: Aula[];
        total: number;
        pages: number;
    }>;
    getAulaById(id: string): Promise<Aula | null>;
    updateAula(id: string, data: UpdateAulaDto): Promise<Aula>;
    deleteAula(id: string, hard?: boolean): Promise<Aula>;
    getAulasDisponibles(): Promise<Aula[]>;
    verificarDisponibilidad(aulaId: string, data: DisponibilidadAulaDto): Promise<{
        disponible: boolean;
        conflictos?: any[];
    }>;
    getEstadisticas(aulaId: string): Promise<any>;
    getAulasConMenorUso(): Promise<any[]>;
    searchAulas(searchTerm: string): Promise<Aula[]>;
    getAulasPorCapacidad(capacidadMinima: number): Promise<Aula[]>;
    getAulasConEquipamiento(): Promise<Aula[]>;
    getReservasDelAula(aulaId: string, fechaDesde?: string, fechaHasta?: string): Promise<any[]>;
    addEquipamientoToAula(aulaId: number, equipamientoId: number, cantidad: number, observaciones?: string): Promise<any>;
    removeEquipamientoFromAula(aulaId: number, equipamientoId: number): Promise<any>;
    updateEquipamientoCantidad(aulaId: number, equipamientoId: number, cantidad: number, observaciones?: string): Promise<any>;
    getEquipamientosDeAula(aulaId: number): Promise<any[]>;
}
//# sourceMappingURL=aula.service.d.ts.map