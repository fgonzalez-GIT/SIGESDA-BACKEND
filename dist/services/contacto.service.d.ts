import { ContactoPersonaWithTipo } from '@/repositories/contacto.repository';
import { CreateContactoPersonaDto, UpdateContactoPersonaDto } from '@/dto/contacto.dto';
import { PrismaClient } from '@prisma/client';
export declare class ContactoService {
    private contactoRepository;
    constructor(prisma: PrismaClient);
    agregarContacto(personaId: number, data: CreateContactoPersonaDto): Promise<ContactoPersonaWithTipo>;
    getContactosByPersona(personaId: number, soloActivos?: boolean): Promise<ContactoPersonaWithTipo[]>;
    getContactoById(contactoId: number): Promise<ContactoPersonaWithTipo>;
    updateContacto(contactoId: number, data: UpdateContactoPersonaDto): Promise<ContactoPersonaWithTipo>;
    eliminarContacto(contactoId: number): Promise<ContactoPersonaWithTipo>;
    eliminarContactoPermanente(contactoId: number): Promise<ContactoPersonaWithTipo>;
}
//# sourceMappingURL=contacto.service.d.ts.map