import { PersonaTipo, ContactoPersona, TipoPersonaCatalogo, EspecialidadDocente } from '@prisma/client';
import { PersonaTipoRepository } from '@/repositories/persona-tipo.repository';
import { PersonaRepository } from '@/repositories/persona.repository.new';
import { CreatePersonaTipoDto, UpdatePersonaTipoDto, CreateContactoPersonaDto, UpdateContactoPersonaDto } from '@/dto/persona-tipo.dto';
export declare class PersonaTipoService {
    private personaTipoRepository;
    private personaRepository;
    constructor(personaTipoRepository: PersonaTipoRepository, personaRepository: PersonaRepository);
    asignarTipo(personaId: number, data: CreatePersonaTipoDto): Promise<PersonaTipo>;
    getTiposByPersona(personaId: number, soloActivos?: boolean): Promise<PersonaTipo[]>;
    updateTipo(personaTipoId: number, data: UpdatePersonaTipoDto): Promise<PersonaTipo>;
    desasignarTipo(personaId: number, tipoPersonaId: number, fechaDesasignacion?: Date): Promise<PersonaTipo>;
    eliminarTipo(personaId: number, tipoPersonaId: number): Promise<PersonaTipo>;
    agregarContacto(personaId: number, data: CreateContactoPersonaDto): Promise<ContactoPersona>;
    getContactosByPersona(personaId: number, soloActivos?: boolean): Promise<ContactoPersona[]>;
    updateContacto(contactoId: number, data: UpdateContactoPersonaDto): Promise<ContactoPersona>;
    eliminarContacto(contactoId: number): Promise<ContactoPersona>;
    getTiposPersona(soloActivos?: boolean): Promise<TipoPersonaCatalogo[]>;
    getTipoPersonaByCodigo(codigo: string): Promise<TipoPersonaCatalogo | null>;
    getEspecialidadesDocentes(soloActivas?: boolean): Promise<EspecialidadDocente[]>;
    getEspecialidadByCodigo(codigo: string): Promise<EspecialidadDocente | null>;
}
//# sourceMappingURL=persona-tipo.service.d.ts.map