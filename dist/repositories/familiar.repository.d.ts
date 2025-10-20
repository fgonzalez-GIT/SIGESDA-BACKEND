import { PrismaClient, Familiar, TipoParentesco } from '@prisma/client';
import { CreateFamiliarDto, FamiliarQueryDto, FamiliarSearchDto } from '@/dto/familiar.dto';
export declare class FamiliarRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateFamiliarDto): Promise<Familiar>;
    findAll(query: FamiliarQueryDto): Promise<{
        data: Familiar[];
        total: number;
    }>;
    findById(id: string): Promise<Familiar | null>;
    findBySocioId(socioId: string, includeInactivos?: boolean): Promise<Familiar[]>;
    findByFamiliarId(familiarId: string, includeInactivos?: boolean): Promise<Familiar[]>;
    findExistingRelation(socioId: string, familiarId: string): Promise<Familiar | null>;
    update(id: string, data: {
        parentesco?: TipoParentesco;
    }): Promise<Familiar>;
    delete(id: string): Promise<Familiar>;
    deleteBulk(ids: string[]): Promise<{
        count: number;
    }>;
    createBulk(familiares: CreateFamiliarDto[]): Promise<{
        count: number;
    }>;
    search(searchData: FamiliarSearchDto): Promise<Familiar[]>;
    getParentescoStats(): Promise<Array<{
        parentesco: TipoParentesco;
        count: number;
    }>>;
    getFamilyTree(socioId: string): Promise<any>;
}
//# sourceMappingURL=familiar.repository.d.ts.map