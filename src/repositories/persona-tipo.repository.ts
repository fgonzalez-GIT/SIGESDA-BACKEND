import { PrismaClient, PersonaTipo, ContactoPersona, TipoPersonaCatalogo, EspecialidadDocente, RazonSocial } from '@prisma/client';
import { CreatePersonaTipoDto, UpdatePersonaTipoDto } from '@/dto/persona-tipo.dto';

export class PersonaTipoRepository {
  constructor(private prisma: PrismaClient) {}

  // ======================================================================
  // GESTIÓN DE TIPOS DE PERSONA
  // ======================================================================

  /**
   * Asignar un tipo a una persona
   */
  async asignarTipo(personaId: number, data: CreatePersonaTipoDto): Promise<PersonaTipo> {
    // Si se proporciona tipoPersonaCodigo, buscar el ID
    let tipoPersonaId = data.tipoPersonaId;

    if (!tipoPersonaId && data.tipoPersonaCodigo) {
      const tipoPersona = await this.prisma.tipoPersonaCatalogo.findUnique({
        where: { codigo: data.tipoPersonaCodigo }
      });

      if (!tipoPersona) {
        throw new Error(`Tipo de persona con código ${data.tipoPersonaCodigo} no encontrado`);
      }

      tipoPersonaId = tipoPersona.id;
    }

    if (!tipoPersonaId) {
      throw new Error('Debe proporcionar tipoPersonaId o tipoPersonaCodigo');
    }

    // Preparar datos para crear
    const createData: any = {
      personaId,
      tipoPersonaId,
      activo: data.activo ?? true,
      observaciones: data.observaciones
    };

    // Agregar campos específicos según el tipo
    if (data.categoriaId) createData.categoriaId = data.categoriaId;
    if (data.numeroSocio) createData.numeroSocio = data.numeroSocio;
    if (data.fechaIngreso) createData.fechaIngreso = new Date(data.fechaIngreso);

    if (data.especialidadId) createData.especialidadId = data.especialidadId;
    if (data.honorariosPorHora) createData.honorariosPorHora = data.honorariosPorHora;

    if (data.cuit) createData.cuit = data.cuit;
    if (data.razonSocialId) createData.razonSocialId = data.razonSocialId;

    return this.prisma.personaTipo.create({
      data: createData,
      include: {
        tipoPersona: true,
        categoria: true,
        especialidad: true
      }
    });
  }

  /**
   * Obtener todos los tipos de una persona
   */
  async findByPersonaId(personaId: number, soloActivos = false): Promise<PersonaTipo[]> {
    const where: any = { personaId };

    if (soloActivos) {
      where.activo = true;
      where.fechaDesasignacion = null;
    }

    return this.prisma.personaTipo.findMany({
      where,
      include: {
        tipoPersona: true,
        categoria: true,
        especialidad: true
      },
      orderBy: {
        fechaAsignacion: 'desc'
      }
    });
  }

  /**
   * Obtener un tipo específico de una persona
   */
  async findByPersonaAndTipo(personaId: number, tipoPersonaId: number): Promise<PersonaTipo | null> {
    return this.prisma.personaTipo.findUnique({
      where: {
        personaId_tipoPersonaId: {
          personaId,
          tipoPersonaId
        }
      },
      include: {
        tipoPersona: true,
        categoria: true,
        especialidad: true
      }
    });
  }

  /**
   * Actualizar un tipo de persona
   */
  async updateTipo(id: number, data: UpdatePersonaTipoDto): Promise<PersonaTipo> {
    const updateData: any = {};

    if (data.activo !== undefined) updateData.activo = data.activo;
    if (data.fechaDesasignacion) updateData.fechaDesasignacion = new Date(data.fechaDesasignacion);
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;

    // Campos específicos de SOCIO
    if (data.categoriaId !== undefined) updateData.categoriaId = data.categoriaId;
    if (data.fechaIngreso) updateData.fechaIngreso = new Date(data.fechaIngreso);
    if (data.fechaBaja) updateData.fechaBaja = new Date(data.fechaBaja);
    if (data.motivoBaja !== undefined) updateData.motivoBaja = data.motivoBaja;

    // Campos específicos de DOCENTE
    if (data.especialidadId !== undefined) updateData.especialidadId = data.especialidadId;
    if (data.honorariosPorHora !== undefined) updateData.honorariosPorHora = data.honorariosPorHora;

    // Campos específicos de PROVEEDOR
    if (data.cuit !== undefined) updateData.cuit = data.cuit;
    if (data.razonSocialId !== undefined) updateData.razonSocialId = data.razonSocialId;

    return this.prisma.personaTipo.update({
      where: { id },
      data: updateData,
      include: {
        tipoPersona: true,
        categoria: true,
        especialidad: true
      }
    });
  }

  /**
   * Desasignar un tipo de persona
   */
  async desasignarTipo(id: number, fechaDesasignacion?: Date): Promise<PersonaTipo> {
    return this.prisma.personaTipo.update({
      where: { id },
      data: {
        activo: false,
        fechaDesasignacion: fechaDesasignacion || new Date()
      },
      include: {
        tipoPersona: true
      }
    });
  }

  /**
   * Eliminar completamente un tipo de persona
   */
  async eliminarTipo(id: number): Promise<PersonaTipo> {
    return this.prisma.personaTipo.delete({
      where: { id }
    });
  }

  /**
   * Verificar si una persona tiene un tipo específico activo
   */
  async tieneTipoActivo(personaId: number, tipoPersonaCodigo: string): Promise<boolean> {
    const count = await this.prisma.personaTipo.count({
      where: {
        personaId,
        activo: true,
        fechaDesasignacion: null,
        tipoPersona: {
          codigo: tipoPersonaCodigo
        }
      }
    });

    return count > 0;
  }

  /**
   * Obtener el siguiente número de socio disponible
   */
  async getNextNumeroSocio(): Promise<number> {
    const lastSocio = await this.prisma.personaTipo.findFirst({
      where: {
        numeroSocio: { not: null }
      },
      orderBy: {
        numeroSocio: 'desc'
      }
    });

    return (lastSocio?.numeroSocio || 0) + 1;
  }

  // ======================================================================
  // CATÁLOGOS
  // ======================================================================

  /**
   * Obtener todos los tipos de persona disponibles
   */
  async getTiposPersona(soloActivos = true): Promise<TipoPersonaCatalogo[]> {
    return this.prisma.tipoPersonaCatalogo.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtener tipo de persona por código
   */
  async getTipoPersonaByCodigo(codigo: string): Promise<TipoPersonaCatalogo | null> {
    return this.prisma.tipoPersonaCatalogo.findUnique({
      where: { codigo }
    });
  }

  /**
   * Obtener todas las especialidades de docentes
   */
  async getEspecialidadesDocentes(soloActivas = true): Promise<EspecialidadDocente[]> {
    return this.prisma.especialidadDocente.findMany({
      where: soloActivas ? { activo: true } : undefined,
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtener especialidad por código
   */
  async getEspecialidadByCodigo(codigo: string): Promise<EspecialidadDocente | null> {
    return this.prisma.especialidadDocente.findUnique({
      where: { codigo }
    });
  }

  /**
   * Obtener todas las razones sociales
   */
  async getRazonesSociales(soloActivas = true): Promise<RazonSocial[]> {
    return this.prisma.razonSocial.findMany({
      where: soloActivas ? { activo: true } : undefined,
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtener razón social por código
   */
  async getRazonSocialByCodigo(codigo: string): Promise<RazonSocial | null> {
    return this.prisma.razonSocial.findUnique({
      where: { codigo }
    });
  }

  // ======================================================================
  // GESTIÓN DE CONTACTOS
  // ======================================================================

  /**
   * Agregar un contacto a una persona
   * @deprecated Usar ContactoRepository en su lugar
   */
  async agregarContacto(personaId: number, data: any): Promise<ContactoPersona> {
    // Si se marca como principal, desmarcar otros contactos del mismo tipo
    if (data.principal && data.tipoContactoId) {
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
      }
    });
  }

  /**
   * Obtener todos los contactos de una persona
   * @deprecated Usar ContactoRepository en su lugar
   */
  async findContactosByPersonaId(personaId: number, soloActivos = false): Promise<ContactoPersona[]> {
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
   * Obtener un contacto específico
   */
  async findContactoById(id: number): Promise<ContactoPersona | null> {
    return this.prisma.contactoPersona.findUnique({
      where: { id }
    });
  }

  /**
   * Actualizar un contacto
   * @deprecated Usar ContactoRepository en su lugar
   */
  async updateContacto(id: number, data: any): Promise<ContactoPersona> {
    const contacto = await this.findContactoById(id);
    if (!contacto) {
      throw new Error(`Contacto con ID ${id} no encontrado`);
    }

    // Si se marca como principal, desmarcar otros del mismo tipo
    if (data.principal) {
      const tipoId = data.tipoContactoId || contacto.tipoContactoId;
      await this.prisma.contactoPersona.updateMany({
        where: {
          personaId: contacto.personaId,
          tipoContactoId: tipoId,
          principal: true,
          id: { not: id }
        },
        data: {
          principal: false
        }
      });
    }

    return this.prisma.contactoPersona.update({
      where: { id },
      data
    });
  }

  /**
   * Eliminar un contacto
   */
  async eliminarContacto(id: number): Promise<ContactoPersona> {
    return this.prisma.contactoPersona.delete({
      where: { id }
    });
  }

  /**
   * Obtener contacto principal por tipo
   */
  async getContactoPrincipal(personaId: number, tipoContacto: string): Promise<ContactoPersona | null> {
    return this.prisma.contactoPersona.findFirst({
      where: {
        personaId,
        tipoContacto: tipoContacto as any,
        principal: true,
        activo: true
      }
    });
  }
}
