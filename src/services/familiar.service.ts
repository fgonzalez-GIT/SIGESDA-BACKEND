// @ts-nocheck
import { Familiar, TipoParentesco } from '@prisma/client';
import { TipoPersona } from '@/types/enums';
import { FamiliarRepository } from '@/repositories/familiar.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import {
  CreateFamiliarDto,
  UpdateFamiliarDto,
  FamiliarQueryDto,
  CreateBulkFamiliaresDto,
  DeleteBulkFamiliaresDto,
  FamiliarSearchDto
} from '@/dto/familiar.dto';
import { logger } from '@/utils/logger';
import {
  getParentescoComplementario,
  getParentescoComplementarioConGenero,
  validateParentescoGenero,
  getRelacionBidireccionalDescripcion,
  getGradoParentesco,
  GradoParentesco,
  Genero
} from '@/utils/parentesco.helper';

export class FamiliarService {
  constructor(
    private familiarRepository: FamiliarRepository,
    private personaRepository: PersonaRepository
  ) {}

  async createFamiliar(data: CreateFamiliarDto): Promise<Familiar> {
    // Validate that both persons exist (puede ser cualquier tipo de persona)
    const [personaA, personaB] = await Promise.all([
      this.personaRepository.findById(data.socioId),
      this.personaRepository.findById(data.familiarId)
    ]);

    if (!personaA) {
      throw new Error(`Persona con ID ${data.socioId} no encontrada`);
    }

    if (!personaB) {
      throw new Error(`Persona con ID ${data.familiarId} no encontrada`);
    }

    // Prevent self-reference (una persona no puede ser familiar de sí misma)
    if (data.socioId === data.familiarId) {
      throw new Error('Una persona no puede tener una relación familiar consigo misma');
    }

    // Allow family relationships between ANY type of persons (SOCIO, NO_SOCIO, DOCENTE, PROVEEDOR)
    // Esto es realista para un conservatorio: un padre (NO_SOCIO) puede tener un hijo (SOCIO estudiante),
    // o dos hermanos donde uno es SOCIO y el otro es DOCENTE
    logger.info(`Creando relación familiar BIDIRECCIONAL entre ${personaA.nombre} ${personaA.apellido} (${personaA.tipo}) y ${personaB.nombre} ${personaB.apellido} (${personaB.tipo})`);

    // Both must be active (not have fechaBaja)
    if (personaA.fechaBaja) {
      throw new Error(`La persona ${personaA.nombre} ${personaA.apellido} está dada de baja`);
    }

    if (personaB.fechaBaja) {
      throw new Error(`La persona ${personaB.nombre} ${personaB.apellido} está dada de baja`);
    }

    // Check for existing relationship (bidireccional)
    const existingRelationAB = await this.familiarRepository.findExistingRelation(data.socioId, data.familiarId);
    const existingRelationBA = await this.familiarRepository.findExistingRelation(data.familiarId, data.socioId);

    if (existingRelationAB || existingRelationBA) {
      throw new Error(
        `Ya existe una relación familiar entre ${personaA.nombre} ${personaA.apellido} y ${personaB.nombre} ${personaB.apellido}`
      );
    }

    // Validate parentesco logic (edad, etc.)
    this.validateParentesco(data.parentesco, personaA, personaB);

    // Validate descuento range
    if (data.descuento && (data.descuento < 0 || data.descuento > 100)) {
      throw new Error('El descuento debe estar entre 0 y 100');
    }

    // =========================================================================
    // SINCRONIZACIÓN BIDIRECCIONAL AUTOMÁTICA CON GÉNERO
    // =========================================================================

    // Validar consistencia género-parentesco para persona A (quien inicia la relación)
    const validacionA = validateParentescoGenero(data.parentesco, personaA.genero as Genero);
    if (validacionA.warning) {
      logger.warn(`⚠️  ${validacionA.warning} - Persona: ${personaA.nombre} ${personaA.apellido} (ID: ${personaA.id})`);
    }

    // Obtener el parentesco complementario usando el género de persona B
    const parentescoComplementario = getParentescoComplementarioConGenero(
      data.parentesco,
      personaB.genero as Genero
    );
    const gradoParentesco = getGradoParentesco(data.parentesco);

    // Validar consistencia género-parentesco para persona B (relación inversa)
    const validacionB = validateParentescoGenero(parentescoComplementario, personaB.genero as Genero);
    if (validacionB.warning) {
      logger.warn(`⚠️  ${validacionB.warning} - Persona: ${personaB.nombre} ${personaB.apellido} (ID: ${personaB.id})`);
    }

    // Log informativo sobre género
    logger.info(`   🧬 Género persona A (${personaA.nombre}): ${personaA.genero || 'NO_ESPECIFICADO'}`);
    logger.info(`   🧬 Género persona B (${personaB.nombre}): ${personaB.genero || 'NO_ESPECIFICADO'}`);
    logger.info(`   🔗 Parentesco complementario calculado: ${parentescoComplementario}`);

    // Crear la relación principal (A → B)
    const relacionPrincipal = await this.familiarRepository.create(data);

    // Crear automáticamente la relación inversa (B → A)
    const relacionInversa = await this.familiarRepository.create({
      socioId: data.familiarId,
      familiarId: data.socioId,
      parentesco: parentescoComplementario,
      descuento: data.descuento || 0, // Mismo descuento en ambas direcciones
      permisoResponsableFinanciero: data.permisoResponsableFinanciero || false,
      permisoContactoEmergencia: data.permisoContactoEmergencia || false,
      permisoAutorizadoRetiro: data.permisoAutorizadoRetiro || false,
      descripcion: data.descripcion
        ? `${data.descripcion} [Relación complementaria de ID ${relacionPrincipal.id}]`
        : `Relación complementaria automática de ID ${relacionPrincipal.id}`,
      grupoFamiliarId: data.grupoFamiliarId
    });

    const descripcionBidireccional = getRelacionBidireccionalDescripcion(
      `${personaA.nombre} ${personaA.apellido}`,
      data.parentesco,
      `${personaB.nombre} ${personaB.apellido}`
    );

    // Log detallado con atención especial si hay socios involucrados
    const tieneSocios = personaA.tipo === 'SOCIO' || personaB.tipo === 'SOCIO';
    const logPrefix = tieneSocios ? '💰' : '👥';

    logger.info(`${logPrefix} Relación familiar bidireccional creada: ${descripcionBidireccional}`);
    logger.info(`   ➤ Relación A→B (ID: ${relacionPrincipal.id}): ${personaA.nombre} [${personaA.tipo}] → ${data.parentesco} → ${personaB.nombre} [${personaB.tipo}]`);
    logger.info(`   ➤ Relación B→A (ID: ${relacionInversa.id}): ${personaB.nombre} [${personaB.tipo}] → ${parentescoComplementario} → ${personaA.nombre} [${personaA.tipo}]`);
    logger.info(`   ➤ Grado: ${gradoParentesco}`);

    if (tieneSocios) {
      logger.info(`   💰 NOTA: Relación involucra SOCIO(S) - Aplicable para beneficios de cuota familiar`);
      if (data.descuento && data.descuento > 0) {
        logger.info(`   💰 Descuento familiar aplicado: ${data.descuento}%`);
      }
      if (data.grupoFamiliarId) {
        logger.info(`   💰 Grupo familiar asignado: ${data.grupoFamiliarId}`);
      }
    }

    return relacionPrincipal;
  }

  async getFamiliares(query: FamiliarQueryDto): Promise<{ data: Familiar[]; total: number; pages: number }> {
    const result = await this.familiarRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  async getFamiliarById(id: number): Promise<Familiar | null> {
    return this.familiarRepository.findById(id);
  }

  async getFamiliarsBySocio(socioId: number, includeInactivos = false): Promise<Familiar[]> {
    // Validate persona exists
    const persona = await this.personaRepository.findById(socioId);
    if (!persona) {
      throw new Error(`Persona con ID ${socioId} no encontrada`);
    }

    // Note: We allow both SOCIO and NO_SOCIO to have familiares
    // This is more flexible for family relationships

    return this.familiarRepository.findBySocioId(socioId, includeInactivos);
  }

  async updateFamiliar(id: number, data: UpdateFamiliarDto): Promise<Familiar> {
    const existingRelacion = await this.familiarRepository.findById(id);
    if (!existingRelacion) {
      throw new Error(`Relación familiar con ID ${id} no encontrada`);
    }

    // If updating parentesco, validate the new relationship
    if (data.parentesco) {
      this.validateParentesco(data.parentesco, existingRelacion.socio as any, existingRelacion.familiar as any);
    }

    // Validate descuento range if provided
    if (data.descuento !== undefined && (data.descuento < 0 || data.descuento > 100)) {
      throw new Error('El descuento debe estar entre 0 y 100');
    }

    // =========================================================================
    // SINCRONIZACIÓN BIDIRECCIONAL AUTOMÁTICA EN ACTUALIZACIÓN
    // =========================================================================

    // Buscar la relación inversa
    const relacionInversa = await this.familiarRepository.findInverseRelation(id);

    // Actualizar la relación principal
    const updatedRelacion = await this.familiarRepository.update(id, data);

    // Si existe relación inversa, sincronizar los cambios
    if (relacionInversa) {
      const updateDataInversa: any = {};

      // Sincronizar descuento (mismo valor en ambas direcciones)
      if (data.descuento !== undefined) {
        updateDataInversa.descuento = data.descuento;
      }

      // Sincronizar permisos (mismos permisos en ambas direcciones)
      if (data.permisoResponsableFinanciero !== undefined) {
        updateDataInversa.permisoResponsableFinanciero = data.permisoResponsableFinanciero;
      }
      if (data.permisoContactoEmergencia !== undefined) {
        updateDataInversa.permisoContactoEmergencia = data.permisoContactoEmergencia;
      }
      if (data.permisoAutorizadoRetiro !== undefined) {
        updateDataInversa.permisoAutorizadoRetiro = data.permisoAutorizadoRetiro;
      }

      // Sincronizar grupo familiar (mismo grupo en ambas direcciones)
      if (data.grupoFamiliarId !== undefined) {
        updateDataInversa.grupoFamiliarId = data.grupoFamiliarId;
      }

      // Sincronizar estado activo (si se desactiva una relación, la inversa también)
      if (data.activo !== undefined) {
        updateDataInversa.activo = data.activo;
      }

      // Si se cambió el parentesco, actualizar el complementario en la relación inversa usando género
      if (data.parentesco) {
        // Obtener personas para acceder al género
        const personaA = await this.personaRepository.findById(existingRelacion.socioId);
        const personaB = await this.personaRepository.findById(existingRelacion.familiarId);

        if (personaA && personaB) {
          // Validar consistencia género-parentesco
          const validacionA = validateParentescoGenero(data.parentesco, personaA.genero as Genero);
          if (validacionA.warning) {
            logger.warn(`⚠️  ${validacionA.warning} - Persona: ${personaA.nombre} ${personaA.apellido} (ID: ${personaA.id})`);
          }

          // Calcular parentesco complementario con género
          const parentescoComplementario = getParentescoComplementarioConGenero(
            data.parentesco,
            personaB.genero as Genero
          );
          updateDataInversa.parentesco = parentescoComplementario;

          // Validar consistencia género-parentesco para relación inversa
          const validacionB = validateParentescoGenero(parentescoComplementario, personaB.genero as Genero);
          if (validacionB.warning) {
            logger.warn(`⚠️  ${validacionB.warning} - Persona: ${personaB.nombre} ${personaB.apellido} (ID: ${personaB.id})`);
          }

          logger.info(`   🔗 Parentesco complementario actualizado: ${parentescoComplementario} (género B: ${personaB.genero || 'NO_ESPECIFICADO'})`);
        } else {
          // Fallback a lógica sin género si no se encuentran las personas
          updateDataInversa.parentesco = getParentescoComplementario(data.parentesco);
          logger.warn(`⚠️  No se pudo obtener género de personas - Usando lógica de parentesco sin género`);
        }
      }

      // Sincronizar descripción si se modificó
      if (data.descripcion !== undefined) {
        updateDataInversa.descripcion = data.descripcion
          ? `${data.descripcion} [Relación complementaria de ID ${id}]`
          : `Relación complementaria automática de ID ${id}`;
      }

      // Actualizar la relación inversa
      await this.familiarRepository.update(relacionInversa.id, updateDataInversa);

      logger.info(`✅ Relación familiar actualizada BIDIRECCIONALMENTE: ID ${id} ↔ ID ${relacionInversa.id}`);
      logger.info(`   Cambios sincronizados: ${JSON.stringify(data)}`);
    } else {
      logger.warn(`⚠️  Relación inversa no encontrada para ID ${id} - Actualización NO sincronizada`);
      logger.info(`Relación familiar actualizada: ID ${id} - Cambios: ${JSON.stringify(data)}`);
    }

    return updatedRelacion;
  }

  async deleteFamiliar(id: number): Promise<Familiar> {
    const existingRelacion = await this.familiarRepository.findById(id);
    if (!existingRelacion) {
      throw new Error(`Relación familiar con ID ${id} no encontrada`);
    }

    // =========================================================================
    // SINCRONIZACIÓN BIDIRECCIONAL AUTOMÁTICA EN ELIMINACIÓN
    // =========================================================================

    // Buscar la relación inversa ANTES de eliminar la principal
    const relacionInversa = await this.familiarRepository.findInverseRelation(id);

    // Guardar info de la relación inversa antes de eliminarla
    let relacionInversaInfo = null;
    if (relacionInversa) {
      relacionInversaInfo = {
        id: relacionInversa.id,
        socioNombre: relacionInversa.socio?.nombre || 'N/A',
        socioApellido: relacionInversa.socio?.apellido || 'N/A',
        parentesco: relacionInversa.parentesco,
        familiarNombre: relacionInversa.familiar?.nombre || 'N/A',
        familiarApellido: relacionInversa.familiar?.apellido || 'N/A'
      };
    }

    // Eliminar la relación principal
    const deletedRelacion = await this.familiarRepository.delete(id);

    // Si existe relación inversa, eliminarla también
    if (relacionInversa) {
      await this.familiarRepository.delete(relacionInversa.id);

      logger.info(`✅ Relación familiar eliminada BIDIRECCIONALMENTE:`);
      logger.info(`   ➤ Relación A→B (ID: ${id}): ${existingRelacion.socio?.nombre || 'N/A'} ${existingRelacion.socio?.apellido || 'N/A'} → ${existingRelacion.parentesco} → ${existingRelacion.familiar?.nombre || 'N/A'} ${existingRelacion.familiar?.apellido || 'N/A'}`);
      if (relacionInversaInfo) {
        logger.info(`   ➤ Relación B→A (ID: ${relacionInversaInfo.id}): ${relacionInversaInfo.socioNombre} ${relacionInversaInfo.socioApellido} → ${relacionInversaInfo.parentesco} → ${relacionInversaInfo.familiarNombre} ${relacionInversaInfo.familiarApellido}`);
      }
    } else {
      logger.warn(`⚠️  Relación inversa no encontrada para ID ${id} - Eliminación NO sincronizada`);
      logger.info(`Relación familiar eliminada: ${existingRelacion.socio?.nombre || 'N/A'} ${existingRelacion.socio?.apellido || 'N/A'} - ${existingRelacion.parentesco} - ${existingRelacion.familiar?.nombre || 'N/A'} ${existingRelacion.familiar?.apellido || 'N/A'}`);
    }

    return deletedRelacion;
  }

  async createBulkFamiliares(data: CreateBulkFamiliaresDto): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    const validFamiliares: CreateFamiliarDto[] = [];

    // Validate each relationship
    for (const familiar of data.familiares) {
      try {
        // Check if persons exist and are SOCIO
        const [socio, familiarPerson] = await Promise.all([
          this.personaRepository.findById(familiar.socioId),
          this.personaRepository.findById(familiar.familiarId)
        ]);

        if (!socio || socio.fechaBaja) {
          errors.push(`Persona ${familiar.socioId} no encontrada o inactiva`);
          continue;
        }

        if (!familiarPerson || familiarPerson.fechaBaja) {
          errors.push(`Persona ${familiar.familiarId} no encontrada o inactiva`);
          continue;
        }

        // At least one must be SOCIO
        const isSocioRelation = socio.tipo === TipoPersona.SOCIO || familiarPerson.tipo === TipoPersona.SOCIO;
        if (!isSocioRelation) {
          errors.push(`Al menos una de las personas debe ser un socio (${familiar.socioId} y ${familiar.familiarId})`);
          continue;
        }

        // Check existing relationship
        const existing = await this.familiarRepository.findExistingRelation(familiar.socioId, familiar.familiarId);
        if (existing) {
          errors.push(`Relación ya existe entre ${socio.nombre} ${socio.apellido} y ${familiarPerson.nombre} ${familiarPerson.apellido}`);
          continue;
        }

        validFamiliares.push(familiar);
      } catch (error) {
        errors.push(`Error validando relación ${familiar.socioId}-${familiar.familiarId}: ${error}`);
      }
    }

    // Create valid relationships
    const result = validFamiliares.length > 0
      ? await this.familiarRepository.createBulk(validFamiliares)
      : { count: 0 };

    logger.info(`Creación masiva de familiares: ${result.count} creados, ${errors.length} errores`);

    return {
      count: result.count,
      errors
    };
  }

  async deleteBulkFamiliares(data: DeleteBulkFamiliaresDto): Promise<{ count: number }> {
    const result = await this.familiarRepository.deleteBulk(data.ids);

    logger.info(`Eliminación masiva de familiares: ${result.count} eliminados`);

    return result;
  }

  async searchFamiliares(searchData: FamiliarSearchDto): Promise<Familiar[]> {
    return this.familiarRepository.search(searchData);
  }

  async getParentescoStats(): Promise<Array<{ parentesco: TipoParentesco; count: number }>> {
    return this.familiarRepository.getParentescoStats();
  }

  async getFamilyTree(socioId: number): Promise<any> {
    // Validate persona exists
    const persona = await this.personaRepository.findById(socioId);
    if (!persona) {
      throw new Error(`Persona con ID ${socioId} no encontrada`);
    }

    const familyTree = await this.familiarRepository.getFamilyTree(socioId);

    return {
      ...familyTree,
      persona: {
        id: persona.id,
        tipo: persona.tipo,
        nombre: persona.nombre,
        apellido: persona.apellido,
        dni: persona.dni,
        numeroSocio: persona.numeroSocio
      }
    };
  }

  async getTiposParentesco(): Promise<TipoParentesco[]> {
    return Object.values(TipoParentesco);
  }

  // Helper method to validate parentesco relationships
  private validateParentesco(parentesco: TipoParentesco, socio: any, familiar: any): void {
    // =========================================================================
    // VALIDACIÓN GÉNERO-PARENTESCO
    // =========================================================================
    const validacionGenero = validateParentescoGenero(parentesco, socio.genero as Genero);
    if (validacionGenero.warning) {
      logger.warn(`⚠️  ${validacionGenero.warning} - Persona: ${socio.nombre} ${socio.apellido} (ID: ${socio.id})`);
    }

    // =========================================================================
    // VALIDACIÓN EDAD-PARENTESCO
    // =========================================================================
    // Basic business rules for parentesco validation
    // This can be extended with more complex family relationship logic

    // Example: If setting someone as HIJO/HIJA, the familiar should be younger
    // Note: This is a simplified example - real family relationships are more complex

    if (socio.fechaNacimiento && familiar.fechaNacimiento) {
      const socioAge = new Date().getFullYear() - new Date(socio.fechaNacimiento).getFullYear();
      const familiarAge = new Date().getFullYear() - new Date(familiar.fechaNacimiento).getFullYear();

      if ((parentesco === TipoParentesco.HIJO || parentesco === TipoParentesco.HIJA) && familiarAge >= socioAge) {
        logger.warn(`Advertencia: Se está estableciendo como ${parentesco} a una persona de edad similar o mayor`);
      }

      if ((parentesco === TipoParentesco.PADRE || parentesco === TipoParentesco.MADRE) && familiarAge <= socioAge) {
        logger.warn(`Advertencia: Se está estableciendo como ${parentesco} a una persona de edad similar o menor`);
      }

      // Validación para relaciones maritales (CONYUGE, ESPOSA, ESPOSO)
      if ((parentesco === TipoParentesco.CONYUGE ||
           parentesco === TipoParentesco.ESPOSA ||
           parentesco === TipoParentesco.ESPOSO) &&
          Math.abs(socioAge - familiarAge) > 25) {
        logger.warn(
          `Advertencia: Gran diferencia de edad entre cónyuges ` +
          `(${Math.abs(socioAge - familiarAge)} años de diferencia)`
        );
      }
    }

    // Additional validation rules can be added here
  }
}