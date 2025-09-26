import { Persona, TipoPersona } from '@prisma/client';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreatePersonaDto, UpdatePersonaDto, PersonaQueryDto } from '@/dto/persona.dto';
export declare class PersonaService {
    private personaRepository;
    constructor(personaRepository: PersonaRepository);
    createPersona(data: CreatePersonaDto): Promise<Persona>;
    getPersonas(query: PersonaQueryDto): Promise<{
        data: Persona[];
        total: number;
        pages: number;
    }>;
    getPersonaById(id: string): Promise<Persona | null>;
    updatePersona(id: string, data: UpdatePersonaDto): Promise<Persona>;
    deletePersona(id: string, hard?: boolean, motivo?: string): Promise<Persona>;
    getSocios(categoria?: string, activos?: boolean): Promise<Persona[]>;
    getDocentes(): Promise<Persona[]>;
    getProveedores(): Promise<Persona[]>;
    searchPersonas(searchTerm: string, tipo?: TipoPersona): Promise<Persona[]>;
}
//# sourceMappingURL=persona.service.d.ts.map