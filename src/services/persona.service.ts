import { Persona } from '@prisma/client';
import { PersonaRepository } from '@/repositories/persona.repository';
import { PersonaTipoRepository } from '@/repositories/persona-tipo.repository';
import { CreatePersonaDto, UpdatePersonaDto, PersonaQueryDto } from '@/dto/persona.dto';
import { logger } from '@/utils/logger';
import { AppError } from '@/middleware/error.middleware';
import { HttpStatus } from '@/types/enums';
import { validateTiposMutuamenteExcluyentes } from '@/utils/persona.helper';

export class PersonaService {
  constructor(
    private personaRepository: PersonaRepository,
    private personaTipoRepository: PersonaTipoRepository
  ) {}

  // ======================================================================
  // CRUD PRINCIPAL
  // ======================================================================

  /**
   * Crear persona con tipos y contactos
   */
  async createPersona(data: CreatePersonaDto): Promise<Persona> {
    // Validar DNI único
    const existingDni = await this.personaRepository.findByDni(data.dni);
    if (existingDni) {
      throw new AppError(`Ya existe una persona con DNI ${data.dni}`, HttpStatus.CONFLICT);
    }

    // Validar email único (si se proporciona)
    if (data.email) {
      const existingEmail = await this.personaRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError(`Ya existe una persona con email ${data.email}`, HttpStatus.CONFLICT);
      }
    }

    // Procesar tipos
    const tipos = data.tipos || [];

    // Si no se especifica ningún tipo, asignar NO_SOCIO por defecto
    if (tipos.length === 0) {
      tipos.push({
        tipoPersonaCodigo: 'NO_SOCIO'
      } as any);
    }

    // =========================================================================
    // VALIDACIÓN: TIPOS MUTUAMENTE EXCLUYENTES (SOCIO y NO_SOCIO)
    // =========================================================================
    // Obtener todos los códigos de tipos que se van a asignar
    const tiposCodigos: string[] = [];
    for (const tipo of tipos) {
      let tipoCodigo = tipo.tipoPersonaCodigo;

      // Si no tiene código pero tiene ID, obtener el código del catálogo
      if (!tipoCodigo && tipo.tipoPersonaId) {
        const tiposCatalogo = await this.personaTipoRepository.getTiposPersona(false);
        const tipoCatalogo = tiposCatalogo.find(t => t.id === tipo.tipoPersonaId);
        if (tipoCatalogo) {
          tipoCodigo = tipoCatalogo.codigo as any;
        }
      }

      if (tipoCodigo) {
        tiposCodigos.push(tipoCodigo);
      }
    }

    // Validar que no se intenten asignar tipos mutuamente excluyentes
    const validacion = validateTiposMutuamenteExcluyentes(tiposCodigos);
    if (!validacion.valid) {
      throw new AppError(validacion.error!, HttpStatus.BAD_REQUEST);
    }

    // Procesar cada tipo para agregar defaults
    for (const tipo of tipos) {
      // Obtener código del tipo
      let tipoCodigo = tipo.tipoPersonaCodigo;

      if (!tipoCodigo && tipo.tipoPersonaId) {
        const tiposCatalogo = await this.personaTipoRepository.getTiposPersona(false);
        const tipoCatalogo = tiposCatalogo.find(t => t.id === tipo.tipoPersonaId);
        if (tipoCatalogo) {
          tipoCodigo = tipoCatalogo.codigo as any;
        }
      }

      // Auto-asignar defaults según tipo
      if (tipoCodigo === 'SOCIO') {
        // Auto-asignar número de socio si no se proporciona
        if (!tipo.numeroSocio) {
          const nextNumero = await this.personaTipoRepository.getNextNumeroSocio();
          tipo.numeroSocio = nextNumero;
        }

        // Auto-asignar categoría GENERAL si no se proporciona
        if (!tipo.categoriaId) {
          tipo.categoriaId = 1;
        }

        // Auto-asignar fecha de ingreso si no se proporciona
        if (!tipo.fechaIngreso) {
          tipo.fechaIngreso = new Date().toISOString();
        }
      }

      if (tipoCodigo === 'DOCENTE') {
        // Auto-asignar especialidad GENERAL si no se proporciona
        if (!tipo.especialidadId) {
          tipo.especialidadId = 1;
        }
      }

      if (tipoCodigo === 'PROVEEDOR') {
        // PROVEEDOR requiere CUIT y razón social (se valida en DTO)
        if (!tipo.cuit || !tipo.razonSocial) {
          throw new AppError(
            'El tipo PROVEEDOR requiere CUIT y razón social',
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }

    // Crear persona con tipos y contactos
    const persona = await this.personaRepository.create({
      ...data,
      tipos,
      contactos: data.contactos || []
    });

    logger.info(`Persona creada: ${persona.nombre} ${persona.apellido} (ID: ${persona.id})`);

    return persona;
  }

  /**
   * Obtener personas con filtros
   */
  async getPersonas(query: PersonaQueryDto): Promise<{
    data: Persona[];
    total: number;
    pages: number;
    page: number;
  }> {
    const result = await this.personaRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      data: result.data,
      total: result.total,
      pages,
      page: query.page
    };
  }

  /**
   * Obtener persona por ID
   */
  async getPersonaById(id: number, includeRelations = true): Promise<Persona | null> {
    const persona = await this.personaRepository.findById(id, includeRelations);

    if (!persona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    return persona;
  }

  /**
   * Actualizar datos base de persona
   */
  async updatePersona(id: number, data: UpdatePersonaDto): Promise<Persona> {
    // Verificar que existe
    const existingPersona = await this.personaRepository.findById(id, false);
    if (!existingPersona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    // Validar DNI único si se actualiza
    if (data.dni && data.dni !== existingPersona.dni) {
      const existingDni = await this.personaRepository.findByDni(data.dni);
      if (existingDni) {
        throw new AppError(`Ya existe una persona con DNI ${data.dni}`, HttpStatus.CONFLICT);
      }
    }

    // Validar email único si se actualiza
    if (data.email && data.email !== existingPersona.email) {
      const existingEmail = await this.personaRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError(`Ya existe una persona con email ${data.email}`, HttpStatus.CONFLICT);
      }
    }

    const updatedPersona = await this.personaRepository.update(id, data);

    logger.info(`Persona actualizada: ${updatedPersona.nombre} ${updatedPersona.apellido} (ID: ${id})`);

    return updatedPersona;
  }

  /**
   * Eliminar persona
   */
  async deletePersona(id: number, hard = false, motivo?: string): Promise<Persona> {
    const existingPersona = await this.personaRepository.findById(id, false);
    if (!existingPersona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    let deletedPersona: Persona;

    if (hard) {
      // Hard delete: eliminar completamente
      deletedPersona = await this.personaRepository.hardDelete(id);
      logger.info(`Persona eliminada (hard): ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
    } else {
      // Soft delete: desactivar todos los tipos
      deletedPersona = await this.personaRepository.softDelete(id, motivo);
      logger.info(`Persona desactivada (soft): ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
    }

    return deletedPersona;
  }

  // ======================================================================
  // BÚSQUEDAS ESPECÍFICAS
  // ======================================================================

  /**
   * Buscar personas por texto
   */
  async searchPersonas(searchTerm: string, tipoPersonaCodigo?: string, limit = 20): Promise<Persona[]> {
    return this.personaRepository.search(searchTerm, tipoPersonaCodigo, limit);
  }

  /**
   * Obtener socios
   */
  async getSocios(params?: {
    categoriaId?: number;
    activos?: boolean;
    conNumeroSocio?: boolean;
  }): Promise<Persona[]> {
    return this.personaRepository.getSocios(params);
  }

  /**
   * Obtener docentes
   */
  async getDocentes(params?: {
    especialidadId?: number;
    activos?: boolean;
  }): Promise<Persona[]> {
    return this.personaRepository.getDocentes(params);
  }

  /**
   * Obtener proveedores
   */
  async getProveedores(activos = true): Promise<Persona[]> {
    return this.personaRepository.getProveedores(activos);
  }

  /**
   * Obtener personas por tipo
   */
  async getPersonasByTipo(tipoPersonaCodigo: string, soloActivos = true): Promise<Persona[]> {
    return this.personaRepository.findByTipo(tipoPersonaCodigo, soloActivos);
  }

  // ======================================================================
  // UTILIDADES
  // ======================================================================

  /**
   * Verificar si existe persona con DNI
   */
  async checkDniExists(dni: string): Promise<{
    exists: boolean;
    isActive: boolean;
    persona: Persona | null;
  }> {
    const persona = await this.personaRepository.findByDni(dni);

    if (!persona) {
      return {
        exists: false,
        isActive: false,
        persona: null
      };
    }

    const isActive = await this.personaRepository.isActiva(persona.id);

    return {
      exists: true,
      isActive,
      persona
    };
  }

  /**
   * Reactivar persona (agregar tipo NO_SOCIO si no tiene tipos activos)
   */
  async reactivatePersona(id: number, data?: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.personaRepository.findById(id, true);
    if (!persona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    // Verificar si ya está activa
    const isActive = await this.personaRepository.isActiva(id);
    if (isActive) {
      throw new AppError(`La persona con ID ${id} ya está activa`, HttpStatus.BAD_REQUEST);
    }

    // Actualizar datos si se proporcionan
    if (data) {
      await this.updatePersona(id, data);
    }

    // Asignar tipo NO_SOCIO por defecto
    await this.personaTipoRepository.asignarTipo(id, {
      tipoPersonaCodigo: 'NO_SOCIO'
    });

    const reactivatedPersona = await this.personaRepository.findById(id, true);

    logger.info(`Persona reactivada: ${reactivatedPersona!.nombre} ${reactivatedPersona!.apellido} (ID: ${id})`);

    return reactivatedPersona!;
  }

  /**
   * Verificar si persona tiene tipo específico activo
   */
  async hasTipoActivo(personaId: number, tipoPersonaCodigo: string): Promise<boolean> {
    return this.personaRepository.hasTipoActivo(personaId, tipoPersonaCodigo);
  }

  /**
   * Obtener estado de persona (activo/inactivo)
   */
  async getEstadoPersona(personaId: number): Promise<{
    activa: boolean;
    tiposActivos: number;
    tiposInactivos: number;
  }> {
    const tiposActivos = await this.personaRepository.countTiposActivos(personaId);
    const todosTipos = await this.personaTipoRepository.findByPersonaId(personaId, false);

    return {
      activa: tiposActivos > 0,
      tiposActivos,
      tiposInactivos: todosTipos.length - tiposActivos
    };
  }
}
