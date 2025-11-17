// @ts-nocheck
import { PersonaTipo, ContactoPersona, TipoPersonaCatalogo, EspecialidadDocente, RazonSocial, PrismaClient } from '@prisma/client';
import { PersonaTipoRepository } from '@/repositories/persona-tipo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import {
  CreatePersonaTipoDto,
  UpdatePersonaTipoDto,
  CreateContactoPersonaDto,
  UpdateContactoPersonaDto,
  validatePersonaTipoData
} from '@/dto/persona-tipo.dto';
import { logger } from '@/utils/logger';
import { AppError } from '@/middleware/error.middleware';
import { HttpStatus } from '@/types/enums';
import { canAgregarTipo } from '@/utils/persona.helper';
import { prisma } from '@/config/database';

export class PersonaTipoService {
  private prisma: PrismaClient;

  constructor(
    private personaTipoRepository: PersonaTipoRepository,
    private personaRepository: PersonaRepository
  ) {
    this.prisma = prisma;
  }

  // ======================================================================
  // GESTIÓN DE TIPOS DE PERSONA
  // ======================================================================

  /**
   * Asignar un tipo a una persona
   */
  async asignarTipo(personaId: number, data: CreatePersonaTipoDto): Promise<PersonaTipo> {
    // Verificar que la persona existe
    const persona = await this.personaRepository.findById(personaId, false);
    if (!persona) {
      throw new AppError(`Persona con ID ${personaId} no encontrada`, HttpStatus.NOT_FOUND);
    }

    // Obtener el código del tipo
    let tipoPersonaCodigo = data.tipoPersonaCodigo;

    if (!tipoPersonaCodigo && data.tipoPersonaId) {
      const tipoCatalogo = await this.personaTipoRepository.getTiposPersona(false);
      const tipo = tipoCatalogo.find(t => t.id === data.tipoPersonaId);
      if (!tipo) {
        throw new AppError(`Tipo de persona con ID ${data.tipoPersonaId} no encontrado`, HttpStatus.NOT_FOUND);
      }
      tipoPersonaCodigo = tipo.codigo as any;
    }

    if (!tipoPersonaCodigo) {
      throw new AppError('Debe proporcionar tipoPersonaId o tipoPersonaCodigo', HttpStatus.BAD_REQUEST);
    }

    // Validar datos específicos según el tipo
    const validation = validatePersonaTipoData(tipoPersonaCodigo, data);
    if (!validation.valid) {
      throw new AppError(
        `Datos inválidos para tipo ${tipoPersonaCodigo}: ${validation.errors.join(', ')}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Verificar que no existe ya este tipo asignado
    const tieneYa = await this.personaTipoRepository.tieneTipoActivo(personaId, tipoPersonaCodigo);
    if (tieneYa) {
      throw new AppError(
        `La persona ya tiene el tipo ${tipoPersonaCodigo} asignado`,
        HttpStatus.CONFLICT
      );
    }

    // =========================================================================
    // VALIDACIÓN: TIPOS MUTUAMENTE EXCLUYENTES (SOCIO y NO_SOCIO)
    // =========================================================================
    // Obtener tipos activos actuales de la persona
    const tiposActivos = await this.personaTipoRepository.findByPersonaId(personaId, true);
    const tiposActivosCodigos = tiposActivos.map(t => t.tipoPersona.codigo);

    // Validar que el nuevo tipo no sea excluyente con los tipos existentes
    const validacion = canAgregarTipo(tiposActivosCodigos, tipoPersonaCodigo);

    // Si requiere auto-reemplazo, desasignar tipos conflictivos primero
    if (validacion.requiresAutoReplace && validacion.tiposAReemplazar && validacion.tiposAReemplazar.length > 0) {
      logger.info(`Auto-reemplazando tipos mutuamente excluyentes para persona ${personaId}: ${validacion.tiposAReemplazar.join(', ')} → ${tipoPersonaCodigo}`);

      // Desasignar cada tipo conflictivo
      for (const tipoConflictivo of validacion.tiposAReemplazar) {
        const tipoActivoConflictivo = tiposActivos.find(t => t.tipoPersona.codigo === tipoConflictivo);
        if (tipoActivoConflictivo) {
          await this.personaTipoRepository.desasignarTipo(tipoActivoConflictivo.id, new Date());
          logger.info(`Tipo ${tipoConflictivo} auto-desasignado de persona ${personaId} debido a exclusión mutua con ${tipoPersonaCodigo}`);
        }
      }
    } else if (!validacion.valid) {
      // Solo lanzar error si la validación falló por otra razón (no debería ocurrir con la nueva lógica)
      throw new AppError(validacion.error!, HttpStatus.CONFLICT);
    }

    // Si es SOCIO y no tiene numeroSocio, asignar el siguiente
    if (tipoPersonaCodigo === 'SOCIO' && !data.numeroSocio) {
      const nextNumero = await this.personaTipoRepository.getNextNumeroSocio();
      (data as any).numeroSocio = nextNumero;
      logger.info(`Auto-asignado número de socio: ${nextNumero} a persona ${personaId}`);
    }

    // Si es SOCIO y no tiene fechaIngreso, asignar fecha actual
    if (tipoPersonaCodigo === 'SOCIO' && !data.fechaIngreso) {
      (data as any).fechaIngreso = new Date().toISOString();
    }

    // Si no tiene categoría, asignar categoría ACTIVO (primera categoría)
    if (tipoPersonaCodigo === 'SOCIO' && !data.categoriaId) {
      const categoriaActivo = await this.prisma.categoriaSocio.findFirst({
        where: { codigo: 'ACTIVO', activa: true }
      });
      if (categoriaActivo) {
        (data as any).categoriaId = categoriaActivo.id;
        logger.info(`Auto-asignada categoría ACTIVO a socio persona ${personaId}`);
      } else {
        throw new AppError('No se encontró categoría ACTIVO para asignar', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    // Si es DOCENTE y no tiene especialidad, asignar primera especialidad activa
    if (tipoPersonaCodigo === 'DOCENTE' && !data.especialidadId) {
      const especialidad = await this.prisma.especialidadDocente.findFirst({
        where: { activo: true },
        orderBy: { orden: 'asc' }
      });
      if (especialidad) {
        (data as any).especialidadId = especialidad.id;
        logger.info(`Auto-asignada especialidad ${especialidad.nombre} a docente persona ${personaId}`);
      } else {
        throw new AppError('No se encontró especialidad activa para asignar', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    const personaTipo = await this.personaTipoRepository.asignarTipo(personaId, data);

    logger.info(`Tipo ${tipoPersonaCodigo} asignado a persona ${personaId}`);

    return personaTipo;
  }

  /**
   * Obtener todos los tipos de una persona
   */
  async getTiposByPersona(personaId: number, soloActivos = false): Promise<PersonaTipo[]> {
    const persona = await this.personaRepository.findById(personaId, false);
    if (!persona) {
      throw new AppError(`Persona con ID ${personaId} no encontrada`, HttpStatus.NOT_FOUND);
    }

    return this.personaTipoRepository.findByPersonaId(personaId, soloActivos);
  }

  /**
   * Actualizar datos de un tipo de persona
   */
  async updateTipo(personaTipoId: number, data: UpdatePersonaTipoDto): Promise<PersonaTipo> {
    // Buscar el PersonaTipo por su ID (ID de la tabla intermedia)
    const personaTipo = await this.prisma.personaTipo.findUnique({
      where: { id: personaTipoId }
    });

    if (!personaTipo) {
      throw new AppError(`Tipo de persona con ID ${personaTipoId} no encontrado`, HttpStatus.NOT_FOUND);
    }

    const updated = await this.personaTipoRepository.updateTipo(personaTipoId, data);

    logger.info(`Tipo de persona ${personaTipoId} actualizado`);

    return updated;
  }

  /**
   * Desasignar un tipo de persona
   */
  async desasignarTipo(
    personaId: number,
    tipoPersonaId: number,
    fechaDesasignacion?: Date
  ): Promise<PersonaTipo> {
    const personaTipo = await this.personaTipoRepository.findByPersonaAndTipo(
      personaId,
      tipoPersonaId
    );

    if (!personaTipo) {
      throw new AppError(
        `Tipo de persona no encontrado para persona ${personaId}`,
        HttpStatus.NOT_FOUND
      );
    }

    if (!personaTipo.activo) {
      throw new AppError('Este tipo ya está desasignado', HttpStatus.BAD_REQUEST);
    }

    // Verificar que no es el único tipo activo
    const tiposActivos = await this.personaTipoRepository.findByPersonaId(personaId, true);
    if (tiposActivos.length === 1) {
      throw new AppError(
        'No se puede desasignar el único tipo activo. Una persona debe tener al menos un tipo.',
        HttpStatus.BAD_REQUEST
      );
    }

    const desasignado = await this.personaTipoRepository.desasignarTipo(
      personaTipo.id,
      fechaDesasignacion
    );

    logger.info(`Tipo ${personaTipo.tipoPersona.codigo} desasignado de persona ${personaId}`);

    return desasignado;
  }

  /**
   * Eliminar completamente un tipo (hard delete)
   */
  async eliminarTipo(personaId: number, tipoPersonaId: number): Promise<PersonaTipo> {
    const personaTipo = await this.personaTipoRepository.findByPersonaAndTipo(
      personaId,
      tipoPersonaId
    );

    if (!personaTipo) {
      throw new AppError(
        `Tipo de persona no encontrado para persona ${personaId}`,
        HttpStatus.NOT_FOUND
      );
    }

    // Verificar que no es el único tipo
    const tipos = await this.personaTipoRepository.findByPersonaId(personaId, false);
    if (tipos.length === 1) {
      throw new AppError(
        'No se puede eliminar el único tipo. Una persona debe tener al menos un tipo.',
        HttpStatus.BAD_REQUEST
      );
    }

    const eliminado = await this.personaTipoRepository.eliminarTipo(personaTipo.id);

    logger.info(`Tipo ${personaTipo.tipoPersona.codigo} eliminado de persona ${personaId}`);

    return eliminado;
  }

  // ======================================================================
  // GESTIÓN DE CONTACTOS
  // ======================================================================

  /**
   * Agregar un contacto a una persona
   */
  async agregarContacto(personaId: number, data: CreateContactoPersonaDto): Promise<ContactoPersona> {
    const persona = await this.personaRepository.findById(personaId, false);
    if (!persona) {
      throw new AppError(`Persona con ID ${personaId} no encontrada`, HttpStatus.NOT_FOUND);
    }

    const contacto = await this.personaTipoRepository.agregarContacto(personaId, data);

    logger.info(`Contacto ${data.tipoContacto} agregado a persona ${personaId}`);

    return contacto;
  }

  /**
   * Obtener todos los contactos de una persona
   */
  async getContactosByPersona(personaId: number, soloActivos = false): Promise<ContactoPersona[]> {
    const persona = await this.personaRepository.findById(personaId, false);
    if (!persona) {
      throw new AppError(`Persona con ID ${personaId} no encontrada`, HttpStatus.NOT_FOUND);
    }

    return this.personaTipoRepository.findContactosByPersonaId(personaId, soloActivos);
  }

  /**
   * Actualizar un contacto
   */
  async updateContacto(contactoId: number, data: UpdateContactoPersonaDto): Promise<ContactoPersona> {
    const contacto = await this.personaTipoRepository.findContactoById(contactoId);
    if (!contacto) {
      throw new AppError(`Contacto con ID ${contactoId} no encontrado`, HttpStatus.NOT_FOUND);
    }

    const updated = await this.personaTipoRepository.updateContacto(contactoId, data);

    logger.info(`Contacto ${contactoId} actualizado`);

    return updated;
  }

  /**
   * Eliminar un contacto
   */
  async eliminarContacto(contactoId: number): Promise<ContactoPersona> {
    const contacto = await this.personaTipoRepository.findContactoById(contactoId);
    if (!contacto) {
      throw new AppError(`Contacto con ID ${contactoId} no encontrado`, HttpStatus.NOT_FOUND);
    }

    const eliminado = await this.personaTipoRepository.eliminarContacto(contactoId);

    logger.info(`Contacto ${contactoId} eliminado`);

    return eliminado;
  }

  // ======================================================================
  // CATÁLOGOS
  // ======================================================================

  /**
   * Obtener todos los tipos de persona disponibles
   */
  async getTiposPersona(soloActivos = true): Promise<TipoPersonaCatalogo[]> {
    return this.personaTipoRepository.getTiposPersona(soloActivos);
  }

  /**
   * Obtener tipo de persona por código
   */
  async getTipoPersonaByCodigo(codigo: string): Promise<TipoPersonaCatalogo | null> {
    const tipo = await this.personaTipoRepository.getTipoPersonaByCodigo(codigo);
    if (!tipo) {
      throw new AppError(`Tipo de persona con código ${codigo} no encontrado`, HttpStatus.NOT_FOUND);
    }
    return tipo;
  }

  /**
   * Obtener todas las especialidades de docentes
   */
  async getEspecialidadesDocentes(soloActivas = true): Promise<EspecialidadDocente[]> {
    return this.personaTipoRepository.getEspecialidadesDocentes(soloActivas);
  }

  /**
   * Obtener especialidad por código
   */
  async getEspecialidadByCodigo(codigo: string): Promise<EspecialidadDocente | null> {
    const especialidad = await this.personaTipoRepository.getEspecialidadByCodigo(codigo);
    if (!especialidad) {
      throw new AppError(`Especialidad con código ${codigo} no encontrada`, HttpStatus.NOT_FOUND);
    }
    return especialidad;
  }

  /**
   * Obtener todas las razones sociales
   */
  async getRazonesSociales(soloActivas = true): Promise<RazonSocial[]> {
    return this.personaTipoRepository.getRazonesSociales(soloActivas);
  }

  /**
   * Obtener razón social por código
   */
  async getRazonSocialByCodigo(codigo: string): Promise<RazonSocial | null> {
    const razon = await this.personaTipoRepository.getRazonSocialByCodigo(codigo);
    if (!razon) {
      throw new AppError(`Razón social con código ${codigo} no encontrada`, HttpStatus.NOT_FOUND);
    }
    return razon;
  }
}

/**
 * Helper para validar datos de tipo de persona
 */
function validatePersonaTipoData(tipoPersonaCodigo: string, data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (tipoPersonaCodigo) {
    case 'SOCIO':
      // categoriaId se auto-asigna si no está presente
      break;

    case 'DOCENTE':
      // especialidadId se auto-asigna si no está presente
      break;

    case 'PROVEEDOR':
      if (!data.cuit) {
        errors.push('PROVEEDOR requiere CUIT');
      }
      if (!data.razonSocialId) {
        errors.push('PROVEEDOR requiere razón social');
      }
      break;

    case 'NO_SOCIO':
      // No requiere campos adicionales
      break;

    default:
      errors.push(`Tipo de persona inválido: ${tipoPersonaCodigo}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
