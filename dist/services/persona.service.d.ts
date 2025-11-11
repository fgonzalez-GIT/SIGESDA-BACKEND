import { Persona } from '@prisma/client';
import { PersonaRepository } from '@/repositories/persona.repository';
import { PersonaTipoRepository } from '@/repositories/persona-tipo.repository';
import { CreatePersonaDto, UpdatePersonaDto, PersonaQueryDto } from '@/dto/persona.dto';
export declare class PersonaService {
    private personaRepository;
    private personaTipoRepository;
    private prisma;
    constructor(personaRepository: PersonaRepository, personaTipoRepository: PersonaTipoRepository);
    createPersona(data: CreatePersonaDto): Promise<Persona>;
    getPersonas(query: PersonaQueryDto): Promise<{
        data: Persona[];
        total: number;
        pages: number;
        page: number;
    }>;
    getPersonaById(id: number, includeRelations?: boolean): Promise<Persona | null>;
    updatePersona(id: number, data: UpdatePersonaDto): Promise<Persona>;
    deletePersona(id: number, hard?: boolean, motivo?: string): Promise<Persona>;
    searchPersonas(searchTerm: string, tipoPersonaCodigo?: string, limit?: number): Promise<Persona[]>;
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
    getPersonasByTipo(tipoPersonaCodigo: string, soloActivos?: boolean): Promise<Persona[]>;
    checkDniExists(dni: string): Promise<{
        exists: boolean;
        isActive: boolean;
        persona: Persona | null;
    }>;
    reactivatePersona(id: number, data?: UpdatePersonaDto): Promise<Persona>;
    hasTipoActivo(personaId: number, tipoPersonaCodigo: string): Promise<boolean>;
    getEstadoPersona(personaId: number): Promise<{
        activa: boolean;
        tiposActivos: number;
        tiposInactivos: number;
    }>;
}
//# sourceMappingURL=persona.service.d.ts.map