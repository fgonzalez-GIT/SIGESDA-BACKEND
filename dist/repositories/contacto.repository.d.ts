import { PrismaClient, Prisma } from '@prisma/client';
import { CreateContactoPersonaDto, UpdateContactoPersonaDto } from '@/dto/contacto.dto';
export type ContactoPersonaWithTipo = Prisma.ContactoPersonaGetPayload<{
    include: {
        tipoContacto: true;
    };
}>;
export declare class ContactoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    agregarContacto(personaId: number, data: CreateContactoPersonaDto): Promise<ContactoPersonaWithTipo>;
    getContactosByPersona(personaId: number, soloActivos?: boolean): Promise<ContactoPersonaWithTipo[]>;
    getContactoById(contactoId: number): Promise<ContactoPersonaWithTipo | null>;
    updateContacto(contactoId: number, data: UpdateContactoPersonaDto): Promise<ContactoPersonaWithTipo>;
    eliminarContacto(contactoId: number): Promise<ContactoPersonaWithTipo>;
    eliminarContactoPermanente(contactoId: number): Promise<ContactoPersonaWithTipo>;
    existeContactoDuplicado(personaId: number, valor: string, excludeId?: number): Promise<boolean>;
}
//# sourceMappingURL=contacto.repository.d.ts.map