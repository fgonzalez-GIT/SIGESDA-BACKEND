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
    findById(id: number): Promise<Familiar | null>;
    findBySocioId(socioId: number, includeInactivos?: boolean): Promise<Familiar[]>;
    findByFamiliarId(familiarId: number, includeInactivos?: boolean): Promise<Familiar[]>;
    findExistingRelation(socioId: number, familiarId: number): Promise<Familiar | null>;
    update(id: number, data: {
        parentesco?: TipoParentesco;
        descripcion?: string | null;
        permisoResponsableFinanciero?: boolean;
        permisoContactoEmergencia?: boolean;
        permisoAutorizadoRetiro?: boolean;
        descuento?: number;
        activo?: boolean;
        grupoFamiliarId?: number | null;
    }): Promise<Familiar>;
    delete(id: number): Promise<Familiar>;
    deleteBulk(ids: number[]): Promise<{
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
    getFamilyTree(socioId: number): Promise<any>;
}
//# sourceMappingURL=familiar.repository.d.ts.map