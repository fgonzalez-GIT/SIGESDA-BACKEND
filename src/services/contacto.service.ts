/**
 * Service para gestión de contactos de personas
 * Capa de lógica de negocio para ContactoPersona
 */

import { ContactoRepository, ContactoPersonaWithTipo } from '@/repositories/contacto.repository';
import { CreateContactoPersonaDto, UpdateContactoPersonaDto } from '@/dto/contacto.dto';
import { AppError } from '@/middleware/error.middleware';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';

export class ContactoService {
  private contactoRepository: ContactoRepository;

  constructor(prisma: PrismaClient) {
    this.contactoRepository = new ContactoRepository(prisma);
  }

  /**
   * Agregar contacto a una persona
   * Validaciones adicionales:
   * - Verificar que la persona exista
   * - Prevenir duplicados (mismo valor para misma persona)
   */
  async agregarContacto(personaId: number, data: CreateContactoPersonaDto): Promise<ContactoPersonaWithTipo> {
    // Verificar duplicados
    const existe = await this.contactoRepository.existeContactoDuplicado(personaId, data.valor);
    if (existe) {
      throw new AppError(
        'Ya existe un contacto activo con ese valor para esta persona',
        HttpStatus.CONFLICT
      );
    }

    const contacto = await this.contactoRepository.agregarContacto(personaId, data);

    logger.info(`Contacto agregado a persona ${personaId}`, {
      contactoId: contacto.id,
      tipoContacto: contacto.tipoContacto.codigo,
      principal: contacto.principal
    });

    return contacto;
  }

  /**
   * Obtener contactos de una persona
   */
  async getContactosByPersona(personaId: number, soloActivos: boolean = true): Promise<ContactoPersonaWithTipo[]> {
    return this.contactoRepository.getContactosByPersona(personaId, soloActivos);
  }

  /**
   * Obtener un contacto por ID
   */
  async getContactoById(contactoId: number): Promise<ContactoPersonaWithTipo> {
    const contacto = await this.contactoRepository.getContactoById(contactoId);

    if (!contacto) {
      throw new AppError('Contacto no encontrado', HttpStatus.NOT_FOUND);
    }

    return contacto;
  }

  /**
   * Actualizar contacto
   * Validaciones adicionales:
   * - Prevenir duplicados si cambia el valor
   */
  async updateContacto(contactoId: number, data: UpdateContactoPersonaDto): Promise<ContactoPersonaWithTipo> {
    const contactoActual = await this.getContactoById(contactoId);

    // Si cambia el valor, verificar duplicados
    if (data.valor && data.valor !== contactoActual.valor) {
      const existe = await this.contactoRepository.existeContactoDuplicado(
        contactoActual.personaId,
        data.valor,
        contactoId
      );

      if (existe) {
        throw new AppError(
          'Ya existe un contacto activo con ese valor para esta persona',
          HttpStatus.CONFLICT
        );
      }
    }

    const contacto = await this.contactoRepository.updateContacto(contactoId, data);

    logger.info(`Contacto actualizado`, {
      contactoId: contacto.id,
      tipoContacto: contacto.tipoContacto.codigo
    });

    return contacto;
  }

  /**
   * Eliminar contacto (soft delete)
   */
  async eliminarContacto(contactoId: number): Promise<ContactoPersonaWithTipo> {
    const contacto = await this.contactoRepository.eliminarContacto(contactoId);

    logger.info(`Contacto eliminado (soft delete)`, {
      contactoId: contacto.id,
      tipoContacto: contacto.tipoContacto.codigo
    });

    return contacto;
  }

  /**
   * Eliminar contacto permanentemente (hard delete)
   * ⚠️ Usar solo para administración
   */
  async eliminarContactoPermanente(contactoId: number): Promise<ContactoPersonaWithTipo> {
    const contacto = await this.contactoRepository.eliminarContactoPermanente(contactoId);

    logger.warn(`Contacto eliminado PERMANENTEMENTE`, {
      contactoId: contacto.id,
      tipoContacto: contacto.tipoContacto.codigo
    });

    return contacto;
  }
}
