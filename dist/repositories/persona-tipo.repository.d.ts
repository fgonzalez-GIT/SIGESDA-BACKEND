import { PrismaClient, PersonaTipo, ContactoPersona, TipoPersonaCatalogo, EspecialidadDocente } from '@prisma/client';
import { CreatePersonaTipoDto, UpdatePersonaTipoDto, CreateContactoPersonaDto, UpdateContactoPersonaDto } from '@/dto/persona-tipo.dto';
export declare class PersonaTipoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    asignarTipo(personaId: number, data: CreatePersonaTipoDto): Promise<PersonaTipo>;
    findByPersonaId(personaId: number, soloActivos?: boolean): Promise<PersonaTipo[]>;
    findByPersonaAndTipo(personaId: number, tipoPersonaId: number): Promise<PersonaTipo | null>;
    updateTipo(id: number, data: UpdatePersonaTipoDto): Promise<PersonaTipo>;
    desasignarTipo(id: number, fechaDesasignacion?: Date): Promise<PersonaTipo>;
    eliminarTipo(id: number): Promise<PersonaTipo>;
    tieneTipoActivo(personaId: number, tipoPersonaCodigo: string): Promise<boolean>;
    getNextNumeroSocio(): Promise<number>;
    getTiposPersona(soloActivos?: boolean): Promise<TipoPersonaCatalogo[]>;
    getTipoPersonaByCodigo(codigo: string): Promise<TipoPersonaCatalogo | null>;
    getEspecialidadesDocentes(soloActivas?: boolean): Promise<EspecialidadDocente[]>;
    getEspecialidadByCodigo(codigo: string): Promise<EspecialidadDocente | null>;
    agregarContacto(personaId: number, data: CreateContactoPersonaDto): Promise<ContactoPersona>;
    findContactosByPersonaId(personaId: number, soloActivos?: boolean): Promise<ContactoPersona[]>;
    findContactoById(id: number): Promise<ContactoPersona | null>;
    updateContacto(id: number, data: UpdateContactoPersonaDto): Promise<ContactoPersona>;
    eliminarContacto(id: number): Promise<ContactoPersona>;
    getContactoPrincipal(personaId: number, tipoContacto: string): Promise<ContactoPersona | null>;
}
//# sourceMappingURL=persona-tipo.repository.d.ts.map