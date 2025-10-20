import { Familiar, TipoParentesco } from '@prisma/client';
import { FamiliarRepository } from '@/repositories/familiar.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreateFamiliarDto, UpdateFamiliarDto, FamiliarQueryDto, CreateBulkFamiliaresDto, DeleteBulkFamiliaresDto, FamiliarSearchDto } from '@/dto/familiar.dto';
export declare class FamiliarService {
    private familiarRepository;
    private personaRepository;
    constructor(familiarRepository: FamiliarRepository, personaRepository: PersonaRepository);
    createFamiliar(data: CreateFamiliarDto): Promise<Familiar>;
    getFamiliares(query: FamiliarQueryDto): Promise<{
        data: Familiar[];
        total: number;
        pages: number;
    }>;
    getFamiliarById(id: string): Promise<Familiar | null>;
    getFamiliarsBySocio(socioId: string, includeInactivos?: boolean): Promise<Familiar[]>;
    updateFamiliar(id: string, data: UpdateFamiliarDto): Promise<Familiar>;
    deleteFamiliar(id: string): Promise<Familiar>;
    createBulkFamiliares(data: CreateBulkFamiliaresDto): Promise<{
        count: number;
        errors: string[];
    }>;
    deleteBulkFamiliares(data: DeleteBulkFamiliaresDto): Promise<{
        count: number;
    }>;
    searchFamiliares(searchData: FamiliarSearchDto): Promise<Familiar[]>;
    getParentescoStats(): Promise<Array<{
        parentesco: TipoParentesco;
        count: number;
    }>>;
    getFamilyTree(socioId: string): Promise<any>;
    getTiposParentesco(): Promise<TipoParentesco[]>;
    private validateParentesco;
}
//# sourceMappingURL=familiar.service.d.ts.map