import { Persona, TipoPersona } from '@prisma/client';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreatePersonaDto, UpdatePersonaDto, PersonaQueryDto } from '@/dto/persona.dto';
export declare class PersonaService {
    private personaRepository;
    constructor(personaRepository: PersonaRepository);
    private addEstadoField;
    createPersona(data: CreatePersonaDto): Promise<Persona & {
        estado: 'activo' | 'inactivo';
    }>;
    getPersonas(query: PersonaQueryDto): Promise<{
        data: (Persona & {
            estado: 'activo' | 'inactivo';
        })[];
        total: number;
        pages: number;
    }>;
    getPersonaById(id: number): Promise<(Persona & {
        estado: 'activo' | 'inactivo';
    }) | null>;
    updatePersona(id: number, data: UpdatePersonaDto): Promise<Persona & {
        estado: 'activo' | 'inactivo';
    }>;
    deletePersona(id: number, hard?: boolean, motivo?: string): Promise<Persona & {
        estado: 'activo' | 'inactivo';
    }>;
    getSocios(categoria?: string, activos?: boolean): Promise<Persona[]>;
    getDocentes(): Promise<Persona[]>;
    getProveedores(): Promise<Persona[]>;
    searchPersonas(searchTerm: string, tipo?: TipoPersona): Promise<Persona[]>;
    checkDniExists(dni: string): Promise<{
        exists: boolean;
        isInactive: boolean;
        persona: Persona | null;
    }>;
    reactivatePersona(id: number, data: UpdatePersonaDto): Promise<Persona>;
}
//# sourceMappingURL=persona.service.d.ts.map