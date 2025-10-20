import { PrismaClient, Persona, CategoriaSocio } from '@prisma/client';
import { CreatePersonaDto, PersonaQueryDto } from '@/dto/persona.dto';
export declare class PersonaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreatePersonaDto): Promise<Persona>;
    findAll(query: PersonaQueryDto): Promise<{
        data: Persona[];
        total: number;
    }>;
    findById(id: number): Promise<Persona | null>;
    findByDni(dni: string): Promise<Persona | null>;
    findByEmail(email: string): Promise<Persona | null>;
    update(id: number, data: Partial<CreatePersonaDto>): Promise<Persona>;
    softDelete(id: number, motivo?: string): Promise<Persona>;
    hardDelete(id: number): Promise<Persona>;
    getNextNumeroSocio(): Promise<number>;
    getSocios(categoria?: CategoriaSocio, activos?: boolean): Promise<Persona[]>;
}
//# sourceMappingURL=persona.repository.d.ts.map