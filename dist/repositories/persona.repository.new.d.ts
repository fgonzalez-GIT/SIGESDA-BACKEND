import { PrismaClient, Persona } from '@prisma/client';
import { CreatePersonaDto, PersonaQueryDto, UpdatePersonaDto } from '@/dto/persona.dto.new';
export declare class PersonaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreatePersonaDto): Promise<Persona>;
    findAll(query: PersonaQueryDto): Promise<{
        data: Persona[];
        total: number;
    }>;
    findById(id: number, includeRelations?: boolean): Promise<Persona | null>;
    findByDni(dni: string): Promise<Persona | null>;
    findByEmail(email: string): Promise<Persona | null>;
    update(id: number, data: UpdatePersonaDto): Promise<Persona>;
    hardDelete(id: number): Promise<Persona>;
    softDelete(id: number, motivo?: string): Promise<Persona>;
    findByTipo(tipoPersonaCodigo: string, soloActivos?: boolean): Promise<Persona[]>;
    getSocios(params?: {
        categoriaId?: number;
        activos?: boolean;
        conNumeroSocio?: boolean;
    }): Promise<Persona[]>;
    getDocentes(params?: {
        especialidadId?: number;
        activos?: boolean;
    }): Promise<Persona[]>;
    getProveedores(activos?: boolean): Promise<Persona[]>;
    search(searchTerm: string, tipoPersonaCodigo?: string, limit?: number): Promise<Persona[]>;
    hasTipoActivo(personaId: number, tipoPersonaCodigo: string): Promise<boolean>;
    countTiposActivos(personaId: number): Promise<number>;
    isActiva(personaId: number): Promise<boolean>;
}
//# sourceMappingURL=persona.repository.new.d.ts.map