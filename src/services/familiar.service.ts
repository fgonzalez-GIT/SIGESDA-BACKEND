import { Familiar, TipoPersona, TipoParentesco } from '@prisma/client';
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

export class FamiliarService {
  constructor(
    private familiarRepository: FamiliarRepository,
    private personaRepository: PersonaRepository
  ) {}

  async createFamiliar(data: CreateFamiliarDto): Promise<Familiar> {
    // Validate that both persons exist and are SOCIO type
    const [socio, familiar] = await Promise.all([
      this.personaRepository.findById(data.socioId),
      this.personaRepository.findById(data.familiarId)
    ]);

    if (!socio) {
      throw new Error(`Socio con ID ${data.socioId} no encontrado`);
    }

    if (!familiar) {
      throw new Error(`Familiar con ID ${data.familiarId} no encontrado`);
    }

    // Allow family relationships between any type of persons (SOCIO, NO_SOCIO, DOCENTE, ESTUDIANTE, PROVEEDOR)
    // This is more flexible and realistic for family relationships in a conservatory
    // For example: A parent (NO_SOCIO) can have a child (ESTUDIANTE),
    // or two siblings where one is SOCIO and the other is DOCENTE
    logger.info(`Creando relación familiar entre ${socio.nombre} ${socio.apellido} (${socio.tipo}) y ${familiar.nombre} ${familiar.apellido} (${familiar.tipo})`);

    // Both must be active (not have fechaBaja)
    if (socio.fechaBaja) {
      throw new Error(`La persona ${socio.nombre} ${socio.apellido} está dado de baja`);
    }

    if (familiar.fechaBaja) {
      throw new Error(`La persona ${familiar.nombre} ${familiar.apellido} está dado de baja`);
    }

    // Check for existing relationship
    const existingRelation = await this.familiarRepository.findExistingRelation(data.socioId, data.familiarId);
    if (existingRelation) {
      throw new Error(`Ya existe una relación familiar entre ${socio.nombre} ${socio.apellido} y ${familiar.nombre} ${familiar.apellido}`);
    }

    // Validate parentesco logic
    this.validateParentesco(data.parentesco, socio, familiar);

    // Validate descuento range
    if (data.descuento && (data.descuento < 0 || data.descuento > 100)) {
      throw new Error('El descuento debe estar entre 0 y 100');
    }

    const relacion = await this.familiarRepository.create(data);

    logger.info(`Relación familiar creada: ${socio.nombre} ${socio.apellido} - ${data.parentesco} - ${familiar.nombre} ${familiar.apellido} (ID: ${relacion.id}, Descuento: ${data.descuento || 0}%)`);

    return relacion;
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

    const updatedRelacion = await this.familiarRepository.update(id, data);

    logger.info(`Relación familiar actualizada: ID ${id} - Cambios: ${JSON.stringify(data)}`);

    return updatedRelacion;
  }

  async deleteFamiliar(id: number): Promise<Familiar> {
    const existingRelacion = await this.familiarRepository.findById(id);
    if (!existingRelacion) {
      throw new Error(`Relación familiar con ID ${id} no encontrada`);
    }

    const deletedRelacion = await this.familiarRepository.delete(id);

    logger.info(`Relación familiar eliminada: ${existingRelacion.socio.nombre} ${existingRelacion.socio.apellido} - ${existingRelacion.parentesco} - ${existingRelacion.familiar.nombre} ${existingRelacion.familiar.apellido}`);

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
    }

    // Additional validation rules can be added here
  }
}