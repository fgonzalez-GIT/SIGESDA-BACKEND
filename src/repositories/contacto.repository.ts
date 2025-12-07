/**
 * Repository para gestión de contactos de personas
 * Implementa el patrón Repository para ContactoPersona
 */

import { PrismaClient, ContactoPersona, Prisma } from '@prisma/client';
import { CreateContactoPersonaDto, UpdateContactoPersonaDto } from '@/dto/contacto.dto';
import { AppError } from '@/middleware/error.middleware';
import { HttpStatus } from '@/types/enums';

/**
 * Tipo para ContactoPersona con relación tipoContacto incluida
 */
export type ContactoPersonaWithTipo = Prisma.ContactoPersonaGetPayload<{
  include: { tipoContacto: true };
}>;

export class ContactoRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Agregar contacto a una persona
   * - Valida que el tipo de contacto exista y esté activo
   * - Si se marca como principal, desmarca otros del mismo tipo
   * - Valida formato según pattern del tipo (si existe)
   */
  async agregarContacto(personaId: number, data: CreateContactoPersonaDto): Promise<ContactoPersonaWithTipo> {
    // Verificar que el tipo de contacto existe y está activo
    const tipoContacto = await this.prisma.tipoContactoCatalogo.findUnique({
      where: { id: data.tipoContactoId }
    });

    if (!tipoContacto) {
      throw new AppError('Tipo de contacto no encontrado', HttpStatus.NOT_FOUND);
    }

    if (!tipoContacto.activo) {
      throw new AppError('El tipo de contacto está inactivo', HttpStatus.BAD_REQUEST);
    }

    // Validar formato si el tipo tiene pattern
    if (tipoContacto.pattern) {
      try {
        const regex = new RegExp(tipoContacto.pattern);
        if (!regex.test(data.valor)) {
          throw new AppError(
            `El formato del valor no es válido para ${tipoContacto.nombre}`,
            HttpStatus.BAD_REQUEST
          );
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        // Si el pattern es inválido, log warning pero continuar
        console.warn(`Pattern inválido en tipo ${tipoContacto.codigo}: ${tipoContacto.pattern}`);
      }
    }

    // Si se marca como principal, desmarcar otros del mismo tipo
    if (data.principal) {
      await this.prisma.contactoPersona.updateMany({
        where: {
          personaId,
          tipoContactoId: data.tipoContactoId,
          principal: true
        },
        data: {
          principal: false
        }
      });
    }

    return this.prisma.contactoPersona.create({
      data: {
        personaId,
        tipoContactoId: data.tipoContactoId,
        valor: data.valor,
        principal: data.principal ?? false,
        observaciones: data.observaciones,
        activo: data.activo ?? true
      },
      include: {
        tipoContacto: true
      }
    });
  }

  /**
   * Obtener contactos de una persona
   * @param personaId ID de la persona
   * @param soloActivos Si true, solo devuelve contactos activos
   */
  async getContactosByPersona(personaId: number, soloActivos: boolean = true): Promise<ContactoPersonaWithTipo[]> {
    return this.prisma.contactoPersona.findMany({
      where: {
        personaId,
        ...(soloActivos && { activo: true })
      },
      include: {
        tipoContacto: true
      },
      orderBy: [
        { principal: 'desc' },
        { tipoContacto: { orden: 'asc' } },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Obtener un contacto por ID
   */
  async getContactoById(contactoId: number): Promise<ContactoPersonaWithTipo | null> {
    return this.prisma.contactoPersona.findUnique({
      where: { id: contactoId },
      include: {
        tipoContacto: true
      }
    });
  }

  /**
   * Actualizar contacto
   * - Valida que el tipo exista si se cambia
   * - Valida formato según pattern si se cambia valor o tipo
   * - Si se marca como principal, desmarca otros
   */
  async updateContacto(contactoId: number, data: UpdateContactoPersonaDto): Promise<ContactoPersonaWithTipo> {
    const contacto = await this.prisma.contactoPersona.findUnique({
      where: { id: contactoId },
      include: { tipoContacto: true }
    });

    if (!contacto) {
      throw new AppError('Contacto no encontrado', HttpStatus.NOT_FOUND);
    }

    let tipoContactoNuevo = contacto.tipoContacto;

    // Si cambia tipoContactoId, validar que existe y está activo
    if (data.tipoContactoId && data.tipoContactoId !== contacto.tipoContactoId) {
      const tipo = await this.prisma.tipoContactoCatalogo.findUnique({
        where: { id: data.tipoContactoId }
      });

      if (!tipo) {
        throw new AppError('Tipo de contacto no encontrado', HttpStatus.NOT_FOUND);
      }

      if (!tipo.activo) {
        throw new AppError('El tipo de contacto está inactivo', HttpStatus.BAD_REQUEST);
      }

      tipoContactoNuevo = tipo;
    }

    // Validar formato si cambia valor o tipo
    const valorFinal = data.valor ?? contacto.valor;
    if (tipoContactoNuevo.pattern) {
      try {
        const regex = new RegExp(tipoContactoNuevo.pattern);
        if (!regex.test(valorFinal)) {
          throw new AppError(
            `El formato del valor no es válido para ${tipoContactoNuevo.nombre}`,
            HttpStatus.BAD_REQUEST
          );
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        console.warn(`Pattern inválido en tipo ${tipoContactoNuevo.codigo}: ${tipoContactoNuevo.pattern}`);
      }
    }

    // Si se marca como principal, desmarcar otros del mismo tipo
    if (data.principal) {
      const tipoId = data.tipoContactoId ?? contacto.tipoContactoId;
      await this.prisma.contactoPersona.updateMany({
        where: {
          personaId: contacto.personaId,
          tipoContactoId: tipoId,
          principal: true,
          NOT: { id: contactoId }
        },
        data: { principal: false }
      });
    }

    return this.prisma.contactoPersona.update({
      where: { id: contactoId },
      data,
      include: {
        tipoContacto: true
      }
    });
  }

  /**
   * Eliminar contacto (soft delete)
   */
  async eliminarContacto(contactoId: number): Promise<ContactoPersonaWithTipo> {
    const contacto = await this.getContactoById(contactoId);

    if (!contacto) {
      throw new AppError('Contacto no encontrado', HttpStatus.NOT_FOUND);
    }

    return this.prisma.contactoPersona.update({
      where: { id: contactoId },
      data: { activo: false },
      include: {
        tipoContacto: true
      }
    });
  }

  /**
   * Eliminar contacto permanentemente (hard delete)
   * ⚠️ Usar con precaución - solo para admin
   */
  async eliminarContactoPermanente(contactoId: number): Promise<ContactoPersonaWithTipo> {
    const contacto = await this.getContactoById(contactoId);

    if (!contacto) {
      throw new AppError('Contacto no encontrado', HttpStatus.NOT_FOUND);
    }

    return this.prisma.contactoPersona.delete({
      where: { id: contactoId },
      include: {
        tipoContacto: true
      }
    });
  }

  /**
   * Verificar si existe un contacto con el mismo valor para la misma persona
   */
  async existeContactoDuplicado(personaId: number, valor: string, excludeId?: number): Promise<boolean> {
    const count = await this.prisma.contactoPersona.count({
      where: {
        personaId,
        valor,
        activo: true,
        ...(excludeId && { NOT: { id: excludeId } })
      }
    });

    return count > 0;
  }
}
